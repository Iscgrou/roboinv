// reportingService.js
import { Pool } from 'pg'; // Assuming you have a shared DB connection module
import { RepresentativeDao } from '../representative-management-service/representativeDao.js';
import { InvoiceDao } from '../invoice-generation-service/invoiceDao.js';
import { PaymentDao } from '../payment-processing-service/paymentDao.js';
import { SalesPartnerDao } from '../sales-partner-management-service/salesPartnerDao.js';

class ReportingService {
  constructor(dbClient) {
    this.representativeDao = new RepresentativeDao(dbClient);
    this.invoiceDao = new InvoiceDao(dbClient);
    this.paymentDao = new PaymentDao(dbClient);
    this.salesPartnerDao = new SalesPartnerDao(dbClient);
  }

  async getOutstandingInvoicesReport() {
    try {
      // Example: Query invoices with outstanding balance > 0
      const outstandingInvoices = await this.invoiceDao.getOutstandingInvoices({
        outstanding_balance_gt: 0,
      });
      return outstandingInvoices;
    } catch (error) {
      console.error('Error getting outstanding invoices report:', error);
      throw new Error('Failed to retrieve outstanding invoices report.');
    }
  }

  async getRepresentativeBalancesReport() {
    try {
      // Example: Query all representatives and their balances
      const representativeBalances = await this.representativeDao.getRepresentatives();
      return representativeBalances.map(rep => ({
        id: rep.id,
        name: rep.name,
        current_balance: rep.current_balance,
      }));
    } catch (error) {
      console.error('Error getting representative balances report:', error);
      throw new Error('Failed to retrieve representative balances report.');
    }
  }

  async getSalesPartnerCommissionsReport() {
    try {
      // Example: Query all sales partners and their total earned commission
      const salesPartners = await this.salesPartnerDao.getSalesPartners();
      return salesPartners.map(partner => ({
        id: partner.id,
        name: partner.name,
        total_earned_commission: partner.total_earned_commission,
      }));
    } catch (error) {
      console.error('Error getting sales partner commissions report:', error);
      throw new Error('Failed to retrieve sales partner commissions report.');
    }
  }

  async getPaymentHistoryReport(filters = {}) {
    try {
      // Example: Query payments with basic filtering and sorting
      // Filters could include: { representativeId, startDate, endDate, sortBy, sortOrder }
      const payments = await this.paymentDao.getPaymentsByRepresentativeId(filters.representativeId, filters);
      return payments;
    } catch (error) {
      console.error('Error getting payment history report:', error);
      throw new Error('Failed to retrieve payment history report.');
    }
  }

  async getRepresentativeInvoiceHistory(representativeId) {
    if (!representativeId) {
      throw new Error('Representative ID is required for invoice history report.');
    }
    try {
      // Example: Query invoices for a specific representative
      const invoices = await this.invoiceDao.getInvoicesByRepresentativeId(representativeId);
      return invoices;
    } catch (error) {
      console.error(`Error getting invoice history for representative ${representativeId}:`, error);
      throw new Error('Failed to retrieve representative invoice history.');
    }
  }
}

export { ReportingService };