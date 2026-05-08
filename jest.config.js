module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(curlconverter)/)"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  }
};
