// shared/eventDao.js
const {
    getClient
} = require('./database'); // Assuming shared database module is in shared/database.js

class EventDao {
    constructor(client) {
        this.client = client;
    }

    /**
     * Appends a new event to the events table.
     * @param {object} eventData - The event data.
     * @param {string} eventData.entity_type - The type of entity ('representative' or 'invoice').
     * @param {string} eventData.entity_id - The ID of the entity.
     * @param {string} eventData.event_type - The type of event (e.g., 'PaymentReceived', 'InvoiceIssued').
     * @param {object} eventData.event_data - The details of the event.
     * @param {string} [eventData.user_id] - The ID of the administrator who triggered the event (optional).
     * @param {object} [client=this.client] - Optional database client.
     * @returns {Promise<object>} The inserted event record.
     */
    async appendEvent(eventData) {
        const query = `
            INSERT INTO events (entity_type, entity_id, event_type, event_data, timestamp, user_id)
            VALUES ($1, $2, $3, $4, NOW(), $5)
            RETURNING *;
        `;
        const values = [
            eventData.entity_type,
            eventData.entity_id,
            eventData.event_type,
            eventData.event_data,
            eventData.user_id || null,
        ];
        const result = await this.client.query(query, values);
        return result.rows[0];
    }

    /**
     * Retrieves all events for a specific entity, ordered by timestamp.
     * @param {string} entityType - The type of entity ('representative' or 'invoice').
     * @param {string} entityId - The ID of the entity.
     * @param {object} [client=this.client] - Optional database client.
     * @returns {Promise<Array<object>>} An array of event records.
     */
    async getEventsByEntity(entityType, entityId) {
        const query = `
            SELECT *
            FROM events
            WHERE entity_type = $1 AND entity_id = $2 -- Assuming entity_id is stored as text/UUID string
            ORDER BY timestamp ASC;
        `;
        const values = [entityType, entityId]; // Pass entityId as a string for UUID comparison
        const result = await this.client.query(query, values);
        return result.rows;
    }
}

module.exports = EventDao;