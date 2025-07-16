CREATE TABLE payments (
    id UUID PRIMARY KEY,
    representative_id UUID REFERENCES representatives(id),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method VARCHAR,
    notes TEXT,
    recorded_by UUID REFERENCES admin_users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_payments_representative_id ON payments (representative_id);
CREATE INDEX idx_payments_payment_date ON payments (payment_date);