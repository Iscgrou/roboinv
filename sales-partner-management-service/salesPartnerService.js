// sales-partner-management-service/salesPartnerService.js

// Assuming SalesPartnerDao is exported as named export
import { SalesPartnerDao } from './salesPartnerDao';

class SalesPartnerService {
  constructor(salesPartnerDao) {
    if (!(salesPartnerDao instanceof SalesPartnerDao)) {
      throw new Error('Invalid SalesPartnerDao instance provided.');
    }
    this.salesPartnerDao = salesPartnerDao;
  }

  async createSalesPartner(data) {
    // Input validation
    if (!data || !data.name || !data.telegram_id || typeof data.commission_rate !== 'number') {
      throw new Error('Invalid sales partner data.');
    }
    if (data.commission_rate < 0 || data.commission_rate > 100) {
      throw new Error('Commission rate must be between 0 and 100.');
    }

    // Business logic (e.g., default values, data transformation)
    const salesPartnerData = {
      name: data.name.trim(),
      telegram_id: data.telegram_id.trim(),
      commission_rate: data.commission_rate,
      total_earned_commission: data.total_earned_commission || 0, // Default to 0
      // Add other necessary fields with defaults or validation
    };

    // Use the DAO to create the sales partner
    return this.salesPartnerDao.createSalesPartner(salesPartnerData);
  }

  async getSalesPartner(id) {
    if (!id) {
      throw new Error('Sales partner ID is required.');
    }
    // Use the DAO to get the sales partner by ID
    return this.salesPartnerDao.getSalesPartnerById(id);
  }

  async updateSalesPartner(id, data) {
    if (!id || !data) {
      throw new Error('Sales partner ID and data are required.');
    }
    // Input validation for update data
    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.telegram_id !== undefined) updates.telegram_id = data.telegram_id.trim();
    if (data.commission_rate !== undefined && typeof data.commission_rate === 'number') {
      if (data.commission_rate < 0 || data.commission_rate > 100) {
        throw new Error('Commission rate must be between 0 and 100.');
      }
      updates.commission_rate = data.commission_rate;
    }
    // Add validation for other updatable fields

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid update data provided.');
    }
    // Use the DAO to update the sales partner
    return this.salesPartnerDao.updateSalesPartner(id, updates);
  }

  async deleteSalesPartner(id) {
    if (!id) {
      throw new Error('Sales partner ID is required.');
    }

    // Add business logic before deletion (e.g., check if they have referred representatives)
    // This might involve querying the representative management service.
    // For now, we'll proceed with deletion via DAO.
    return this.salesPartnerDao.deleteSalesPartner(id);
  }

  async getSalesPartners(filters = {}) {
    // Input validation for filters
    // (e.g., ensure filters are in expected format)

    // Use the DAO to get sales partners with optional filters
    return this.salesPartnerDao.getSalesPartners(filters);
  }

  // Potentially add methods for commission-related operations
  // async calculateCommissionsForPeriod(startDate, endDate) { ... }
  // async getSalesPartnerCommissions(salesPartnerId) { ... }
}

// Export the SalesPartnerService class for use in other modules
// Using named export for consistency if other modules use it this way
export { SalesPartnerService };

    }

    async getSalesPartners(filters = {}) {
        // Input validation for filters
        // (e.g., ensure filters are in expected format)

        try {
            const salesPartners = await this.salesPartnerDao.getSalesPartners(filters);
            return salesPartners;
        } catch (error) {
            console.error('Error getting sales partners:', error);
            throw new Error('Failed to retrieve sales partners.');
        }
    }

    // Potentially add methods for commission-related operations
    // async calculateCommissionsForPeriod(startDate, endDate) { ... }
    // async getSalesPartnerCommissions(salesPartnerId) { ... }
}

// export { SalesPartnerService }; // Uncomment if using ES modules