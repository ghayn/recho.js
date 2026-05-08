const ParseCurlAction = require('../src/actions/parse_curl');

describe('ParseCurlAction', () => {
  test('should parse a simple GET request', () => {
    const curl = 'curl https://pokeapi.co/api/v2/pokemon/pikachu';
    const result = ParseCurlAction.execute(curl);
    
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('GET');
    expect(result[0].url).toBe('https://pokeapi.co/api/v2/pokemon/pikachu');
  });

  test('should parse a POST request with headers and body', () => {
    const curl = `curl -X POST https://pokeapi.co/api/v2/pokemon \
      -H "Content-Type: application/json" \
      -d '{"name": "mew"}'`;
    const result = ParseCurlAction.execute(curl);
    
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('POST');
    expect(result[0].url).toBe('https://pokeapi.co/api/v2/pokemon');
    expect(result[0].headers.some(h => h.name === 'Content-Type' && h.value === 'application/json')).toBe(true);
    expect(result[0].postData.text).toBe('{"name": "mew"}');
  });

  test('should parse multiple curl commands', () => {
    const curl = `
      curl https://pokeapi.co/api/v2/pokemon/1
      curl https://pokeapi.co/api/v2/pokemon/2
    `;
    const result = ParseCurlAction.execute(curl);
    expect(result).toHaveLength(2);
    expect(result[0].url).toContain('/1');
    expect(result[1].url).toContain('/2');
  });
});
