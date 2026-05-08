const path = require('path');
const FileSystemUtil = require('../utils/file_system');
const CONSTANTS = require('../constants');

class ArchiveResAction {
  /**
   * Formats the request and response and writes to the file system.
   * @param {Object} harRequest - The original request info
   * @param {Object} responseInfo - The response info from ExecuteReqAction
   * @param {string} originalFileName - The name of the file being processed
   * @returns {string} - The path of the written archive file
   */
  static execute(harRequest, responseInfo, originalFileName = 'request') {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const fileName = `${responseInfo.status}-${timestamp}-${originalFileName}.txt`;
    
    // Default to the responses directory
    const filePath = path.join(CONSTANTS.DEFAULT_RESPONSES_DIR, fileName);

    let content = `================================================================================\n`;
    content += `[ REQUEST ]\n`;
    content += `================================================================================\n`;
    content += `${harRequest.method} ${harRequest.url} HTTP/1.1\n`;
    
    if (harRequest.headers && harRequest.headers.length > 0) {
      harRequest.headers.forEach(h => {
        content += `${h.name}: ${h.value}\n`;
      });
    }

    if (harRequest.postData) {
      content += `\n`;
      if (harRequest.postData.text) {
        content += `${harRequest.postData.text}\n`;
      } else if (harRequest.postData.params && harRequest.postData.params.length > 0) {
        const params = new URLSearchParams();
        harRequest.postData.params.forEach(p => params.append(p.name, p.value));
        content += `${params.toString()}\n`;
      }
    }

    content += `\n================================================================================\n`;
    content += `[ NODE.JS FETCH OPTIONS ]\n`;
    content += `================================================================================\n`;
    content += JSON.stringify(responseInfo.fetchOptions, null, 2) + `\n`;

    content += `\n================================================================================\n`;
    content += `[ RESPONSE ]\n`;
    content += `================================================================================\n`;
    content += `Status: ${responseInfo.status} ${responseInfo.statusText}\n`;
    content += `Time: ${responseInfo.timeMs} ms\n\n`;
    
    if (responseInfo.headers) {
      for (const [key, value] of Object.entries(responseInfo.headers)) {
        content += `${key}: ${value}\n`;
      }
    }
    
    content += `\n${responseInfo.body || ''}\n`;
    content += `================================================================================\n`;

    FileSystemUtil.writeFileSync(filePath, content);
    return filePath;
  }
}

module.exports = ArchiveResAction;
