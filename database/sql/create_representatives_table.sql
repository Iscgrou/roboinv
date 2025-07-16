CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    telegram_id VARCHAR,
    current_balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    payment_reminder_threshold_days INTEGER DEFAULT 0,
    sales_partner_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_representatives_telegram_id ON representatives (telegram_id);
CREATE INDEX idx_representatives_sales_partner_id ON representatives (sales_partner_id);
CREATE INDEX idx_representatives_current_balance ON representatives (current_balance);