const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const messageQueue = require('../messageQueue'); // Import the shared messageQueue module
const fs = require('fs'); // Needed to potentially handle file streams if required by axios

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiGatewayUrl = process.env.API_GATEWAY_URL;

// Temporary storage for conversation context
const conversationContext = {};

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

console.log('Telegram bot started polling...');

// Listener for voice messages
// Add a general text message listener for natural language commands
bot.on('text', async (msg) => {
 const chatId = msg.chat.id;
 const text = msg.text;

 // Ignore commands or specific handlers
 if (text.startsWith('/') || conversationContext[chatId]) {
 return;
 }

  // Pass text directly for NLU processing
  try {
    // Send text to the AI Gateway's NLU endpoint
    const nluResponse = await axios.post(`${apiGatewayUrl}/ai/nlu`, { text: text }, {
 headers: {
 'Content-Type': 'application/json'
 }
    });
    await handleNaturalLanguageCommand(chatId, nluResponse.data); // Pass the full NLU result object
  } catch (error) {
    console.error(`Error sending text for NLU to API Gateway for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not process your request due to an internal error.');
  }
});
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;

  try {
    // Get the file link from Telegram
    const fileLink = await bot.getFileLink(fileId);

    // Download the audio file
    const response = await axios({
      method: 'get',
      url: fileLink,
      responseType: 'stream' // Important for handling large audio files
    });

    // Prepare data for the STT request.
    // Depending on the AI service and API Gateway setup,
    // you might need to read the stream into a buffer or send the stream directly.
    // For this example, we'll assume sending the stream is acceptable.
    const audioData = response.data;

    // Send audio data to the AI Gateway's STT endpoint
    const sttResponse = await axios.post(`${apiGatewayUrl}/ai/stt`, audioData, {
      headers: {
        'Content-Type': 'audio/ogg' // Or the actual audio format
        // Add any necessary authorization headers for the API Gateway here
        // 'Authorization': 'Bearer your_api_gateway_token'
      }
    });

    // Assuming the STT response is directly the transcription text for simplicity
    // Adjust based on actual AI response structure
    const transcription = sttResponse.data.transcription || sttResponse.data; 

    console.log(`Transcription for chat ${chatId}: ${transcription}`);
    // Further processing: send transcription to NLU

    // Acknowledge receipt of the voice message
    await bot.sendMessage(chatId, 'Voice message received and transcribed. Processing...');

    // Send transcribed text to the AI Gateway's NLU endpoint
    // Pass the transcribed text for NLU processing
    const nluResponse = await axios.post(`${apiGatewayUrl}/ai/nlu`, { text: transcription }, {
 headers: {
 'Content-Type': 'application/json'
 }
    });

    // Assuming NLU response structure: { intent: 'record_payment', entities: { representative: 'آقای بهرامی', amount: '1000000' }, confidence: 0.9 }
    await handleNaturalLanguageCommand(chatId, nluResponse.data); // Pass the full NLU result object

  } catch (error) {
    console.error(`Error processing voice message for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not process your voice message.');
  }
});

// Function to handle NLU processing and command routing from text or voice
async function handleNaturalLanguageCommand(chatId, text) {
  try {
    // Adjust based on actual NLU response structure
    const nluResult = nluResponse.data;

    console.log(`NLU result for chat ${chatId}:`, nluResult);

    // Interpret NLU results and initiate workflow based on intent
    // This is where the core logic for handling various intents will reside
    if (nluResult.intent === 'record_payment' && nluResult.entities && nluResult.entities.representative && nluResult.entities.amount) {
      const representative = nluResult.entities.representative;
      const amount = nluResult.entities.amount;
      const currency = nluResult.entities.currency || 'Tomans'; // Assume default currency if not provided

      const confirmationMessage = `Confirm recording a payment of ${amount} ${currency} for Representative ${representative}?`;

      // Store context for confirmation callback
      conversationContext[chatId] = {
        intent: 'record_payment',
        entities: nluResult.entities
      };

      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Confirm', callback_data: 'confirm_action' }, { text: 'Cancel', callback_data: 'cancel_action' }]
          ]
        }
      };

      await bot.sendMessage(chatId, confirmationMessage, options);
    }
    // Add conditions for other supported intents
    else if (nluResult.intent === 'check_balance' && nluResult.entities && nluResult.entities.representative) {
      // const representative = nluResult.entities.representative; // Using the entity name directly might be confusing, let's use representative_name or representative_id from NLU entity definition
      await handleCheckBalance(chatId, nluResult.entities);

    }
 else if (nluResult.intent === 'get_invoice_history' && nluResult.entities && (nluResult.entities.representative_name || nluResult.entities.representative_id)) {
 await handleGetInvoiceHistory(chatId, nluResult.entities);
    // else if (nluResult.intent === 'list_representatives') {
 } else if (nluResult.intent === 'get_payment_history' && nluResult.entities && (nluResult.entities.representative_name || nluResult.entities.representative_id)) {
 await handleGetPaymentHistory(chatId, nluResult.entities);
 // else if (nluResult.intent === 'list_representatives') {
    } else if (nluResult.intent === 'list_representatives') {
 await handleListRepresentatives(chatId, nluResult.entities);
 // } else if (nluResult.intent === 'list_sales_partners') {
    } else if (nluResult.intent === 'list_sales_partners') {
 await handleListSalesPartners(chatId, nluResult.entities);
    } else if (nluResult.intent === 'get_sales_partner_commission' && nluResult.entities && (nluResult.entities.sales_partner_name || nluResult.entities.sales_partner_id)) {
      await handleGetSalesPartnerCommission(chatId, nluResult.entities);
    else if (nluResult.intent) {
    } else if (nluResult.intent === 'generate_invoices') {
      await handleGenerateInvoices(chatId, nluResult.entities);
    }  else if (nluResult.intent) {
      // If intent is not recognized or required entities are missing
      // TODO: Implement more specific checks for required entities for each intent
      // If entities are missing, initiate a clarification sub-flow
      // Example: If intent is 'record_payment' but amount is missing, ask "How much was the payment?"
      await bot.sendMessage(chatId, `I recognized the intent "${nluResult.intent}", but I couldn't fully process it. Some information might be missing or I need clarification.`);
    } else {
      await bot.sendMessage(chatId, 'Sorry, I could not understand the accounting action you requested or some information is missing. Please try rephrasing your request.');
    }

  } catch (error) {
    console.error(`Error processing natural language command for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
  }
}

// Add asynchronous placeholder functions for handling specific intents
async function handleCheckBalance(chatId, entities) {
  // Implement the `handleCheckBalance(chatId, entities)` function. Extract `representative_name` or `representative_id` from the `entities` object.
  // ... (Existing implementation for handleCheckBalance) ...

 try {
    const representativeIdentifier = entities.representative_name || entities.representative_id;

    if (!representativeIdentifier) {
      await bot.sendMessage(chatId, 'Please specify which representative\'s balance you want to check.');
 // Store context for potential multi-turn clarification
 conversationContext[chatId] = {
 intent: 'check_balance',
 // Store any other relevant entities if needed for clarification follow-up
      };
      return;
    }

    // This is a critical step requiring interaction with Representative Management Service
 // Resolve representative name/identifier to a system representative ID
 const representativeResolveResponse = await axios.post(`${apiGatewayUrl}/representatives/resolve`, { identifier: representativeIdentifier }, {
      // Add any necessary authorization headers for the API Gateway here
    });

 const { representative_id, name: representativeName } = representativeResolveResponse.data;

 if (!representative_id) {
 await bot.sendMessage(chatId, `Could not find a representative matching "${representativeIdentifier}". Please check the name or ID.`);
 return;
    }

    // Call Representative Management Service via API Gateway to get the balance
    const balanceResponse = await axios.get(`${apiGatewayUrl}/representatives/${representative_id}/balance`, {
      // Add any necessary authorization headers for the API Gateway here
    });

    // Assuming response structure: { representative: { name: '...', id: '...' }, balance: '...' }
 const { balance } = balanceResponse.data;

    await bot.sendMessage(chatId, `The current balance for ${representativeName} is ${balance}.`);
 delete conversationContext[chatId]; // Clean up context after successful execution
  } catch (error) {
    console.error(`Error checking balance for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the balance. Please ensure the representative name or ID is correct.');
  }
}

