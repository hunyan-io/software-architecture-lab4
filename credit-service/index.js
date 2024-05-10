// credit-service.js
const { Kafka } = require("kafkajs");
const FileStorage = require("./file-storage");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "credit-service",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "credit-group" });
// Create Kafka producer
const producer = kafka.producer();

// Create FileStorage instance
const fileStorage = new FileStorage();

const run = async () => {
  // Connect to Kafka broker
  console.log("Credit service is connecting to Kafka broker...");
  await consumer.connect();
  await producer.connect();
  console.log("Credit service connected to Kafka broker successfully!");

  // Subscribe to risk processing output queue (topic)
  await consumer.subscribe({ topic: "risk-processing-output" });
  console.log(
    "Credit service subscribed to risk processing output queue successfully!"
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message from topic ${topic}: ${message.value.toString()}`
        );

        // Process message
        const messageData = JSON.parse(message.value.toString());
        const clientId = messageData.clientId;

        // Save document to file storage and get fileId
        const fileId = fileStorage.save("Credit document content");

        // Get file URL
        const fileUrl = fileStorage.getUrl(fileId);

        // Publish document URL to credit output queue (topic)
        console.log("Publishing document URL to credit output queue...");
        await producer.send({
          topic: "credit-output",
          messages: [{ value: JSON.stringify({ clientId, fileUrl }) }],
        });
        console.log("Document URL published successfully!");
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

console.log("Starting credit service...");
run().catch(console.error);
