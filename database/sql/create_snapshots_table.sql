-- database/sql/create_snapshots_table.sql

CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  version INT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensures that we can only have one snapshot per entity at a specific version
  CONSTRAINT unique_entity_version_snapshot UNIQUE (entity_id, version)
);

CREATE INDEX idx_snapshots_entity ON snapshots(entity_id, version DESC);
