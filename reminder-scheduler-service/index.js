// reminder-scheduler-service/index.js
import schedule from 'node-schedule';
import NotificationService from '../notification-service/notificationService.js';
// In a real scenario, this service would make an API call to the reporting/representative service.
// For simplicity in this step, we'll assume direct DB access is encapsulated in a local DAO.
import dbClient from '../shared/database'; // Assuming we create a shared DB client instance

console.log('Reminder Scheduler Service started.');

// Schedule the job to run once every day at 10:00 AM
const rule = new schedule.RecurrenceRule();
rule.hour = 10;
rule.minute = 0;
rule.tz = 'Asia/Tehran';

schedule.scheduleJob(rule, async () => {
  console.log('Running daily reminder job...');
  try {
    // This query finds each representative with an outstanding balance and joins them
    // with their oldest unpaid invoice to get its due date.
    const query = `
      WITH OldestUnpaidInvoice AS (
        SELECT 
          i.representative_id,
          i.due_date,
          ROW_NUMBER() OVER(PARTITION BY i.representative_id ORDER BY i.due_date ASC) as rn
        FROM invoices i
        WHERE i.outstanding_balance > 0
      )
      SELECT 
        r.id,
        r.name,
        r.telegram_id,
        r.current_balance,
        oui.due_date as oldest_due_date
      FROM representatives r
      JOIN OldestUnpaidInvoice oui ON r.id = oui.representative_id
      WHERE 
        oui.rn = 1 AND
        r.current_balance > 0 AND
        (r.last_reminder_sent_at IS NULL OR r.last_reminder_sent_at < NOW() - INTERVAL '23 hours') AND
        oui.due_date <= (NOW() + INTERVAL '1 day' * r.payment_reminder_threshold_days);
    `;

    const { rows: representativesToRemind } = await dbClient.query(query);

    console.log(`Found ${representativesToRemind.length} representatives to remind.`);

    for (const rep of representativesToRemind) {
      const invoiceDetails = { oldest_due_date: rep.oldest_due_date };
      const message = NotificationService.generatePaymentReminderMessage(rep, invoiceDetails);
      
      // We need the admin's chat ID to notify them.
      // This is a conceptual issue - should we notify the rep or the admin?
      // Assuming for now we notify an admin. This needs a mechanism to get admin chat IDs.
      const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // Placeholder
      if (ADMIN_CHAT_ID) {
          await NotificationService.sendTelegramMessage(ADMIN_CHAT_ID, message);
          
          // After sending, update the timestamp to prevent spam
          const updateQuery = 'UPDATE representatives SET last_reminder_sent_at = NOW() WHERE id = $1';
          await dbClient.query(updateQuery, [rep.id]);
          console.log(`Reminder sent for representative: ${rep.name} and timestamp updated.`);
      } else {
        console.warn('ADMIN_CHAT_ID not set. Cannot send reminder.');
      }
    }
  } catch (error) {
    console.error('Error running reminder job:', error);
  }
});
