const config = {
  port: process.env.PORT || 3000,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  databaseUrl: process.env.DATABASE_URL,
  // Add other configuration variables as needed
};

module.exports = config;