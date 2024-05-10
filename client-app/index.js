const { Kafka } = require("kafkajs");

// Kafka broker configuration
const kafka = new Kafka({
  clientId: "client-app",
  brokers: ["kafka:29092"], // Kafka broker address
});

// Create Kafka producer
const producer = kafka.producer();

// Create Kafka consumer
const consumer = kafka.consumer({ groupId: "client-group" });

const run = async () => {
  // Connect to Kafka broker
  console.log("Client app is connecting to Kafka broker...");
  await producer.connect();
  await consumer.connect();
  console.log("Client app connected to Kafka broker successfully!");

  // Subscribe to commercial output queue (topic)
  await consumer.subscribe({ topic: "commercial-output" });
  console.log("Client app subscribed to commercial output queue successfully!");

  // Subscribe to risk processing output queue (topic)
  await consumer.subscribe({ topic: "risk-processing-output" });
  console.log(
    "Client app subscribed to risk processing output queue successfully!"
  );

  // Subscribe to credit output queue (topic)
  await consumer.subscribe({ topic: "credit-output" });
  console.log("Client app subscribed to credit output queue successfully!");

  // Sample application form data
  const applicationFormData = {
    clientId: 123,
    name: "John Doe",
    amount: 50000,
  };

  // Sample document data with Base64 encoding
  const documentData = {
    clientId: 123,
    base64Data: Buffer.from("Sample document content").toString("base64"),
  };

  // Submit loan application form
  console.log("Submitting loan application form:", applicationFormData);
  await producer.send({
    topic: "loan-application",
    messages: [{ value: JSON.stringify(applicationFormData) }],
  });
  console.log("Loan application form submitted successfully!");

  // Submit document data
  console.log("Submitting document data:", documentData);
  await producer.send({
    topic: "documents",
    messages: [{ value: JSON.stringify(documentData) }],
  });
  console.log("Document data submitted successfully!");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message from topic ${topic}: ${message.value.toString()}`
        );
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

console.log("Starting client app...");
run().catch(console.error);
