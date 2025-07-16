-- Create the consumption_data table
CREATE TABLE consumption_data (
    id UUID PRIMARY KEY,
    representative_id UUID REFERENCES representatives(id),
    date DATE NOT NULL,
    raw_data JSONB,
    processed_data JSONB,
    invoice_id UUID REFERENCES invoices(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_consumption_representative_id ON consumption_data (representative_id);
CREATE INDEX idx_consumption_date ON consumption_data (date);
CREATE INDEX idx_consumption_invoice_id ON consumption_data (invoice_id);