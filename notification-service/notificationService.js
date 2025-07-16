import axios from 'axios';

class NotificationService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.botToken) {
      console.error('TELEGRAM_BOT_TOKEN environment variable not set.');
      // Depending on requirements, you might throw an error or handle this differently
    }
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendTelegramMessage(chatId, messageText, options = {}) {
    if (!this.botToken) {
      console.error('Cannot send message: Telegram bot token is not configured.');
      return; // Or throw an error
    }

    try {
      const url = `${this.telegramApiUrl}/sendMessage`;
      const data = {
        chat_id: chatId,
        text: messageText,
        ...options,
      };
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error.message);
      // Further error handling or logging as needed
      throw error; // Re-throw the error for calling service to handle
    }
  }

  generatePaymentReminderMessage(representative) {
    if (!representative || typeof representative.name !== 'string' || typeof representative.current_balance === 'undefined') {
      console.error('Invalid representative data for reminder message.');
      return 'Error generating reminder message.';
    }

    // Assuming representative object has 'name' and 'current_balance'
    const message = `📢 یادآوری سررسید صورت حساب برای نماینده: ${representative.name}\n\n` +
                    `مانده حساب فعلی شما: ${representative.current_balance.toFixed(2)} تومان.\n\n` +
                    `سررسید پرداخت: [تاریخ سررسید جایگزین شود]\n\n` + // Placeholder for due date
                    `لطفا جهت جلوگیری از قطع سرویس، نسبت به تسویه حساب اقدام نمایید.`;
    // Example: const outstandingInvoices = await this.reportingService.getRepresentativeOutstandingInvoices(representative.id);
    // Include invoice details in the message...

    return message;
  }

  // Additional methods for generating other notification types will be added here
}

export default NotificationService;