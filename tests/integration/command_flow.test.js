// tests/integration/command_flow.test.js
const axios = require('axios');
const bot = require('../../telegram-bot-service/bot'); // Import the bot to spy on its methods

const BOT_TEST_URL = 'http://localhost:3000/test/message';
const API_GATEWAY_URL = 'http://localhost:9000';

describe('Command-Based Integration Flow: /balance', () => {
    let sendMessageSpy;

    beforeAll(() => {
        // Spy on bot.sendMessage to capture outgoing messages without actually sending them
        sendMessageSpy = jest.spyOn(bot, 'sendMessage').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        // Clear mock history after each test
        sendMessageSpy.mockClear();
    });

    afterAll(() => {
        // Restore original method
        sendMessageSpy.mockRestore();
    });

    it('should receive a /balance command, fetch data from the backend, and send the correct message back', async () => {
        // This test requires:
        // 1. All services running via `docker-compose up`
        // 2. NODE_ENV=test for the telegram-bot-service
        // 3. A test representative in the DB, and a logged-in admin user with a valid JWT.

        // 1. ARRANGE
        const adminChatId = 12345;
        const commandText = '/balance TestRep';
        
        // Mock the backend response from the API Gateway
        // This avoids needing a real DB record for this specific test
        jest.spyOn(axios, 'get').mockResolvedValue({
            data: { name: 'TestRep', balance: 75000 }
        });

        const mockUpdate = {
            update_id: 10000,
            message: {
                message_id: 1365,
                from: { id: adminChatId, is_bot: false, first_name: 'Test', last_name: 'Admin' },
                chat: { id: adminChatId, type: 'private' },
                date: Date.now() / 1000,
                text: commandText,
                entities: [{ offset: 0, length: 8, type: 'bot_command' }]
            }
        };

        // 2. ACT
        // Send the simulated message to our bot's test endpoint
        await axios.post(BOT_TEST_URL, mockUpdate);

        // Give the bot a moment to process the async handlers
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. ASSERT
        expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageSpy).toHaveBeenCalledWith(
            adminChatId,
            expect.stringContaining('The current balance for TestRep is 75000')
        );
    });
});
