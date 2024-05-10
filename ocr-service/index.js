const { Kafka } = require("kafkajs");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "ocr-service",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "ocr-group" });

const run = async () => {
  // Connect to Kafka broker
  console.log("OCR service is connecting to Kafka broker...");
  await consumer.connect();
  console.log("OCR service connected to Kafka broker successfully!");

  // Subscribe to documents queue (topic)
  await consumer.subscribe({ topic: "documents" });
  console.log("OCR service subscribed to documents queue successfully!");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message from topic ${topic}: ${message.value.toString()}`
        );

        // Decode Base64-encoded document data
        const documentData = JSON.parse(message.value.toString());
        const base64Data = documentData.base64Data;

        // Perform OCR (in this case, simply decode Base64 data)
        const ocrData = {
          clientId: documentData.clientId,
          content: Buffer.from(base64Data, "base64").toString("utf-8"),
        };

        // Publish OCR data to OCR output queue (topic)
        console.log("Publishing OCR data to OCR output queue:", ocrData);
        await producer.send({
          topic: "ocr-output",
          messages: [{ value: JSON.stringify(ocrData) }],
        });
        console.log("OCR data published successfully!");
      } catch (error) {
        console.error("Error processing document:", error);
      }
    },
  });
};

console.log("Starting OCR service...");
run().catch(console.error);
