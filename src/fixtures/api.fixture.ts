import { test as base, expect } from '@playwright/test';

import { BookingClient } from '../clients/booking.client';
import { AuthClient } from '../clients/auth.client';
import { Booking, createBookingData } from '../test-data/booking.data';

type CreatedBooking = {
  id: number;
  data: Booking;
};

type ApiFixtures = {
  bookingClient: BookingClient;
  authClient: AuthClient;
  authToken: string;
  createdBooking: CreatedBooking;
};

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  authToken: async ({ authClient }, use) => {
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'API_USERNAME or API_PASSWORD is missing from environment variables'
      );
    }

    const response = await authClient.createToken({ username, password });

    if (!response.ok()) {
      throw new Error(`Authentication failed with status: ${response.status()}`);
    }

    const responseBody = await response.json();

    if (typeof responseBody.token !== 'string' || responseBody.token.length === 0) {
      throw new Error(
        `Authentication token missing: ${JSON.stringify(responseBody)}`
      );
    }

    await use(responseBody.token);
  },

  // Fresh booking per test, deleted afterwards so tests never share data
  createdBooking: async ({ bookingClient, authToken }, use) => {
    const data = createBookingData();
    const response = await bookingClient.createBooking(data);

    expect(response.status(), 'booking setup failed').toBe(200);

    const responseBody = await response.json();
    const id = responseBody.bookingid;

    expect(typeof id, 'bookingid should be a number').toBe('number');

    await use({ id, data });

    await bookingClient.deleteBooking(id, authToken);
  },
});

export { expect };
