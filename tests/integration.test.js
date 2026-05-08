const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nock = require('nock');

describe('Recho CLI Integration', () => {
  const testRoot = path.join(__dirname, '../integration_test_env');
  const requestsDir = path.join(testRoot, 'requests');
  const responsesDir = path.join(testRoot, 'responses');
  const rechoBin = path.join(__dirname, '../bin/recho.js');

  beforeAll(() => {
    if (!fs.existsSync(testRoot)) fs.mkdirSync(testRoot);
    if (!fs.existsSync(requestsDir)) fs.mkdirSync(requestsDir);
    if (!fs.existsSync(responsesDir)) fs.mkdirSync(responsesDir);
  });

  afterAll(() => {
    if (fs.existsSync(testRoot)) {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    nock.cleanAll();
    // Clear responses before each test
    if (fs.existsSync(responsesDir)) {
      const files = fs.readdirSync(responsesDir);
      for (const file of files) {
        fs.unlinkSync(path.join(responsesDir, file));
      }
    }
    // Clear requests before each test to ensure isolation
    if (fs.existsSync(requestsDir)) {
      const files = fs.readdirSync(requestsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(requestsDir, file));
      }
    }
  });

  test('should process all files in requests directory by default', () => {
    // Create two mock curl files
    fs.writeFileSync(path.join(requestsDir, 'test1.curl'), 'curl https://pokeapi.co/api/v2/pokemon/1');
    fs.writeFileSync(path.join(requestsDir, 'test2.curl'), 'curl https://pokeapi.co/api/v2/pokemon/2');

    nock('https://pokeapi.co').get('/api/v2/pokemon/1').reply(200, { id: 1 });
    nock('https://pokeapi.co').get('/api/v2/pokemon/2').reply(200, { id: 2 });

    // Run recho from within the testRoot to use its requests/responses folders
    // We set CWD to testRoot so recho uses the local requests/responses dirs
    execSync(`node ${rechoBin}`, { cwd: testRoot });

    const archivedFiles = fs.readdirSync(responsesDir);
    expect(archivedFiles.length).toBe(2);
    expect(archivedFiles.some(f => f.startsWith('200-') && f.includes('test1'))).toBe(true);
    expect(archivedFiles.some(f => f.startsWith('200-') && f.includes('test2'))).toBe(true);
  });

  test('should process a specific file when passed as argument', () => {
    const specificFile = path.join(testRoot, 'single.curl');
    fs.writeFileSync(specificFile, 'curl https://pokeapi.co/api/v2/pokemon/pikachu');

    nock('https://pokeapi.co').get('/api/v2/pokemon/pikachu').reply(200, { name: 'pikachu' });

    execSync(`node ${rechoBin} ${specificFile}`, { cwd: testRoot });

    const archivedFiles = fs.readdirSync(responsesDir);
    expect(archivedFiles.length).toBe(1);
    expect(archivedFiles[0]).toMatch(/^200-/);
    expect(archivedFiles[0]).toContain('single');
  });

  test('should not crash if one request fails (Zero Crash Principle)', () => {
    fs.writeFileSync(path.join(requestsDir, 'good.curl'), 'curl https://pokeapi.co/api/v2/pokemon/1');
    fs.writeFileSync(path.join(requestsDir, 'bad.curl'), 'curl https://nonexistent-domain-12345.com/fail');

    nock('https://pokeapi.co').get('/api/v2/pokemon/1').reply(200, { id: 1 });
    // No nock for nonexistent-domain, it should fail naturally or via replyWithError if mocked
    nock('https://nonexistent-domain-12345.com').get('/fail').replyWithError('Network error');

    // Should complete without throwing error to shell
    execSync(`node ${rechoBin}`, { cwd: testRoot });

    const archivedFiles = fs.readdirSync(responsesDir);
    // Only the 'good' one should be archived (assuming our current logic skips archiving on total failure)
    // In our implementation, ExecuteReqAction throws, and processFile catches it and logs error.
    expect(archivedFiles.length).toBe(1); 
    expect(archivedFiles[0]).toContain('good');
  });
});
