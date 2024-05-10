const { Kafka } = require("kafkajs");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "central-bank-database-service",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "central-bank-database-group" });
// Create Kafka producer
const producer = kafka.producer();

const run = async () => {
  // Connect to Kafka broker
  console.log("Central Bank Database service is connecting to Kafka broker...");
  await consumer.connect();
  await producer.connect();
  console.log(
    "Central Bank Database service connected to Kafka broker successfully!"
  );

  // Subscribe to central bank database input queue (topic)
  await consumer.subscribe({ topic: "central-bank-database-input" });
  console.log(
    "Central Bank Database service subscribed to central bank database input queue successfully!"
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message from topic ${topic}: ${message.value.toString()}`
        );

        // Process message (mocked processing)
        const processedData = JSON.parse(message.value.toString());
        const cleanHistory = true; // Mocked clean history

        // Publish processed data to central bank database output queue (topic)
        console.log(
          "Publishing processed data to central bank database output queue..."
        );
        await producer.send({
          topic: "central-bank-database-output",
          messages: [
            {
              value: JSON.stringify({
                clientId: processedData.clientId,
                cleanHistory,
              }),
            },
          ],
        });
        console.log("Processed data published successfully!");
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

console.log("Starting Central Bank Database service...");
run().catch(console.error);
