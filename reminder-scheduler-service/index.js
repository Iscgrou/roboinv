const schedule = require('node-schedule');
const NotificationService = require('/app/notification-service/notificationService'); // Absolute path
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const axios = require('axios');
// Or import DAOs directly if service isn't needed for this specific query
// const RepresentativeDao = require('../representative-management-service/representativeDao');

// Initialize services (assuming instances are created elsewhere or within this module)
const notificationService = new NotificationService();
const representativeManagementService = new RepresentativeManagementService();
// Or initialize DAOs if used directly

const REMINDER_SCHEDULE = '0 0 * * *'; // Run daily at midnight

async function findRepresentativesDueForReminder() {
    try {
        console.log('Checking for representatives due for reminders...');

        // Implement the SQL query logic here. This assumes the Reporting Service exposes
        // an endpoint to run custom queries or provides the necessary data.
        // Alternatively, if direct database access is allowed for this service,
        // you would use a database client here.
        // For demonstration, let's assume we call a reporting endpoint that executes this query.
        const query = `
            SELECT
                r.id,
                r.name,
                r.telegram_id,
                r.current_balance,
                MIN(i.due_date) FILTER (WHERE i.outstanding_balance > 0) AS oldest_outstanding_due_date
            FROM
                representatives r
            JOIN
                invoices i ON r.id = i.representative_id
            WHERE
                i.outstanding_balance > 0
            GROUP BY
                r.id, r.name, r.telegram_id, r.current_balance
            HAVING
                MIN(i.due_date - INTERVAL '1 day' * r.payment_reminder_threshold_days) <= CURRENT_DATE;
        `;

        const response = await axios.post(`${API_GATEWAY_URL}/reports/query`, { query }); // Assuming a generic query endpoint

    } catch (error) {
        console.error('Error finding representatives due for reminder:', error);
        throw error; // Re-throw to be handled by the scheduler
    }
}

async function sendPaymentReminders() {
    console.log('Running scheduled payment reminder job.');
    try {
        const representativesToRemind = await findRepresentativesDueForReminder();

        if (representativesToRemind.length === 0) {
            console.log('No representatives due for reminders.');
            return;
        }

        console.log(`Found ${representativesToRemind.length} representatives to remind.`);

        for (const representative of representativesToRemind) {
            try {
                // Need representative's telegram_id and current_balance (assuming these are in the returned data)
                if (!representative.telegram_id || representative.current_balance <= 0) {
                    console.warn(`Skipping reminder for representative ${representative.id}: Missing Telegram ID or no outstanding balance.`);
                    continue;
                }

                // Fetch necessary data for reminder message (e.g., specific outstanding invoices)
                // This might require additional service calls or data retrieval logic
                // For now, using basic representative info.
                // Assuming oldest_outstanding_due_date is available in representative object
                const reminderMessage = notificationService.generatePaymentReminderMessage({
                    name: representative.name,
                    current_balance: representative.current_balance,
                    // Include due date info if available
                });

                // Assuming administrator chat ID for sending reminders
                // In a real scenario, you'd likely send to the representative themselves
                // or specific administrators responsible for this representative.
                // For this project, we are sending to administrators.
                // Need to determine which administrator(s) should receive which reminders.
                // For simplicity, let's assume a predefined admin chat ID for now.
                const adminChatId = process.env.ADMIN_CHAT_ID; // Needs to be configured

                if (!adminChatId) {
                    console.error('ADMIN_CHAT_ID environment variable is not set. Cannot send reminders.');
                    continue;
                }

                await notificationService.sendTelegramMessage(adminChatId, reminderMessage);
                console.log(`Sent reminder to admin for representative ${representative.name}.`);

            } catch (error) {
                console.error(`Error sending reminder for representative ${representative.id}:`, error);
                // Continue processing other representatives even if one fails
            }
        }
        console.log('Payment reminder job finished.');

    } catch (error) {
        console.error('Fatal error during payment reminder job:', error);
        // Consider sending a notification to a super-admin if a fatal error occurs
    }
}

function startReminderScheduler() {
    console.log(`Starting payment reminder scheduler with schedule: ${REMINDER_SCHEDULE}`);
    schedule.scheduleJob(REMINDER_SCHEDULE, sendPaymentReminders);
    console.log('Payment reminder scheduler started.');
}

// Export the start function
module.exports = {
    startReminderScheduler,
};