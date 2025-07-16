// shared/eventDao.js
import { getDbClient } from './database';

class EventDao {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  // --- APPEND EVENT (ENHANCED FOR VERSIONING) ---
  async appendEvent(eventData) {
    const { entity_id, entity_type, event_type, event_data, user_id } = eventData;
    
    // The logic to get the next version must be atomic to prevent race conditions.
    // Using a transaction is the correct way to handle this.
    try {
      await this.dbClient.query('BEGIN');
      
      // Get the current max version for this entity and lock the row to prevent concurrent writes
      const versionResult = await this.dbClient.query(
        'SELECT MAX(version) as max_version FROM events WHERE entity_id = $1 FOR UPDATE;',
        [entity_id]
      );
      const nextVersion = (versionResult.rows[0].max_version || 0) + 1;

      const query = `
        INSERT INTO events (entity_id, entity_type, event_type, event_data, user_id, version, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
      `;
      const values = [entity_id, entity_type, event_type, event_data, user_id, nextVersion];
      const result = await this.dbClient.query(query, values);
      
      await this.dbClient.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await this.dbClient.query('ROLLBACK');
      console.error('Error appending event in transaction:', error);
      throw error;
    }
  }

  // --- GET EVENTS (ORIGINAL METHOD) ---
  async getEventsByEntity(entityType, entityId) {
    const query = 'SELECT * FROM events WHERE entity_id = $1 AND entity_type = $2 ORDER BY version ASC;';
    const result = await this.dbClient.query(query, [entityId, entityType]);
    return result.rows;
  }

  // --- GET EVENTS AFTER VERSION (NEW METHOD FOR SNAPSHOTTING) ---
  async getEventsByEntityAfterVersion(entityId, version) {
    const query = `
      SELECT * FROM events 
      WHERE entity_id = $1 AND version > $2 
      ORDER BY version ASC;
    `;
    const result = await this.dbClient.query(query, [entityId, version]);
    return result.rows;
  }
}

export default EventDao;
