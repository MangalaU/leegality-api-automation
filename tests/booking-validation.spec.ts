import { test, expect, knownBug } from '../src/fixtures/api.fixture';
import {
  Booking,
  bookingWith,
  bookingWithout,
  createBookingData,
} from '../src/test-data/booking.data';

// Tests marked test.fail() describe the correct behaviour and currently fail
// because of a known API defect. If the API gets fixed, Playwright flags them.

test.describe('POST /booking - boundary values', () => {

  test('should accept a total price of zero', async ({ bookingClient, trackBooking }) => {
    const response = await bookingClient.createBooking(bookingWith({ totalprice: 0 }));
    await trackBooking(response);

    expect(response.status()).toBe(200);
    expect((await response.json()).booking.totalprice).toBe(0);
  });

  test('should accept a booking without the optional additionalneeds field', async ({
    bookingClient,
    trackBooking,
  }) => {
    const response = await bookingClient.createBooking(bookingWithout('additionalneeds'));
    await trackBooking(response);

    expect(response.status()).toBe(200);
    expect((await response.json()).booking).not.toHaveProperty('additionalneeds');
  });

  test('should return 400 for a malformed JSON body', async ({ request }) => {
    const response = await request.post('/booking', { data: '{"firstname": "John",' });

    expect(response.status()).toBe(400);
  });
});

test.describe('POST /booking - invalid data', () => {

  test.fail(
    'should reject a negative total price',
    knownBug('BUG-002', 'negative totalprice is accepted'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(bookingWith({ totalprice: -500 }));
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should reject a checkout date earlier than the checkin date',
    knownBug('BUG-003', 'checkout before checkin is accepted'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(
        bookingWith({ bookingdates: { checkin: '2027-01-15', checkout: '2027-01-10' } })
      );
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should reject booking dates that are not valid dates',
    knownBug('BUG-004', 'invalid dates are stored as "0NaN-aN-aN"'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(
        bookingWith({ bookingdates: { checkin: 'not-a-date', checkout: '2027-13-45' } })
      );
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should reject a non-numeric total price',
    knownBug('BUG-006', 'wrong data types are silently coerced'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(bookingWith({ totalprice: 'abc' }));
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should reject a non-boolean depositpaid value',
    knownBug('BUG-006', 'wrong data types are silently coerced'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(bookingWith({ depositpaid: 'yes' }));
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should keep the decimal part of the total price',
    knownBug('BUG-007', 'decimal totalprice is truncated'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(bookingWith({ totalprice: 99.99 }));
      await trackBooking(response);

      expect(response.status()).toBe(200);
      expect((await response.json()).booking.totalprice).toBe(99.99);
    }
  );

  const mandatoryFields: (keyof Booking)[] = [
    'firstname',
    'lastname',
    'totalprice',
    'depositpaid',
    'bookingdates',
  ];

  for (const field of mandatoryFields) {
    test.fail(
      `should return 400 when ${field} is missing`,
      knownBug('BUG-005', 'invalid input causes 500 instead of 400'),
      async ({ bookingClient, trackBooking }) => {
        const response = await bookingClient.createBooking(bookingWithout(field));
        await trackBooking(response);

        expect(response.status(), await response.text()).toBe(400);
      }
    );
  }

  test.fail(
    'should return 400 for an empty request body',
    knownBug('BUG-005', 'invalid input causes 500 instead of 400'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking({});
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'should return 400 when firstname is a number',
    knownBug('BUG-005', 'invalid input causes 500 instead of 400'),
    async ({ bookingClient, trackBooking }) => {
      const response = await bookingClient.createBooking(bookingWith({ firstname: 12345 }));
      await trackBooking(response);

      expect(response.status(), await response.text()).toBe(400);
    }
  );
});

test.describe('GET /booking/{id} - invalid IDs', () => {

  test('should return 404 for a booking ID that does not exist', async ({
    bookingClient,
    deletedBookingId,
  }) => {
    const response = await bookingClient.getBooking(deletedBookingId);

    expect(response.status()).toBe(404);
  });

  test('should return 404 for a non-numeric booking ID', async ({ bookingClient }) => {
    const response = await bookingClient.getBooking('abc');

    expect(response.status()).toBe(404);
  });
});

test.describe('PUT / PATCH / DELETE - invalid requests', () => {

  test('PUT should return 400 when mandatory fields are missing', async ({
    bookingClient,
    authToken,
    createdBooking,
  }) => {
    const response = await bookingClient.updateBooking(
      createdBooking.id,
      { firstname: 'OnlyFirstName' },
      authToken
    );

    expect(response.status()).toBe(400);

    const getResponse = await bookingClient.getBooking(createdBooking.id);
    expect(await getResponse.json()).toEqual(createdBooking.data);
  });

  test.fail(
    'PATCH should reject a negative total price',
    knownBug('BUG-002', 'negative totalprice is accepted'),
    async ({ bookingClient, authToken, createdBooking }) => {
      const response = await bookingClient.partialUpdateBooking(
        createdBooking.id,
        { totalprice: -1 },
        authToken
      );

      expect(response.status(), await response.text()).toBe(400);
    }
  );

  test.fail(
    'PUT should return 404 for a booking that does not exist',
    knownBug('BUG-008', 'missing booking returns 405 instead of 404'),
    async ({ bookingClient, authToken, deletedBookingId }) => {
      const response = await bookingClient.updateBooking(
        deletedBookingId,
        createBookingData(),
        authToken
      );

      expect(response.status()).toBe(404);
    }
  );

  test.fail(
    'PATCH should return 404 for a booking that does not exist',
    knownBug('BUG-008', 'missing booking returns 405 instead of 404'),
    async ({ bookingClient, authToken, deletedBookingId }) => {
      const response = await bookingClient.partialUpdateBooking(
        deletedBookingId,
        { firstname: 'Nobody' },
        authToken
      );

      expect(response.status()).toBe(404);
    }
  );

  test.fail(
    'DELETE should return 404 for a booking that does not exist',
    knownBug('BUG-008', 'missing booking returns 405 instead of 404'),
    async ({ bookingClient, authToken, deletedBookingId }) => {
      const response = await bookingClient.deleteBooking(deletedBookingId, authToken);

      expect(response.status()).toBe(404);
    }
  );
});
