const { Kafka } = require("kafkajs");
const Database = require("./database");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "commercial-service",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "commercial-group" });
// Create Kafka producer
const producer = kafka.producer();

// Create database instance
const database = new Database();

const run = async () => {
  // Connect to Kafka broker
  console.log("Commercial service is connecting to Kafka broker...");
  await consumer.connect();
  await producer.connect();
  console.log("Commercial service connected to Kafka broker successfully!");

  // Subscribe to loan application queue (topic)
  await consumer.subscribe({ topic: "loan-application" });
  console.log(
    "Commercial service subscribed to loan application queue successfully!"
  );

  // Subscribe to OCR output queue (topic)
  await consumer.subscribe({ topic: "ocr-output" });
  console.log(
    "Commercial service subscribed to OCR output queue successfully!"
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

        if (topic === "loan-application") {
          // Update database with loan application data
          database.updateLoanApplication(clientId, messageData);
        } else if (topic === "ocr-output") {
          // Update database with OCR output data
          database.updateOCR(clientId, messageData);
        }

        // Check if both loan application and OCR data are received for a client
        const clientData = database.getClientData(clientId);
        if (
          clientData.loanApplication !== null &&
          clientData.ocrOutput !== null
        ) {
          // Perform commercial assessment (mocked)
          const commercialResult = "Approved"; // Mocked commercial assessment result

          // Publish assessment result to commercial output queue (topic)
          console.log(
            "Publishing assessment result to commercial output queue..."
          );
          await producer.send({
            topic: "commercial-output",
            messages: [
              { value: JSON.stringify({ clientId, commercialResult }) },
            ],
          });
          console.log("Assessment result published successfully!");
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

console.log("Starting commercial service...");
run().catch(console.error);
