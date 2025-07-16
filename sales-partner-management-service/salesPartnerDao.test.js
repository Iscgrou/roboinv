// sales-partner-management-service/salesPartnerDao.test.js
import SalesPartnerDao from './salesPartnerDao.js';

describe('SalesPartnerDao', () => {
  let dbClient;
  let salesPartnerDao;

  beforeEach(() => {
    // Create a mock database client before each test
    dbClient = {
      query: jest.fn(),
    };
    salesPartnerDao = new SalesPartnerDao(dbClient);
  });

  describe('updateSalesPartner', () => {
    it('should correctly build a dynamic query for a partial update', async () => {
      // 1. Arrange
      const partnerId = 'some-uuid-123';
      const partialUpdateData = {
        commission_rate: 0.15,
      };
      const mockDbResult = {
        rows: [{
          id: partnerId,
          name: 'Existing Partner',
          telegram_id: 'tele123',
          commission_rate: 0.15,
        }],
      };
      dbClient.query.mockResolvedValue(mockDbResult);

      // 2. Act
      const result = await salesPartnerDao.updateSalesPartner(partnerId, partialUpdateData);

      // 3. Assert
      expect(dbClient.query).toHaveBeenCalledTimes(1);

      // Check the generated query and values
      const expectedQuery = `
      UPDATE sales_partners
      SET commission_rate = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
      const expectedValues = [0.15, partnerId];
      
      // Normalize whitespace for a robust comparison
      const actualQuery = dbClient.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      const normalizedExpectedQuery = expectedQuery.replace(/\s+/g, ' ').trim();

      expect(actualQuery).toBe(normalizedExpectedQuery);
      expect(dbClient.query.mock.calls[0][1]).toEqual(expectedValues);
      expect(result).toEqual(mockDbResult.rows[0]);
    });
    
    it('should correctly build a dynamic query for a full update', async () => {
        // 1. Arrange
        const partnerId = 'some-uuid-456';
        const fullUpdateData = {
          name: 'Updated Partner Name',
          telegram_id: 'tele456',
          commission_rate: 0.20,
        };
        const mockDbResult = { rows: [fullUpdateData] };
        dbClient.query.mockResolvedValue(mockDbResult);
  
        // 2. Act
        const result = await salesPartnerDao.updateSalesPartner(partnerId, fullUpdateData);
  
        // 3. Assert
        expect(dbClient.query).toHaveBeenCalledTimes(1);
  
        const expectedQuery = `
        UPDATE sales_partners
        SET name = $1, telegram_id = $2, commission_rate = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `;
        const expectedValues = ['Updated Partner Name', 'tele456', 0.20, partnerId];
        
        const actualQuery = dbClient.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
        const normalizedExpectedQuery = expectedQuery.replace(/\s+/g, ' ').trim();
  
        expect(actualQuery).toBe(normalizedExpectedQuery);
        expect(dbClient.query.mock.calls[0][1]).toEqual(expectedValues);
        expect(result).toEqual(mockDbResult.rows[0]);
    });
  });
});
