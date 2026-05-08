const fs = require('fs');
const path = require('path');

class FileSystemUtil {
  /**
   * Cleans a string to be a safe filename by replacing reserved characters.
   * @param {string} name - The original string (e.g., URL)
   * @returns {string} - The sanitized filename
   */
  static sanitizeFilename(name) {
    // Replace reserved characters : / \ ? % * | " < > with an underscore or a safe character
    return name.replace(/[:/\\?%*|"<>]/g, '_');
  }

  /**
   * Ensures the given directory exists. If not, it creates it synchronously.
   * @param {string} dirPath - The directory path to ensure
   */
  static ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Writes content to a file. Ensures the parent directory exists.
   * @param {string} filePath - Path to write the file
   * @param {string} content - The content to write
   */
  static writeFileSync(filePath, content) {
    const dir = path.dirname(filePath);
    this.ensureDirSync(dir);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  /**
   * Reads a file synchronously.
   * @param {string} filePath 
   * @returns {string} content
   */
  static readFileSync(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
  }
}

module.exports = FileSystemUtil;
