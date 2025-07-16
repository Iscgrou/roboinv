import amqp from 'amqplib';

let connection = null;
let channel = null;

const connectQueue = async () => {
  if (connection) {
    return { connection, channel };
  }
  try {
    const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
    connection = await amqp.connect(amqpUrl);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error; // Re-throw to signal connection failure
  }
};

const publishMessage = async (queueName, message) => {
  try {
    if (!channel) {
      await connectQueue();
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`Message published to queue ${queueName}`);
  } catch (error) {
    console.error(`Failed to publish message to queue ${queueName}:`, error);
    throw error;
  }
};

const consumeMessages = async (queueName, consumerFunction) => {
  try {
    if (!channel) {
      await connectQueue();
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const messageContent = JSON.parse(msg.content.toString());
          console.log(`Message received from queue ${queueName}:`, messageContent);
          await consumerFunction(messageContent);
          channel.ack(msg);
        } catch (error) {
          console.error(`Error processing message from queue ${queueName}:`, error);
          // Depending on your error handling strategy, you might want to nack the message:
          // channel.nack(msg);
          channel.ack(msg); // Acknowledge to remove from queue for now, handle errors internally
        }
      }
    });
    console.log(`Started consuming messages from queue ${queueName}`);
  } catch (error) {
    console.error(`Failed to consume messages from queue ${queueName}:`, error);
    throw error;
  }
};

// Optional: Handle connection close
process.on('exit', () => {
  if (connection) {
    console.log('Closing RabbitMQ connection');
    connection.close();
  }
});

export { connectQueue, publishMessage, consumeMessages };