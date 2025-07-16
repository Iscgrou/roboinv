// shared/snapshotDao.js
import { getDbClient } from './database';

class SnapshotDao {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  // Save a new snapshot
  async saveSnapshot(entityId, entityType, version, state) {
    const query = `
      INSERT INTO snapshots (entity_id, entity_type, version, state)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [entityId, entityType, version, state];
    const result = await this.dbClient.query(query, values);
    return result.rows[0];
  }

  // Get the latest snapshot for a given entity
  async getLatestSnapshot(entityId) {
    const query = `
      SELECT * FROM snapshots 
      WHERE entity_id = $1 
      ORDER BY version DESC 
      LIMIT 1;
    `;
    const result = await this.dbClient.query(query, [entityId]);
    return result.rows[0] || null;
  }
}

export default SnapshotDao;
