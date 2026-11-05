
import { test, expect } from '../src/fixtures/api.fixture';

test.describe('Authentication API Tests', () => {

  test('should generate token with valid credentials', async ({
    authClient,
  }) => {

    const response = await authClient.createToken({
      username: process.env.API_USERNAME!,
      password: process.env.API_PASSWORD!,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('token');
    expect(typeof responseBody.token).toBe('string');
    expect(responseBody.token.length).toBeGreaterThan(0);
  });

  test('should reject invalid credentials', async ({
    authClient,
  }) => {

    const response = await authClient.createToken({
      username: 'invalid_user',
      password: 'invalid_password',
    });

    const responseBody = await response.json();

    expect(responseBody).not.toHaveProperty('token');
    expect(responseBody.reason).toBe('Bad credentials');
  });

  test('should provide authentication token through fixture', async ({
    authToken,
  }) => {

    expect(authToken).toBeTruthy();
    expect(typeof authToken).toBe('string');
  });

});
