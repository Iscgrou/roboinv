// representative-management-service/representativeDao.js
import { getClient } from '../shared/database';
import EventDao from '../shared/eventDao'; // Assuming shared eventDao is in shared/eventDao.js

class RepresentativeDao {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getRepresentativeById(id) {
    const result = await this.dbClient.query('SELECT * FROM representatives WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRepresentative(data) {
    const {
      name,
      telegram_id,
      current_balance = 0,
      payment_reminder_threshold_days,
      sales_partner_id
    } = data;
    const result = await this.dbClient.query(
      `INSERT INTO representatives (name, telegram_id, current_balance, payment_reminder_threshold_days, sales_partner_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [name, telegram_id, current_balance, payment_reminder_threshold_days, sales_partner_id]
    );
    return result.rows[0];
  }

  async updateRepresentative(id, data) {
    const fields = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(data);
    const result = await this.dbClient.query(
      `UPDATE representatives SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  async deleteRepresentative(id) {
    // In a financial system, soft delete or archiving might be preferred over hard delete.
    // For now, implementing a hard delete for simplicity, but consider alternatives.
    await this.dbClient.query('DELETE FROM representatives WHERE id = $1', [id]);
  }

  async getRepresentatives(filters = {}) {
    // Placeholder for database query to get multiple representatives with optional filters
    console.log('Getting representatives with filters:', filters);
    // Example query: const result = await this.dbClient.query('SELECT * FROM representatives WHERE ...');
    // return result.rows;
    return Promise.resolve([
      { id: 'rep1', name: 'Rep One', telegram_id: 'tele1', current_balance: 1000 },
      { id: 'rep2', name: 'Rep Two', telegram_id: 'tele2', current_balance: -500 }
    ]);
  }
}

// Method to apply an event to a representative's state (in memory or by updating the database)
  async applyEvent(event) {
    console.log(`Applying event type: ${event.event_type} to representative ID: ${event.entity_id}`);
    // This is where the logic to update the representative's state based on the event type resides.
    // For example, if event.event_type is 'PaymentReceived', update the current_balance.
    // This method would typically involve querying the database to get the current state
    // and then applying the event data to update that state in the database.
    // Example (simplified - in a real scenario, you'd use transactions and careful state updates):
    // const representative = await this.getRepresentativeById(event.entity_id);
    // if (!representative) {
    //   console.error(`Representative with ID ${event.entity_id} not found.`);
    //   return;
    // }
    // if (event.event_type === 'PaymentReceived') {
    //   const newBalance = representative.current_balance + event.event_data.amount;
    //   await this.updateRepresentative(event.entity_id, { current_balance: newBalance });
    // }
    // More event types would be handled here (e.g., 'InvoiceIssued', 'BalanceAdjusted').
  }

  // Method to save an event using the shared eventDao
  async saveEvent(eventData) {
    const eventDao = new EventDao(this.dbClient); // Create an instance of EventDao
    await eventDao.appendEvent(eventData);
  }

export default RepresentativeDao;