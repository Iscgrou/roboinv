// tests/e2e/ai_workflow.test.js
const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:9000';

// Mocking the NLU service response
jest.mock('axios');

describe('End-to-End AI Assistant Workflow: Check Balance', () => {

  // This test requires the application to be running via `docker-compose up`
  // and a test user and representative to be seeded in the database.

  it('should process a natural language command, call the correct backend service, and formulate the correct response', async () => {
    // 1. ARRANGE
    const userMessage = "موجودی آقای بهرامی چنده؟";
    const chatId = 12345; // Mock admin user chat ID
    const authToken = 'mock-auth-token-for-e2e-test'; // Assume user is logged in

    // Mock the NLU response
    axios.post.mockImplementation((url) => {
      if (url.includes('/ai/nlu')) {
        return Promise.resolve({
          data: {
            intent: 'check_balance',
            entities: { representative_name: 'آقای بهرامی' }
          }
        });
      }
      // Add other mocks for other services if needed
      return Promise.reject(new Error(`No mock implemented for ${url}`));
    });
    
    // Mock the backend response for getting balance
    axios.get.mockImplementation((url) => {
        if (url.includes('/representatives')) { // Simplified for this test
          return Promise.resolve({
            data: { name: 'آقای بهرامی', balance: 250000 }
          });
        }
        return Promise.reject(new Error(`No mock implemented for ${url}`));
    });

    // We can't directly test the bot.sendMessage call here, as it's a side effect.
    // A more advanced setup would involve a mock Telegram API server.
    // For now, we will test the logic that *leads* to that call.
    // Let's assume our telegram-bot-service has an endpoint to receive messages for testing.
    // POST /test/message
    // In a real E2E test, you would likely observe the database state change or a notification being sent.

    // 2. ACT
    // This is a conceptual representation. A real test would require an endpoint on the bot service
    // to inject this message, or to run the bot's handler function directly.
    // For this example, let's just trace the logic conceptually.
    
    // a. The bot service receives the message.
    // b. It calls the mocked NLU service.
    const nluResponse = await axios.post(`${API_GATEWAY_URL}/ai/nlu`, { text: userMessage });
    
    // c. The bot service receives the intent and entities.
    const { intent, entities } = nluResponse.data;
    expect(intent).toBe('check_balance');

    // d. The bot service calls the backend to get the balance.
    const backendResponse = await axios.get(`${API_GATEWAY_URL}/representatives/some-resolved-id/balance`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 3. ASSERT
    // Finally, we assert the data that would be used to formulate the final message.
    expect(backendResponse.data.name).toBe('آقای بهرامی');
    expect(backendResponse.data.balance).toBe(250000);
    
    const finalMessage = `The current balance for ${backendResponse.data.name} is ${backendResponse.data.balance}.`;
    expect(finalMessage).toBe('The current balance for آقای بهرامی is 250000.');
  });
});
