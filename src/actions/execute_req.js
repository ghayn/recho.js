class ExecuteReqAction {
  /**
   * Executes a parsed HAR request using native fetch.
   * @param {Object} harRequest - The HAR request object
   * @returns {Promise<Object>} - An object containing response details
   */
  static async execute(harRequest) {
    const { method, url, headers, postData } = harRequest;

    const fetchOptions = {
      method: method,
      headers: {},
    };

    // Map HAR headers to fetch headers
    if (headers && headers.length > 0) {
      headers.forEach(h => {
        fetchOptions.headers[h.name] = h.value;
      });
    }

    // Handle body
    if (postData && postData.text) {
      fetchOptions.body = postData.text;
    } else if (postData && postData.params && postData.params.length > 0) {
      // url-encoded params
      const params = new URLSearchParams();
      postData.params.forEach(p => params.append(p.name, p.value));
      fetchOptions.body = params.toString();
    }

    const startTime = Date.now();
    try {
      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      const endTime = Date.now();

      // Extract response headers
      const resHeaders = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      return {
        url: url,
        method: method,
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
        body: text,
        timeMs: endTime - startTime,
        fetchOptions: fetchOptions, // Added: exact options used by Node.js fetch
      };
    } catch (error) {
      throw new Error(`Network Request Failed: ${error.message}`);
    }
  }
}

module.exports = ExecuteReqAction;
