import { test, expect } from '../src/fixtures/api.fixture';
import { createBookingData } from '../src/test-data/booking.data';

const unauthorizedCases = [
  { name: 'no token', token: undefined },
  { name: 'an invalid token', token: 'invalid-token-123' },
];

// The API answers 403 (not 401) for both cases. The important check is that
// the booking is left untouched afterwards.
test.describe('Booking authorization', () => {

  for (const { name, token } of unauthorizedCases) {

    test(`PUT should be rejected with ${name}`, async ({ bookingClient, createdBooking }) => {
      const response = await bookingClient.updateBooking(
        createdBooking.id,
        createBookingData('Hacker'),
        token
      );

      expect(response.status()).toBe(403);

      const getResponse = await bookingClient.getBooking(createdBooking.id);
      expect(await getResponse.json()).toEqual(createdBooking.data);
    });

    test(`PATCH should be rejected with ${name}`, async ({ bookingClient, createdBooking }) => {
      const response = await bookingClient.partialUpdateBooking(
        createdBooking.id,
        { firstname: 'Hacker' },
        token
      );

      expect(response.status()).toBe(403);

      const getResponse = await bookingClient.getBooking(createdBooking.id);
      expect(await getResponse.json()).toEqual(createdBooking.data);
    });

    test(`DELETE should be rejected with ${name}`, async ({ bookingClient, createdBooking }) => {
      const response = await bookingClient.deleteBooking(createdBooking.id, token);

      expect(response.status()).toBe(403);

      const getResponse = await bookingClient.getBooking(createdBooking.id);
      expect(getResponse.status()).toBe(200);
    });
  }
});
