const curlconverter = require('curlconverter');

class ParseCurlAction {
  /**
   * Parses a raw cURL string into an array of structured request objects.
   * @param {string} curlText - The raw cURL string (can contain multiple cURL commands and multiple lines)
   * @returns {Array<Object>} - Array of parsed HAR request objects
   */
  static execute(curlText) {
    try {
      // toHarString converts the cURL command(s) into a HAR representation string
      const harString = curlconverter.toHarString(curlText);
      const harData = JSON.parse(harString);
      
      // Extract the request array from HAR
      if (harData && harData.log && harData.log.entries) {
        return harData.log.entries.map(entry => entry.request);
      }
      return [];
    } catch (error) {
      throw new Error(`Failed to parse cURL: ${error.message}`);
    }
  }
}

module.exports = ParseCurlAction;
