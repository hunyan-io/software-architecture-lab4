class Database {
  constructor() {
    this.clients = new Map();
  }

  // Method to update loan application data for a client
  updateLoanApplication(clientId, loanApplication) {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { loanApplication: null, ocrOutput: null });
    }
    this.clients.get(clientId).loanApplication = loanApplication;
  }

  // Method to update OCR output data for a client
  updateOCR(clientId, ocrOutput) {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { loanApplication: null, ocrOutput: null });
    }
    this.clients.get(clientId).ocrOutput = ocrOutput;
  }

  // Method to get client data
  getClientData(clientId) {
    return this.clients.get(clientId);
  }
}

module.exports = Database;
