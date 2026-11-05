import { test, expect } from '../src/fixtures/api.fixture';

test.describe('Health Check API', () => {
  test('GET /ping should confirm the API is up', async ({ bookingClient }) => {
    const response = await bookingClient.getHealth();

    // restful-booker returns 201 Created for a health check
    expect(response.status()).toBe(201);
  });
});
