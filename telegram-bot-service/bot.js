// telegram-bot-service/bot.js
require('dotenv').config({ path: '../.env' });
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ... (conversationContexts map, helper functions, command handlers like onText, callback_query handler etc. remain here)
// ... (handleCheckBalance, handleGetInvoiceHistory, etc. remain here)

console.log('Telegram bot service started...');

// --- TEST SERVER (only runs if NODE_ENV is 'test') ---
if (process.env.NODE_ENV === 'test') {
  const app = express();
  app.use(express.json());

  // This endpoint allows our test suite to inject messages into the bot
  app.post('/test/message', (req, res) => {
    // Manually trigger the 'message' event for the bot to process
    bot.processUpdate(req.body);
    res.status(200).send({ message: 'Message processed' });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Test server for bot running on port ${port}`);
  });
}

// Export the bot instance for testing purposes
module.exports = bot;
