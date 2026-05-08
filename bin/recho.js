#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const CONSTANTS = require('../src/constants');
const ParseCurlAction = require('../src/actions/parse_curl');
const ExecuteReqAction = require('../src/actions/execute_req');
const ArchiveResAction = require('../src/actions/archive_res');
const Logger = require('../src/utils/logger');
const FileSystemUtil = require('../src/utils/file_system');

async function processFile(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  Logger.processing(`Reading file: ${fileName}`);

  try {
    const curlText = FileSystemUtil.readFileSync(filePath);
    if (!curlText.trim()) {
      Logger.failed(`${fileName} - File is empty`);
      return;
    }

    const harRequests = ParseCurlAction.execute(curlText);
    if (harRequests.length === 0) {
      Logger.failed(`${fileName} - No valid cURL requests found`);
      return;
    }

    // Process all requests in the file (often there's just one)
    for (let i = 0; i < harRequests.length; i++) {
      const harRequest = harRequests[i];
      const requestName = harRequests.length > 1 ? `${fileName}_req${i + 1}` : fileName;
      
      Logger.processing(`${requestName} - Executing ${harRequest.method} ${harRequest.url}`);
      
      try {
        const responseInfo = await ExecuteReqAction.execute(harRequest);
        const archivePath = ArchiveResAction.execute(harRequest, responseInfo, requestName);
        Logger.success(`${requestName} - Successfully archived to ${path.basename(archivePath)}`);
      } catch (reqError) {
        Logger.failed(`${requestName} - Execution/Archiving failed: ${reqError.message}`);
      }
    }
  } catch (error) {
    Logger.failed(`${fileName} - Processing failed: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let filesToProcess = [];

  if (args.length > 0) {
    // Treat args as file paths
    filesToProcess = args.map(arg => path.resolve(process.cwd(), arg));
  } else {
    // Process default requests directory
    FileSystemUtil.ensureDirSync(CONSTANTS.DEFAULT_REQUESTS_DIR);
    FileSystemUtil.ensureDirSync(CONSTANTS.DEFAULT_RESPONSES_DIR);

    const files = fs.readdirSync(CONSTANTS.DEFAULT_REQUESTS_DIR);
    filesToProcess = files
      .filter(file => fs.statSync(path.join(CONSTANTS.DEFAULT_REQUESTS_DIR, file)).isFile())
      .map(file => path.join(CONSTANTS.DEFAULT_REQUESTS_DIR, file));
  }

  if (filesToProcess.length === 0) {
    console.log("No cURL files found in the requests directory or provided as arguments.");
    console.log(`Add your .txt or .curl files to ${CONSTANTS.DEFAULT_REQUESTS_DIR} or pass them directly.`);
    return;
  }

  for (const filePath of filesToProcess) {
    await processFile(filePath);
  }
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
