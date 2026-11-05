import { test as base, expect, APIResponse } from '@playwright/test';

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
  deletedBookingId: number;
  trackBooking: (response: APIResponse) => Promise<void>;
};

// Links a test to its entry in BUGS.md so it shows up in the HTML report
export const knownBug = (id: string, summary: string) => ({
  annotation: { type: 'bug', description: `${id}: ${summary}` },
});

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

  // An ID that definitely does not exist: created, then deleted
  deletedBookingId: async ({ bookingClient, authToken }, use) => {
    const response = await bookingClient.createBooking(createBookingData());
    expect(response.status(), 'booking setup failed').toBe(200);

    const { bookingid } = await response.json();
    await bookingClient.deleteBooking(bookingid, authToken);

    await use(bookingid);
  },

  // Negative tests call this so bookings the API wrongly accepts still get removed
  trackBooking: async ({ bookingClient, authToken }, use) => {
    const ids: number[] = [];

    await use(async (response) => {
      if (!response.ok()) return;
      const body = await response.json().catch(() => null);
      if (typeof body?.bookingid === 'number') ids.push(body.bookingid);
    });

    for (const id of ids) {
      await bookingClient.deleteBooking(id, authToken);
    }
  },
});

export { expect };
