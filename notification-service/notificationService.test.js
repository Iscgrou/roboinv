// notification-service/notificationService.test.js
import NotificationService from './notificationService.js';

// Mock the process.env to avoid errors in the constructor
process.env.TELEGRAM_BOT_TOKEN = 'test-token';

describe('NotificationService', () => {
  describe('generatePaymentReminderMessage', () => {

    it('should generate a reminder message with a due date when provided', () => {
      // Arrange
      const representative = {
        name: 'آقای بهرامی',
        current_balance: 150000,
      };
      const invoiceDetails = {
        oldest_due_date: '2023-10-27',
      };

      // Act
      const message = NotificationService.generatePaymentReminderMessage(representative, invoiceDetails);

      // Assert
      expect(message).toContain('نماینده: آقای بهرامی');
      expect(message).toContain('مبلغ بدهی فعلی: ۱۵۰٬۰۰۰ تومان');
      expect(message).toContain('تاریخ سررسید نزدیک‌ترین فاکتور پرداخت نشده: 2023-10-27');
    });

    it('should generate a generic reminder message when due date is not provided', () => {
      // Arrange
      const representative = {
        name: 'خانم احمدی',
        current_balance: 75000,
      };

      // Act
      const message = NotificationService.generatePaymentReminderMessage(representative, {});

      // Assert
      expect(message).toContain('نماینده: خانم احمدی');
      expect(message).toContain('مبلغ بدهی فعلی: ۷۵٬۰۰۰ تومان');
      expect(message).toContain('لطفا در اسرع وقت نسبت به تسویه حساب اقدام فرمایید.');
      expect(message).not.toContain('تاریخ سررسید');
    });

    it('should correctly format a zero balance', () => {
        // Arrange
        const representative = {
          name: 'فروشگاه مرکزی',
          current_balance: 0,
        };
  
        // Act
        const message = NotificationService.generatePaymentReminderMessage(representative, {});
  
        // Assert
        expect(message).toContain('مبلغ بدهی فعلی: ۰ تومان');
    });

  });
});
