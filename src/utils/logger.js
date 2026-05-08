class Logger {
  static processing(message) {
    console.log(`[○] ${message}`);
  }

  static success(message) {
    console.log(`[✓] ${message}`);
  }

  static failed(message) {
    console.error(`[✕] ${message}`);
  }
}

module.exports = Logger;
