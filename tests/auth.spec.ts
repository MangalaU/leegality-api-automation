import { test, expect, knownBug } from '../src/fixtures/api.fixture';

test.describe('Authentication API Tests', () => {

  test('should generate token with valid credentials', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: process.env.API_USERNAME!,
      password: process.env.API_PASSWORD!,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(typeof responseBody.token).toBe('string');
    expect(responseBody.token.length).toBeGreaterThan(0);
  });

  test('should not return a token for invalid credentials', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'invalid_user',
      password: 'invalid_password',
    });

    const responseBody = await response.json();

    expect(responseBody).not.toHaveProperty('token');
    expect(responseBody.reason).toBe('Bad credentials');
  });

  test('should not return a token for empty credentials', async ({ authClient }) => {
    const response = await authClient.createToken({ username: '', password: '' });

    const responseBody = await response.json();

    expect(responseBody).not.toHaveProperty('token');
    expect(responseBody.reason).toBe('Bad credentials');
  });

  test.fail(
    'should return 401 for invalid credentials',
    knownBug('BUG-001', 'failed login returns 200 OK'),
    async ({ authClient }) => {
      const response = await authClient.createToken({
        username: 'invalid_user',
        password: 'invalid_password',
      });

      expect(response.status(), await response.text()).toBe(401);
    }
  );

  test('should provide authentication token through fixture', async ({ authToken }) => {
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(0);
  });
});
