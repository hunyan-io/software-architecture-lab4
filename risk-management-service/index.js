const { Kafka } = require("kafkajs");
const Database = require("./database");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "risk-management-service",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "risk-management-group" });
// Create Kafka producer
const producer = kafka.producer();

// Create database instance
const database = new Database();

const run = async () => {
  // Connect to Kafka broker
  console.log("Risk management service is connecting to Kafka broker...");
  await consumer.connect();
  await producer.connect();
  console.log(
    "Risk management service connected to Kafka broker successfully!"
  );

  // Subscribe to commercial output queue (topic)
  await consumer.subscribe({ topic: "commercial-output" });
  console.log(
    "Risk management service subscribed to commercial output queue successfully!"
  );

  // Subscribe to OCR output queue (topic)
  await consumer.subscribe({ topic: "ocr-output" });
  console.log(
    "Risk management service subscribed to OCR output queue successfully!"
  );

  // Subscribe to central bank database output queue (topic)
  await consumer.subscribe({ topic: "central-bank-database-output" });
  console.log(
    "Risk management service subscribed to Central Bank Database output queue successfully!"
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

        // Update database based on topic
        if (topic === "commercial-output") {
          database.updateCommercial(clientId, messageData);
        } else if (topic === "ocr-output") {
          database.updateOCR(clientId, messageData);
        } else if (topic === "central-bank-database-output") {
          database.updateCentralBankData(clientId, messageData);
        }

        // Check if both commercial output and OCR output are received for a client
        const clientData = database.getClientData(clientId);
        if (clientData.commercialData !== null && clientData.ocrData !== null) {
          // Publish data to central bank database input queue
          console.log(
            "Publishing data to Central Bank Database input queue..."
          );
          await producer.send({
            topic: "central-bank-database-input",
            messages: [{ value: JSON.stringify({ clientId, ...clientData }) }],
          });
          console.log(
            "Data published to Central Bank Database input queue successfully!"
          );
        }

        // Check if all necessary data is received for a client
        if (
          clientData.commercialData !== null &&
          clientData.ocrData !== null &&
          clientData.centralBankData !== null
        ) {
          // Perform risk assessment (mocked)
          const riskResult = "High"; // Mocked risk assessment result

          // Publish risk assessment result to risk processing output queue (topic)
          console.log(
            "Publishing risk assessment result to risk processing output queue..."
          );
          await producer.send({
            topic: "risk-processing-output",
            messages: [{ value: JSON.stringify({ clientId, riskResult }) }],
          });
          console.log("Risk assessment result published successfully!");
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

console.log("Starting risk management service...");
run().catch(console.error);
