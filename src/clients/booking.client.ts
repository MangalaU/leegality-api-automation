
import {
  APIRequestContext,
} from '@playwright/test';

import { API_CONFIG } from '../config/api.config';
import { Booking } from '../test-data/booking.data';

export class BookingClient {

  constructor(
    private request: APIRequestContext
  ) {}

  async getHealth() {
    return await this.request.get(
      API_CONFIG.ENDPOINTS.HEALTH
    );
  }

  async getBookingIds() {
    return await this.request.get(
      API_CONFIG.ENDPOINTS.BOOKING
    );
  }

  async getBooking(id: number) {
    return await this.request.get(
      `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`
    );
  }

  async createBooking(data: Booking) {
    return await this.request.post(
      API_CONFIG.ENDPOINTS.BOOKING,
      { data }
    );
  }

  async updateBooking(
    id: number,
    data: Booking,
    token: string
  ) {
    return await this.request.put(
      `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
      {
        data,
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
  }

  async partialUpdateBooking(
    id: number,
    data: Partial<Booking>,
    token: string
  ) {
    return await this.request.patch(
      `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
      {
        data,
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
  }

  async deleteBooking(
    id: number,
    token: string
  ) {
    return await this.request.delete(
      `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
  }
}
