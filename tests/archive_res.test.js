const fs = require('fs');
const path = require('path');
const ArchiveResAction = require('../src/actions/archive_res');
const CONSTANTS = require('../src/constants');

describe('ArchiveResAction', () => {
  const testResponseDir = path.join(__dirname, '../responses_test');

  beforeAll(() => {
    // Override default responses dir for testing
    CONSTANTS.DEFAULT_RESPONSES_DIR = testResponseDir;
  });

  afterAll(() => {
    // Cleanup test response directory
    if (fs.existsSync(testResponseDir)) {
      fs.rmSync(testResponseDir, { recursive: true, force: true });
    }
  });

  test('should format and archive request and response to a file', () => {
    const harRequest = {
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
      headers: [{ name: 'Accept', value: 'application/json' }]
    };

    const responseInfo = {
      status: 200,
      statusText: 'OK',
      timeMs: 150,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'pikachu' }),
      fetchOptions: { method: 'GET', headers: { Accept: 'application/json' } }
    };

    const archivePath = ArchiveResAction.execute(harRequest, responseInfo, 'pikachu_test');

    expect(fs.existsSync(archivePath)).toBe(true);
    const fileName = path.basename(archivePath);
    // Matches 200-[UNIX_TIMESTAMP]-pikachu_test.txt
    expect(fileName).toMatch(/^200-\d+-pikachu_test\.txt$/);
    
    const content = fs.readFileSync(archivePath, 'utf-8');

    expect(content).toContain('[ REQUEST ]');
    expect(content).toContain('GET https://pokeapi.co/api/v2/pokemon/pikachu HTTP/1.1');
    expect(content).toContain('Accept: application/json');
    expect(content).toContain('[ NODE.JS FETCH OPTIONS ]');
    expect(content).toContain('"method": "GET"');
    expect(content).toContain('[ RESPONSE ]');
    expect(content).toContain('Status: 200 OK');
    expect(content).toContain('Time: 150 ms');
    expect(content).toContain('"name":"pikachu"');
  });
});
