import { getDbClient } from '../shared/database';
import { v4 as uuidv4 } from 'uuid';

class SalesPartnerDao {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  // Get a sales partner by ID
  async getSalesPartnerById(id) {
    const query = 'SELECT * FROM sales_partners WHERE id = $1';
    const result = await this.dbClient.query(query, [id]);
    return result.rows[0] || null;
  }

  // Create a new sales partner
  async createSalesPartner(data) {
    const id = uuidv4();
    const { name, telegram_id, commission_rate } = data;
    const query = `
      INSERT INTO sales_partners (id, name, telegram_id, commission_rate, total_earned_commission, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *;
    `;
    const values = [id, name, telegram_id, commission_rate, 0]; // Initialize total_earned_commission to 0
    const result = await this.dbClient.query(query, values);
    return result.rows[0];
  }

  // Update an existing sales partner
  async updateSalesPartner(id, data) {
    const fields = [];
    const values = [];
    let fieldIndex = 1;

    // Dynamically build the SET clause based on provided data
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${fieldIndex}`);
        values.push(value);
        fieldIndex++;
      }
    }

    if (fields.length === 0) {
      // If no fields to update, return the current state or throw an error
      return this.getSalesPartnerById(id);
    }

    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE sales_partners
      SET ${fields.join(', ')}
      WHERE id = $${fieldIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.dbClient.query(query, values);
    return result.rows[0] || null;
  }

  // Delete a sales partner
  async deleteSalesPartner(id) {
    const query = 'DELETE FROM sales_partners WHERE id = $1 RETURNING id;';
    const result = await this.dbClient.query(query, [id]);
    return result.rows.length > 0; // Return true if a row was deleted
  }

  // Get multiple sales partners with optional filtering
  async getSalesPartners(filters) {
    // Basic implementation without robust filtering for brevity.
    // More complex filtering would involve dynamically building the WHERE clause based on filters.
    const query = 'SELECT * FROM sales_partners';
    const result = await this.dbClient.query(query);
    return result.rows;
  }
}

export default SalesPartnerDao;
