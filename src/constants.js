const path = require('path');

const CONSTANTS = {
  DEFAULT_REQUESTS_DIR: path.join(process.cwd(), 'requests'),
  DEFAULT_RESPONSES_DIR: path.join(process.cwd(), 'responses'),
};

module.exports = CONSTANTS;
