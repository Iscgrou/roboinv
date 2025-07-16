import { publishMessage } from '../shared/messageQueue';

async function sendJsonFileUploadMessage() {
  const message = { filename: 'consumption.json', timestamp: new Date() };
  const queueName = 'json_file_uploads';

  try {
    await publishMessage(queueName, message);
    console.log(`Message published to queue "${queueName}":`, message);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

// Example usage (in a real bot, this would be triggered by a file upload event)
// sendJsonFileUploadMessage();