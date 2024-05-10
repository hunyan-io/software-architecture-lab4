class FileStorage {
  constructor() {
    this.files = [];
    this.nextId = 1;
  }

  save(content) {
    const fileId = this.nextId++;
    this.files.push({ id: fileId, content });
    return fileId;
  }

  getUrl(fileId) {
    const file = this.files.find((f) => f.id === fileId);
    if (file) {
      return `https://example.com/files/${file.id}`;
    }
    return null;
  }
}

module.exports = FileStorage;
