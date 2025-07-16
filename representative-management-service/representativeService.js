import { RepresentativeDao } from '../representative-management-service/representativeDao.js';
import { EventDao } from '../shared/eventDao.js';

class RepresentativeService {
  constructor(representativeDao, eventDao) {
    if (!(representativeDao instanceof RepresentativeDao)) {
      throw new Error('representativeDao must be an instance of RepresentativeDao');
    }
    if (!(eventDao instanceof EventDao)) {
      throw new Error('eventDao must be an instance of EventDao');
    }
    this.representativeDao = representativeDao;
    this.eventDao = eventDao;
  }

  async createRepresentative(data) {
    // Basic validation (expand as needed)
    if (!data || !data.name || !data.telegram_id) {
      throw new Error('Invalid representative data');
    }

    // Initial creation event
    const eventData = {
 entity_type: 'representative',
      entity_id: data.id, // Assuming ID is generated before creation or passed in data
 event_type: 'RepresentativeCreated',
      event_data: { name: data.name, telegram_id: data.telegram_id, initial_balance: data.initial_balance || 0 },
      timestamp: new Date(),
      user_id: data.user_id // Assuming user_id is passed in data
    };

    // Save the event first
 await this.eventDao.appendEvent(eventData);

    // Create the representative with initial state derived from the event
    const representative = await this.representativeDao.createRepresentative({ ...data, current_balance: eventData.event_data.initial_balance });
    //   timestamp: new Date(),
    //   user_id: data.user_id // Assuming user_id is passed in data
    // };
    // await this.eventDao.appendEvent(eventData);

    return representative;
  }

  async getRepresentative(id) {
    if (!id) {
      throw new Error('Representative ID is required');
    }
    // Retrieve the representative's current state by replaying events
    return this.getRepresentativeState(id);
  }

  async updateRepresentative(id, data) {
    if (!id || !data) {
      throw new Error('Representative ID and update data are required');
    }
    
    const currentRepresentativeState = await this.getRepresentativeState(id);
    if (!currentRepresentativeState) {
      throw new Error('Representative not found');
    }

    const eventsToAppend = [];

    // Determine changes and create corresponding events
    if (data.name !== undefined && data.name !== currentRepresentativeState.name) {
      eventsToAppend.push({
        entity_type: 'representative',
        entity_id: id,
        event_type: 'RepresentativeNameUpdated',
        event_data: { old_name: currentRepresentativeState.name, new_name: data.name },
        timestamp: new Date(),
        user_id: data.user_id // Assuming user_id is passed in data
      });
    }

    if (data.telegram_id !== undefined && data.telegram_id !== currentRepresentativeState.telegram_id) {
      eventsToAppend.push({
        entity_type: 'representative',
        entity_id: id,
        event_type: 'RepresentativeTelegramIdUpdated',
        event_data: { old_telegram_id: currentRepresentativeState.telegram_id, new_telegram_id: data.telegram_id },
        timestamp: new Date(),
        user_id: data.user_id
      });
    }

    if (data.payment_reminder_threshold_days !== undefined && data.payment_reminder_threshold_days !== currentRepresentativeState.payment_reminder_threshold_days) {
       eventsToAppend.push({
        entity_type: 'representative',
        entity_id: id,
        event_type: 'ReminderThresholdUpdated',
        event_data: { old_threshold: currentRepresentativeState.payment_reminder_threshold_days, new_threshold: data.payment_reminder_threshold_days },
        timestamp: new Date(),
        user_id: data.user_id
      });
    }

    // Note: Balance updates (InvoiceIssued, PaymentReceived, ManualAdjustment) should ideally be handled by dedicated event types triggered by other services (Invoice Generation, Payment Processing) or specific admin actions, not a generic 'balance_adjustment' in updateRepresentative. We'll assume those events are generated elsewhere and processed by applying them here.

    for (const event of eventsToAppend) {
 await this.eventDao.appendEvent(event);
    }

    // Reconstruct the state after appending events
    const updatedState = await this.getRepresentativeState(id);

    // Update the representative's current state in the database based on the replayed events
    // This is where we save the materialized state for quicker retrieval
 await this.representativeDao.updateRepresentative(id, updatedState);

    // Return the updated representative state (reconstructed)
    return updatedState;
  }

  async deleteRepresentative(id) {
    if (!id) {
      throw new Error('Representative ID is required');
    }
    // In a financial system, consider a 'RepresentativeDeactivated' event and soft deletion
    // rather than a hard delete. Hard deletes can lead to loss of historical financial data.

    const eventData = {
 entity_type: 'representative',
      entity_id: id,
 event_type: 'RepresentativeDeactivated',
      event_data: { reason: 'Manual Deactivation' }, // Add a reason if available
      timestamp: new Date(),
      user_id: // Assuming user_id is available in the context
    };

    await this.eventDao.appendEvent(eventData);

    // Optionally, mark the representative as inactive in the database for filtering
    await this.representativeDao.updateRepresentative(id, { is_active: false }); // Requires 'is_active' column in representative table

    // We might not return anything or return a success status for deactivation
  }

  async getRepresentatives(filters) {
    // Implement filtering logic in the DAO based on the filters object
    // For event-sourced entities, filtering by current state requires querying the materialized view (the representatives table)
    return this.representativeDao.getRepresentatives(filters);
  }

  async getRepresentativeState(id) {
    if (!id) {
      throw new Error('Representative ID is required');
    }

    // Fetch all events for the representative
    const events = await this.eventDao.getEventsByEntity('representative', id);

    if (events.length === 0) {
      // Handle case where no events are found (representative might not exist or is deactivated)
      return null; // Or throw an error
    }

    // Replay events to reconstruct the current state
    let currentState = {}; // Start with an empty state or initial state from the first event
    for (const event of events) {
      currentState = this.representativeDao.applyEvent(currentState, event); // Use the applyEvent method in the DAO
    }

    return currentState; // Return the fully reconstructed state
  }
}

export { RepresentativeService };



      return this.getRepresentative(id); // Return the updated representative
    } else {
      // Handle other updates directly (if they don't affect the core state managed by events)
      return this.representativeDao.updateRepresentative(id, data);
    }
  }

  async deleteRepresentative(id) {
    if (!id) {
      throw new Error('Representative ID is required');
    }
    // Consider soft delete or archiving instead of hard delete in financial systems
    return this.representativeDao.deleteRepresentative(id);
  }

  async getRepresentatives(filters) {
    // Implement filtering logic in the DAO based on the filters object
    return this.representativeDao.getRepresentatives(filters);
  }

  async getRepresentativeState(id) {
    if (!id) {
      throw new Error('Representative ID is required');
    }

    const events = await this.eventDao.getEventsByEntity('representative', id);

    let currentState = {
      id: id,
      current_balance: 0, // Initial state
      // ... other relevant state properties
    };

    // Replay events to reconstruct the current state
    for (const event of events) {
      currentState = await this.representativeDao.applyEvent(currentState, event); // representativeDao needs applyEvent logic
    }

    return currentState;
  }
}

export { RepresentativeService };