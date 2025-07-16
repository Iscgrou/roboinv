// Load environment variables from a .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Access environment variables
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// Example usage
console.log(`Server running on port: ${port}`);
console.log(`Database URL: ${databaseUrl}`);
console.log(`Telegram Bot Token: ${telegramBotToken ? 'Loaded' : 'Not set'}`);

// You would typically use these variables to configure your application,
// connect to databases, initialize services, etc.

// For example, in an Express.js application:
// const express = require('express');
// const app = express();
// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });