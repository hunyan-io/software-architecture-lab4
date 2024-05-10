class Database {
  constructor() {
    this.clients = new Map();
  }

  // Method to update commercial data for a client
  updateCommercial(clientId, commercialData) {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        commercialData: null,
        ocrData: null,
        centralBankData: null,
      });
    }
    this.clients.get(clientId).commercialData = commercialData;
  }

  // Method to update OCR data for a client
  updateOCR(clientId, ocrData) {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        commercialData: null,
        ocrData: null,
        centralBankData: null,
      });
    }
    this.clients.get(clientId).ocrData = ocrData;
  }

  // Method to update central bank data for a client
  updateCentralBankData(clientId, centralBankData) {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        commercialData: null,
        ocrData: null,
        centralBankData: null,
      });
    }
    this.clients.get(clientId).centralBankData = centralBankData;
  }

  // Method to get client data
  getClientData(clientId) {
    return this.clients.get(clientId);
  }
}

module.exports = Database;
