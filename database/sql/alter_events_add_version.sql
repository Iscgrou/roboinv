-- database/sql/alter_events_add_version.sql

ALTER TABLE events
ADD COLUMN version INT;

-- We need to ensure that the version is unique for each entity
-- This is crucial for the integrity of the event sourcing pattern.
ALTER TABLE events
ADD CONSTRAINT unique_entity_version UNIQUE (entity_id, version);

-- Update existing rows to have a version number.
-- This is a one-time migration for existing data.
WITH numbered_events AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY created_at) as rn
  FROM events
)
UPDATE events e
SET version = ne.rn
FROM numbered_events ne
WHERE e.id = ne.id;

-- After the one-time update, we should make the column NOT NULL
ALTER TABLE events
ALTER COLUMN version SET NOT NULL;
