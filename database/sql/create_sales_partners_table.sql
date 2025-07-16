CREATE TABLE sales_partners (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    telegram_id VARCHAR UNIQUE,
    commission_rate NUMERIC NOT NULL DEFAULT 0.0,
    total_earned_commission NUMERIC NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_partners_telegram_id ON sales_partners (telegram_id);