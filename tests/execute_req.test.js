const nock = require('nock');
const ExecuteReqAction = require('../src/actions/execute_req');

describe('ExecuteReqAction', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('should execute a GET request and return response info', async () => {
    const scope = nock('https://pokeapi.co')
      .get('/api/v2/pokemon/pikachu')
      .reply(200, { name: 'pikachu' }, { 'Content-Type': 'application/json' });

    const harRequest = {
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
      headers: []
    };

    const result = await ExecuteReqAction.execute(harRequest);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body).name).toBe('pikachu');
    expect(result.headers['content-type']).toBe('application/json');
    expect(result.timeMs).toBeGreaterThanOrEqual(0);
    expect(result.fetchOptions).toBeDefined();
    expect(result.fetchOptions.method).toBe('GET');
    scope.done();
  });

  test('should execute a POST request with body', async () => {
    const scope = nock('https://pokeapi.co')
      .post('/api/v2/pokemon', { name: 'mew' })
      .reply(201, { created: true });

    const harRequest = {
      method: 'POST',
      url: 'https://pokeapi.co/api/v2/pokemon',
      headers: [{ name: 'Content-Type', value: 'application/json' }],
      postData: {
        text: JSON.stringify({ name: 'mew' })
      }
    };

    const result = await ExecuteReqAction.execute(harRequest);

    expect(result.status).toBe(201);
    expect(JSON.parse(result.body).created).toBe(true);
    scope.done();
  });

  test('should handle network errors gracefully', async () => {
    nock('https://pokeapi.co')
      .get('/api/v2/pokemon/unknown')
      .replyWithError('Something went wrong');

    const harRequest = {
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/unknown',
      headers: []
    };

    await expect(ExecuteReqAction.execute(harRequest)).rejects.toThrow('Network Request Failed: Something went wrong');
  });

  test('should handle cookies correctly and map them to the Cookie header', async () => {
    const scope = nock('https://example.com')
      .get('/')
      .matchHeader('Cookie', 'session=123; user=ghayn')
      .reply(200, 'OK');

    const harRequest = {
      method: 'GET',
      url: 'https://example.com/',
      headers: [],
      cookies: [
        { name: 'session', value: '123' },
        { name: 'user', value: 'ghayn' }
      ]
    };

    const result = await ExecuteReqAction.execute(harRequest);

    expect(result.status).toBe(200);
    expect(result.fetchOptions.headers['Cookie']).toBe('session=123; user=ghayn');
    scope.done();
  });
});
