// ... (imports, context store, etc.)

// --- COMMAND-BASED FLOW IMPLEMENTATION ---

// Temporarily disable the generic text handler that relies on NLU
/*
bot.on('text', async (msg) => {
  if (!msg.text.startsWith('/')) {
    // This section is now disabled until the NLU model is ready.
    // const nluResult = await callNluService(msg.text);
    // await handleNaturalLanguageCommand(msg.chat.id, nluResult);
  }
});
*/

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the AI Accounting Assistant. Please use the available commands. Example: /balance [representative_name]");
});

// Command handler for /balance [name]
bot.onText(/\/balance (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const representativeIdentifier = match[1]; // The captured part after the command

    if (!representativeIdentifier) {
        bot.sendMessage(chatId, "Please provide a representative name or ID. Usage: /balance [name or id]");
        return;
    }

    // We can re-use our existing handler logic!
    // We just need to format the input as if it came from the NLU service.
    const entities = { representative_name: representativeIdentifier };
    console.log(`Received command /balance for: ${representativeIdentifier}`);
    await handleCheckBalance(chatId, entities);
});

// Command handler for /invoices [name]
bot.onText(/\/invoices (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const representativeIdentifier = match[1];

    if (!representativeIdentifier) {
        bot.sendMessage(chatId, "Usage: /invoices [name or id]");
        return;
    }

    const entities = { representative_name: representativeIdentifier };
    console.log(`Received command /invoices for: ${representativeIdentifier}`);
    await handleGetInvoiceHistory(chatId, entities);
});


// Command handler for /payment [name] [amount]
bot.onText(/\/payment (.+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const representativeIdentifier = match[1];
    const amount = parseInt(match[2], 10);

    if (!representativeIdentifier || !amount) {
        bot.sendMessage(chatId, "Usage: /payment [name or id] [amount]");
        return;
    }

    const entities = { 
        representative_name: representativeIdentifier,
        amount: amount
    };
    console.log(`Received command /payment for: ${representativeIdentifier} with amount: ${amount}`);
    // NOTE: handleRecordPayment expects confirmation, this needs to be adapted
    // For now, we'll call it directly.
    await handleRecordPayment(chatId, entities);
});


// We keep the handle... functions as they contain the core logic
// ... (handleCheckBalance, handleGetInvoiceHistory, handleRecordPayment etc.)
// ... (callback_query handler for ambiguity resolution)