async function handleGetInvoiceHistory(chatId, entities) {
  try {
    const representativeIdentifier = entities.representative_name || entities.representative_id;
 const timePeriod = entities.time_period; // Optional, NLU should extract

    if (!representativeIdentifier) {
      await bot.sendMessage(chatId, 'Please specify which representative\'s invoice history you want to see.');
 // Store context for potential multi-turn clarification
 conversationContext[chatId] = {
 intent: 'get_invoice_history',
 // Store any other relevant entities if needed for clarification follow-up
      };
      return;
    }

    // Resolve representative name/identifier to a system representative ID
    const representativeResolveResponse = await axios.post(`${apiGatewayUrl}/representatives/resolve`, { identifier: representativeIdentifier }, {
      // Add any necessary authorization headers for the API Gateway here
    });

    const { representative_id, name: representativeName } = representativeResolveResponse.data;

    if (!representative_id) {
      await bot.sendMessage(chatId, `Could not find a representative matching "${representativeIdentifier}". Please check the name or ID.`);
      return;
    }

    // Call Reporting Service via API Gateway to get invoice history
    const invoiceHistoryResponse = await axios.get(`${apiGatewayUrl}/reports/representative/${representative_id}/invoices`, {
      params: { time_period: timePeriod }, // Pass optional time period as query parameter
      // Add any necessary authorization headers for the API Gateway here
    });

    const invoices = invoiceHistoryResponse.data;

    if (invoices.length === 0) {
      await bot.sendMessage(chatId, `No invoices found for ${representativeName}${timePeriod ? ' for ' + timePeriod : ''}.`);
    } else {
 // Format the invoices into a readable string
      const formattedHistory = invoices.map(invoice =>
        `*Invoice #${invoice.id}*\nPeriod: ${invoice.period_start} - ${invoice.period_end}\nAmount Due: ${invoice.amount_due} | Paid: ${invoice.amount_paid} | Outstanding: ${invoice.outstanding_balance}\n`
 ).join('\n');
      // Format and send the invoice history
      await bot.sendMessage(chatId, `Invoice History for ${representativeName}${timePeriod ? ' for ' + timePeriod : ''}:\n\n${formattedHistory}`);
    }
 delete conversationContext[chatId]; // Clean up context after successful execution

  } catch (error) {
    console.error(`Error getting invoice history for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the invoice history.');
  }
}

async function handleGetPaymentHistory(chatId, entities) {
  try {
    const representativeIdentifier = entities.representative_name || entities.representative_id;
    const timePeriod = entities.time_period; // Optional, NLU should extract

    if (!representativeIdentifier) {
      await bot.sendMessage(chatId, 'Please specify which representative\'s payment history you want to see.');
      // Store context for potential multi-turn clarification
      conversationContext[chatId] = {
        intent: 'get_payment_history',
        // Store any other relevant entities if needed for clarification follow-up
      };
      return;
    }

    // Resolve representative name/identifier to a system representative ID
    const representativeResolveResponse = await axios.post(`${apiGatewayUrl}/representatives/resolve`, { identifier: representativeIdentifier }, {
      // Add any necessary authorization headers for the API Gateway here
    });

    const { representative_id, name: representativeName } = representativeResolveResponse.data;

    if (!representative_id) {
      await bot.sendMessage(chatId, `Could not find a representative matching "${representativeIdentifier}". Please check the name or ID.`);
      return;
    }

    // Call Reporting Service via API Gateway to get payment history
    const paymentHistoryResponse = await axios.get(`${apiGatewayUrl}/reports/representative/${representative_id}/payments`, {
      params: { time_period: timePeriod }, // Pass optional time period as query parameter
      // Add any necessary authorization headers for the API Gateway here
    });

    const payments = paymentHistoryResponse.data;

    if (payments.length === 0) {
      await bot.sendMessage(chatId, `No payments found for ${representativeName}${timePeriod ? ' for ' + timePeriod : ''}.`);
    } else {
      // Format the payments into a readable string
      const formattedHistory = payments.map(payment =>
        `*Payment ID: ${payment.id}*\nDate: ${payment.payment_date}\nAmount: ${payment.amount}\nNotes: ${payment.notes || 'N/A'}\n`
      ).join('\n');
      // Format and send the payment history
      await bot.sendMessage(chatId, `Payment History for ${representativeName}${timePeriod ? ' for ' + timePeriod : ''}:\n\n${formattedHistory}`);
    }
    delete conversationContext[chatId]; // Clean up context after successful execution
  } catch (error) {
    console.error(`Error getting payment history for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the payment history.');
  }
}

async function handleListRepresentatives(chatId, entities) {
  try {
    // Call Representative Management Service via API Gateway to get the list of representatives
    const representativesResponse = await axios.get(`${apiGatewayUrl}/representatives`, {
      // Add any necessary authorization headers for the API Gateway here
    });

    const representatives = representativesResponse.data;

    if (!representatives || representatives.length === 0) {
      await bot.sendMessage(chatId, 'No representatives found.');
    } else {
      // Format the list of representatives into a readable string
      const formattedList = representatives.map(rep =>
        `*${rep.name || 'Unnamed Representative'}* (ID: ${rep.id})\nCurrent Balance: ${rep.current_balance || 'N/A'}\n`
      ).join('\n');

      // Telegram message character limit consideration: if the list is too long,
      // consider splitting into multiple messages or providing a file export option.
      // For now, assuming the list is reasonably sized.
      await bot.sendMessage(chatId, `List of Representatives:\n\n${formattedList}`);
    }

    delete conversationContext[chatId]; // Clean up context after successful execution

  } catch (error) {
    console.error(`Error listing representatives for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the list of representatives.');
  }
}

async function handleListSalesPartners(chatId, entities) {
  try {
    // Call Sales Partner Management Service via API Gateway to get the list of sales partners
    const salesPartnersResponse = await axios.get(`${apiGatewayUrl}/sales-partners`, {
      // Add any necessary authorization headers for the API Gateway here
    });

    const salesPartners = salesPartnersResponse.data;

    if (!salesPartners || salesPartners.length === 0) {
      await bot.sendMessage(chatId, 'No sales partners found.');
    } else {
      // Format the list of sales partners into a readable string
      const formattedList = salesPartners.map(partner =>
        `*${partner.name || 'Unnamed Sales Partner'}* (ID: ${partner.id})\nCommission Rate: ${partner.commission_rate || 'N/A'}\n`
      ).join('\n');

      await bot.sendMessage(chatId, `List of Sales Partners:\n\n${formattedList}`);
    }

    delete conversationContext[chatId]; // Clean up context after successful execution

  } catch (error) {
    console.error(`Error listing sales partners for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the list of sales partners.');
  }
}

async function handleGetSalesPartnerCommission(chatId, entities) {
  try {
    const salesPartnerIdentifier = entities.sales_partner_name || entities.sales_partner_id;

    if (!salesPartnerIdentifier) {
      await bot.sendMessage(chatId, 'Please specify which sales partner\'s commission you want to check.');
      // Store context for potential multi-turn clarification
      conversationContext[chatId] = {
        intent: 'get_sales_partner_commission',
        // Store any other relevant entities if needed for clarification follow-up
      };
      return;
    }

    // This is a critical step requiring interaction with Sales Partner Management Service
    // Resolve sales partner name/identifier to a system sales partner ID
    const salesPartnerResolveResponse = await axios.post(`${apiGatewayUrl}/sales-partners/resolve`, { identifier: salesPartnerIdentifier }, {
      // Add any necessary authorization headers for the API Gateway here
    });

    const { sales_partner_id, name: salesPartnerName } = salesPartnerResolveResponse.data;

    if (!sales_partner_id) {
      await bot.sendMessage(chatId, `Could not find a sales partner matching "${salesPartnerIdentifier}". Please check the name or ID.`);
      return;
    }

    // Call Sales Partner Management Service via API Gateway to get the sales partner details (including commission)
    const salesPartnerResponse = await axios.get(`${apiGatewayUrl}/sales-partners/${sales_partner_id}`, {
      // Add any necessary authorization headers for the API Gateway here
    });

    // Assuming response structure includes a 'total_earned_commission' field
    const { total_earned_commission } = salesPartnerResponse.data;

    await bot.sendMessage(chatId, `The total earned commission for ${salesPartnerName} is ${total_earned_commission || 'N/A'}.`);
    delete conversationContext[chatId]; // Clean up context after successful execution
  } catch (error) {
    console.error(`Error checking sales partner commission for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, I could not retrieve the sales partner commission.');
  }
}

async function handleGenerateInvoices(chatId, entities) {
  try {
    // Publish a message to the invoice generation queue
    await messageQueue.publishMessage('invoice_generation_queue', {
      trigger: 'manual', // Indicate manual trigger from Telegram bot
      userId: chatId // Pass the chat ID for potential feedback mechanisms later
    });

    await bot.sendMessage(chatId, 'Invoice generation process initiated. I will notify you when it is completed.');
  } catch (error) {
    console.error(`Error initiating invoice generation for chat ${chatId}:`, error);
    await bot.sendMessage(chatId, 'Sorry, there was an error initiating the invoice generation process.');
  }
}
// Basic error handling for polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Listener for inline keyboard button presses (confirmation)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Answer the callback query to remove the loading state on the button
 await bot.answerCallbackQuery(callbackQuery.id);

  const context = conversationContext[chatId];

  if (!context) {
    await bot.sendMessage(chatId, 'Action expired or not found.');
 await bot.deleteMessage(chatId, messageId).catch(console.error); // Clean up expired message
    return;
  }

  // Edit the confirmation message to indicate processing or cancellation
  if (data === 'cancel_action') {
 await bot.editMessageText('Action cancelled.', { chat_id: chatId, message_id: messageId }).catch(console.error);
 delete conversationContext[chatId]; // Clean up context
    return; // Exit early if cancelled
  }
 await bot.editMessageText('Processing your request...', { chat_id: chatId, message_id: messageId }).catch(console.error);

  try {
    // Extract necessary data from context entities
    const { representative, amount } = context.entities;
    const telegramUserId = callbackQuery.from.id; // Administrator's Telegram User ID

    // Resolve representative name/identifier to a system representative ID
    const representativeResolveResponse = await axios.post(`${apiGatewayUrl}/representatives/resolve`, { identifier: representative });
    const representativeId = representativeResolveResponse.data.representative_id;
    const representativeName = representativeResolveResponse.data.name; // Get resolved name for success message

    if (!representativeId) {
 await bot.editMessageText(`Could not find representative "${representative}". Action failed.`, { chat_id: chatId, message_id: messageId }).catch(console.error);
 return;
    }

    if (context.intent === 'record_payment') {
      // Call Payment Processing Service via API Gateway to record the payment
      const paymentResponse = await axios.post(`${apiGatewayUrl}/payments/record`, {
        representative_id: representativeId,
        amount: parseFloat(amount), // Ensure amount is a number
        payment_date: new Date().toISOString(), // Use current date for payment
 recorded_by_admin_user_id: telegramUserId // Pass the admin's ID
      });

      // Assuming successful response indicates payment recorded
 await bot.editMessageText(`Payment of ${amount} for ${representativeName} recorded successfully.`, { chat_id: chatId, message_id: messageId }).catch(console.error);
    }
    // Add handling for other confirmed intents here

  } catch (error) {
    console.error(`Error processing confirmed action for chat ${chatId}:`, error);
 await bot.editMessageText('Sorry, there was an error completing the action.', { chat_id: chatId, message_id: messageId }).catch(console.error);
  }
 delete conversationContext[chatId]; // Clean up context after handling (success or failure)
});

// You would add more handlers here for other commands and message types
