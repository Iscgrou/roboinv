const {
    consumeMessages,
    connectQueue
} = require('/app/shared/messageQueue');
const InvoiceService = require('/app/invoice-generation-service/invoiceService');
// Assuming necessary DAOs are available and imported correctly
const RepresentativeDao = require('/app/representative-management-service/representativeDao');
const EventDao = require('/app/shared/eventDao');
const InvoiceDao = require('/app/invoice-generation-service/invoiceDao'); // Assuming InvoiceDao exists and is imported
const dbClient = require('/app/shared/database'); // Assuming database client is available


// Placeholder instances of DAOs (will be properly injected in a real application)
const representativeDao = new RepresentativeDao(dbClient);
const eventDao = new EventDao(dbClient);
const invoiceDao = new InvoiceDao(dbClient); // Assuming InvoiceDao is imported or available

// Create an instance of InvoiceService
const invoiceService = new InvoiceService(invoiceDao, representativeDao, eventDao);
// Create an instance of InvoiceService

const QUEUE_NAME = 'invoice_generation_queue';


// Message consumer function
async function messageConsumer(msg) {
    console.log('Received message:', msg.content.toString());
    const channel = messageQueue.getChannel(); // Assuming messageQueue provides access to the channel
    try {
        // Call the invoice generation logic using the file path from the message content
        await invoiceService.generateInvoicesFromConsumptionData(msg.content.toString());
        channel.ack(msg); // Acknowledge the message
    } catch (error) {
        console.error('Error processing message:', error);
        channel.nack(msg); // Negatively acknowledge the message
    }
}


// Start consuming messages from the queue
async function startConsumer() {
    console.log(`Starting to consume messages from ${QUEUE_NAME} queue...`);
    try {
        await connectQueue(); // Ensure queue connection is established
        await consumeMessages(QUEUE_NAME, messageConsumer);
    } catch (error) {
        console.error(`Error starting message consumer for ${QUEUE_NAME}:`, error);
    }
}

startConsumer();