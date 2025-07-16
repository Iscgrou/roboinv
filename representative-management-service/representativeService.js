// representative-management-service/representativeService.js
import RepresentativeDao from './representativeDao.js';
import EventDao from '../shared/eventDao.js';
import SnapshotDao from '../shared/snapshotDao.js';

const SNAPSHOT_THRESHOLD = 50; // This should be in a config file

class RepresentativeService {
  constructor(dbClient) {
    // In a real microservice, you'd likely get these via dependency injection
    this.representativeDao = new RepresentativeDao(dbClient);
    this.eventDao = new EventDao(dbClient);
    this.snapshotDao = new SnapshotDao(dbClient);
    this.dbClient = dbClient; // for transactions
  }

  // Reconstructs the state of a representative from snapshots and events
  async getRepresentativeState(representativeId) {
    let representative = {};
    let lastVersion = 0;

    const latestSnapshot = await this.snapshotDao.getLatestSnapshot(representativeId);
    if (latestSnapshot) {
      representative = latestSnapshot.state;
      lastVersion = latestSnapshot.version;
    }

    const events = await this.eventDao.getEventsByEntityAfterVersion(representativeId, lastVersion);

    for (const event of events) {
      representative = this.representativeDao.applyEvent(representative, event); // Assuming applyEvent is synchronous
    }
    
    // The final state includes the latest version number from the last event applied
    representative.version = events.length > 0 ? events[events.length - 1].version : lastVersion;
    representative.id = representativeId; // Ensure ID is part of the state object

    return representative;
  }

  // Creates a new representative
  async createRepresentative(data, adminUserId) {
    // ... logic for creating a new representative and initial event
    // would call saveAndApplyEvent
  }

  // Main method to handle state changes
  async saveAndApplyEvent(eventData) {
    const newEvent = await this.eventDao.appendEvent(eventData);
    const currentState = await this.getRepresentativeState(newEvent.entity_id);
    
    // Check if it's time to create a new snapshot
    if (currentState.version > 0 && currentState.version % SNAPSHOT_THRESHOLD === 0) {
      console.log(`Creating snapshot for entity ${currentState.id} at version ${currentState.version}`);
      
      // Remove the temporary version field from the state before saving snapshot
      const stateToSave = { ...currentState };
      delete stateToSave.version;

      await this.snapshotDao.saveSnapshot(
        currentState.id,
        'representative',
        currentState.version,
        stateToSave
      );
    }

    return currentState;
  }
}

export default RepresentativeService;
