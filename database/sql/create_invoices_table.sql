-- Create the invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    representative_id UUID NOT NULL REFERENCES representatives(id),
    invoice_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_consumption JSONB,
    amount_due NUMERIC(20, 2) NOT NULL,
    amount_paid NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(20, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_invoices_representative_id ON invoices(representative_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);