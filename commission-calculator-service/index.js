// commission-calculator-service/index.js
import schedule from 'node-schedule';
// In a real scenario, this service would make an API call. For simplicity,
// we'll assume direct DB access is encapsulated in a local DAO.
import dbClient from '../shared/database';

console.log('Commission Calculator Service started.');

// Schedule the job to run once a week, for example, every Sunday at 2 AM.
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = 0; // Sunday
rule.hour = 2;
rule.minute = 0;
rule.tz = 'Asia/Tehran';

schedule.scheduleJob(rule, async () => {
  console.log('Running weekly commission calculation job...');
  try {
    // This query calculates the total sales from invoices generated in the last 7 days
    // for each sales partner's referred representatives.
    const query = `
      WITH NewCommissions AS (
        SELECT
          sp.id as sales_partner_id,
          SUM(i.amount_due) * sp.commission_rate AS new_commission_amount
        FROM sales_partners sp
        JOIN representatives r ON sp.id = r.sales_partner_id
        JOIN invoices i ON r.id = i.representative_id
        WHERE 
          i.invoice_date >= (NOW() - INTERVAL '7 days') AND
          i.amount_due > 0
        GROUP BY sp.id, sp.commission_rate
      )
      UPDATE sales_partners sp
      SET total_earned_commission = sp.total_earned_commission + nc.new_commission_amount
      FROM NewCommissions nc
      WHERE sp.id = nc.sales_partner_id
      RETURNING sp.id, sp.name, nc.new_commission_amount;
    `;

    const { rows: updatedPartners } = await dbClient.query(query);

    if (updatedPartners.length > 0) {
      console.log('Successfully calculated and updated commissions for the following partners:');
      updatedPartners.forEach(p => {
        console.log(`- Partner: ${p.name} (ID: ${p.id}), New Commission: ${p.new_commission_amount}`);
      });
      // Optionally, send a notification to a main admin about the completed calculation.
    } else {
      console.log('No new invoices found in the last 7 days to calculate commissions.');
    }
  } catch (error) {
    console.error('Error running commission calculation job:', error);
  }
});
