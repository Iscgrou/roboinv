// representative-management-service/representativeDao.js
// ... (other methods remain the same)

// Get multiple representatives with advanced, secure filtering
async getRepresentatives(filters = {}) {
  let query = 'SELECT * FROM representatives';
  const values = [];
  const whereClauses = [];
  let paramIndex = 1;

  if (filters.name_like) {
    whereClauses.push(`name ILIKE $${paramIndex}`);
    values.push(`%${filters.name_like}%`);
    paramIndex++;
  }

  if (filters.balance_gt) {
    whereClauses.push(`current_balance > $${paramIndex}`);
    values.push(filters.balance_gt);
    paramIndex++;
  }
  
  if (filters.balance_lt) {
    whereClauses.push(`current_balance < $${paramIndex}`);
    values.push(filters.balance_lt);
    paramIndex++;
  }

  if (filters.sales_partner_id) {
    whereClauses.push(`sales_partner_id = $${paramIndex}`);
    values.push(filters.sales_partner_id);
    paramIndex++;
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Add ordering for consistent results
  query += ' ORDER BY created_at DESC';

  const result = await this.dbClient.query(query, values);
  return result.rows;
}

// ... (other methods remain the same)
