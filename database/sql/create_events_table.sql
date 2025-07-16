CREATE TABLE events (
    id UUID PRIMARY KEY,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,
    event_type VARCHAR NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_events_entity ON events (entity_type, entity_id);
CREATE INDEX idx_events_timestamp ON events (timestamp);