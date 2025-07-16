// ... (other functions)

async function handleCheckBalance(chatId, entities) {
  try {
    // *** NEW: USE AUTHENTICATED API CLIENT ***
    const apiClient = getApiClient(chatId);

    // ... (logic for resolving representativeId)

    if (!representativeId) {
      bot.sendMessage(chatId, "I'm not sure which representative you're asking about. Please be more specific.");
      return;
    }

    // Use the authenticated client to make the API call
    const response = await apiClient.get(`/representatives/${representativeId}/balance`);

    // ... (logic to process response and send message)
    
    updateUserContext(chatId, { lastMentionedRepresentativeId: representativeId });
    bot.sendMessage(chatId, `The current balance for ${response.data.name} is ${response.data.balance}.`);

  } catch (error) {
    console.error('Error in handleCheckBalance:', error.message);
    if (error.message === 'User is not authenticated.') {
        bot.sendMessage(chatId, "You need to log in first. Please use the /login command.");
    } else {
        bot.sendMessage(chatId, 'Sorry, I ran into an error trying to check the balance.');
    }
  }
}

// NOTE: All other handle... functions that make API calls must be updated
// in the same way to use getApiClient(chatId).

// ... (rest of bot.js)
