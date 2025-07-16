CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    telegram_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_admin_users_telegram_id ON admin_users (telegram_id);