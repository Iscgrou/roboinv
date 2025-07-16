// notification-service/notificationService.js
import axios from 'axios';

class NotificationService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN must be provided in environment variables.');
    }
  }

  async sendTelegramMessage(chatId, messageText, options = {}) {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: messageText,
      ...options,
    };

    try {
      await axios.post(url, payload);
      console.log(`Notification sent to chat ID: ${chatId}`);
    } catch (error) {
      console.error(`Error sending notification to chat ID ${chatId}:`, error.response ? error.response.data : error.message);
      // Depending on the error, we might want to retry or handle it specifically.
    }
  }

  generatePaymentReminderMessage(representative, invoiceDetails) {
    // invoiceDetails is an object like { oldest_due_date: 'YYYY-MM-DD' }
    const formattedBalance = new Intl.NumberFormat('fa-IR').format(representative.current_balance);
    let message = `یادآوری پرداخت برای نماینده: ${representative.name}
`;
    message += `مبلغ بدهی فعلی: ${formattedBalance} تومان
`;
    if (invoiceDetails && invoiceDetails.oldest_due_date) {
      // Format the date for better readability if needed
      message += `تاریخ سررسید نزدیک‌ترین فاکتور پرداخت نشده: ${invoiceDetails.oldest_due_date}`;
    } else {
      message += "لطفا در اسرع وقت نسبت به تسویه حساب اقدام فرمایید.";
    }
    return message;
  }
}

// Export a singleton instance
export default new NotificationService();
