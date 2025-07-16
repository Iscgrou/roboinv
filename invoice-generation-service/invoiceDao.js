// invoiceDao.js
import {
    getClient
} from '../shared/database'; // Adjust path as needed

import EventDao from '../shared/eventDao'; // Import the EventDao

class InvoiceDao {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async getInvoiceById(id) {
        // Placeholder for database query to get an invoice by ID
        console.log(`Fetching invoice with ID: ${id}`);
        const result = await this.dbClient.query('SELECT * FROM invoices WHERE id = $1', [id]);
        return result.rows[0]; // Assuming single result
    }

    async createInvoice(data) {
        // Placeholder for database query to create a new invoice
        console.log('Creating new invoice:', data);
        const result = await this.dbClient.query(
            'INSERT INTO invoices (id, representative_id, invoice_date, start_date, end_date, total_consumption, amount_due, amount_paid, outstanding_balance, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *',
            [
                data.id,
                data.representative_id,
                data.invoice_date,
                data.start_date,
                data.end_date,
                data.total_consumption,
                data.amount_due,
                data.amount_paid,
                data.outstanding_balance,
                data.status,
            ]
        );
        return result.rows[0]; // Return the created invoice data
    }

    async updateInvoice(id, data) {
        // Placeholder for database query to update an invoice
        console.log(`Updating invoice with ID: ${id}`, data);
        // Example update query - needs to be adapted based on what fields can be updated
        const result = await this.dbClient.query(
            'UPDATE invoices SET amount_paid = $1, outstanding_balance = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [data.amount_paid, data.outstanding_balance, data.status, id]
        );
        return result.rows[0]; // Return the updated invoice data
    }

    async getInvoicesByRepresentativeId(representativeId) {
        // Placeholder for database query to get all invoices for a representative
        console.log(`Fetching invoices for representative ID: ${representativeId}`);
        const result = await this.dbClient.query('SELECT * FROM invoices WHERE representative_id = $1 ORDER BY invoice_date DESC', [representativeId]);
        return result.rows;
    }

    async applyEvent(invoice, event) {
        // Apply event logic to update invoice state
        // This is a simplified example. Real implementation would handle different event types
        switch (event.event_type) {
            case 'PaymentAppliedToInvoice':
                invoice.amount_paid = (parseFloat(invoice.amount_paid) + parseFloat(event.event_data.amount)).toString();
                invoice.outstanding_balance = (parseFloat(invoice.amount_due) - parseFloat(invoice.amount_paid)).toString();
                // Update status based on outstanding_balance
                if (parseFloat(invoice.outstanding_balance) <= 0) {
                    invoice.status = 'paid';
                } else {
                    invoice.status = 'partially_paid';
                }
                break;
                // Add cases for other event types like 'InvoiceAdjusted', 'InvoiceCancelled', etc.
            default:
                console.warn(`Unknown event type for invoice: ${event.event_type}`);
        }
        // Optionally update the invoice in the database after applying event
        await this.updateInvoice(invoice.id, invoice);
        return invoice; // Return the updated invoice object
    }

    async saveEvent(eventData) {
        const eventDao = new EventDao(this.dbClient); // Create an instance of EventDao
        return eventDao.appendEvent(eventData);
    }
    // Add other methods as needed (e.g., deleteInvoice, getOutstandingInvoices)
}

export default InvoiceDao;