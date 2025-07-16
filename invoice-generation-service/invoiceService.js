import InvoiceDao from './invoiceDao.js';
import RepresentativeDao from '../representative-management-service/representativeDao.js';
import EventDao from '../shared/eventDao.js';
import fs from 'fs/promises'; // Import fs/promises for asynchronous file operations
import NotificationService from '../notification-service/notificationService.js'; // Assuming internal access
import { v4 as uuidv4 } from 'uuid';

class InvoiceService {
  constructor(invoiceDao, representativeDao, eventDao) {
    this.invoiceDao = invoiceDao;
    this.representativeDao = representativeDao;
    this.eventDao = eventDao;
  }

  adminChatIds = process.env.ADMIN_CHAT_IDS ? process.env.ADMIN_CHAT_IDS.split(',') : []; // Assuming admin chat IDs are in env variable

  async generateInvoicesFromConsumptionData(filePath) {
    try {
      const jsonData = await fs.readFile(filePath, 'utf8'); // Read the JSON file asynchronously

      const consumptionData = this.parseConsumptionJson(jsonData);

      for (const repData of consumptionData) {
        let generatedInvoiceCount = 0;
        try {
          const representativeId = repData.representativeId; // Assuming representativeId is in the parsed data
          const consumptionDetails = repData.consumption; // Assuming consumption details are here

          // Find the representative to ensure they exist
          const representative = await this.representativeDao.getRepresentativeById(representativeId);
          if (!representative) {
            console.warn(`Representative with ID ${representativeId} not found. Skipping invoice generation for this data.`);
            continue; // Skip to the next representative's data
          }

          const amountDue = this.calculateInvoiceAmount(consumptionDetails);

          // Create invoice record
          const invoiceId = uuidv4();
          const invoiceData = {
            id: invoiceId,
            representative_id: representativeId,
            invoice_date: new Date(), // Or the specific invoice date from context/JSON
            start_date: new Date('2023-01-01'), // Placeholder: Needs to be determined from JSON or context
            end_date: new Date('2023-01-07'), // Placeholder: Needs to be determined from JSON or context
            total_consumption: consumptionDetails,
            amount_due: amountDue,
            amount_paid: 0,
            outstanding_balance: amountDue,
            status: 'issued',
          };

          // Save InvoiceIssued event
          const invoiceIssuedEvent = {
            entity_type: 'invoice',
            entity_id: invoiceId,
            event_type: 'InvoiceIssued',
            event_data: {
              amountDue: amountDue,
              representativeId: representativeId,
            },
            timestamp: new Date(), // Event timestamp
            user_id: null, // Admin user who triggered this, needs to be passed or determined
          };
          await this.eventDao.appendEvent(invoiceIssuedEvent);

          // Save invoice record (state based on events)
          await this.invoiceDao.createInvoice(invoiceData);


          // Update representative balance using event
          const balanceAdjustedEvent = {
            entity_type: 'representative',
            entity_id: representativeId,
            event_type: 'BalanceAdjusted', // Or a more specific event like 'InvoiceAppliedToBalance'
            event_data: {
              adjustment: amountDue,
              invoiceId: invoiceId,
            },
            timestamp: new Date(),
            user_id: null, // Admin user who triggered this
          };
          await this.eventDao.appendEvent(balanceAdjustedEvent);

          // Apply the event to update the representative's state.
          // The applyEvent method in representativeDao should handle the state update logic.
          // We don't need to fetch the full state here, just pass the event to the DAO.
          await this.representativeDao.applyEvent(balanceAdjustedEvent);

          generatedInvoiceCount++; // Increment count for successful invoice

        } catch (error) {
          console.error(`Error processing consumption data for representative: ${repData.representativeId || 'Unknown'}:`, error);
          // Decide whether to continue processing other representatives or stop
        }
      }
    } catch (error) {
      // Send notification about the error
      for (const chatId of this.adminChatIds) {
        await NotificationService.sendTelegramMessage(chatId, `❗️ Error during invoice generation from ${filePath}: ${error.message}`);
      }

      console.error(`Error generating invoices from file ${filePath}:`, error);
      throw error; // Re-throw the error after logging
    }
  }

  parseConsumptionJson(jsonData) {
    console.log("Parsing consumption JSON data...");
    const lines = jsonData.split('\n');
    const dataLines = lines.slice(15); // Skip the first 15 lines

    try {
      // Attempt to parse the remaining lines as JSON.
      // This assumes the remaining data is a valid JSON array or object.
      // If the data format is different (e.g., each line is a separate JSON object),
      // this parsing logic will need to be adjusted accordingly.
      const consumptionData = JSON.parse(dataLines.join('\n'));
      return consumptionData;
    } catch (error) {
      console.error("Error parsing consumption JSON data:", error);
      // Depending on requirements, you might throw the error or return an empty array
      throw new Error("Failed to parse consumption data: " + error.message);
    }
  }

  calculateInvoiceAmount(consumptionData) {
    console.log("Calculating invoice amount...");
    // Basic error handling for invalid consumption data
    if (!consumptionData || typeof consumptionData.total_usage !== 'number') {
      console.error("Invalid consumption data for calculation:", consumptionData);
      throw new Error("Invalid or missing 'total_usage' in consumption data.");
    }

    // Assume a simple fixed rate for now.
    // This should be replaced with the actual pricing model logic.
    console.log("Calculating invoice amount...");
    const ratePerUnit = 1000; // Example placeholder rate - Needs to be configured
    return consumptionData.dataUsed * ratePerUnit; // Example calculation
  }
  // After successful invoice generation loop
  for (const chatId of this.adminChatIds) {
    await NotificationService.sendTelegramMessage(chatId, `✅ Invoice generation complete! Generated ${generatedInvoiceCount} invoices.`);
  }
  }

  // Additional methods for getting invoices, etc. can be added here
}

export default InvoiceService;