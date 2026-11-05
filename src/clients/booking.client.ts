import { APIRequestContext } from '@playwright/test';

import { API_CONFIG } from '../config/api.config';
import { Booking, InvalidBookingPayload } from '../test-data/booking.data';

type BookingPayload = Booking | InvalidBookingPayload;

// Token is optional so negative tests can call protected endpoints without one
const authHeader = (token?: string): Record<string, string> =>
  token === undefined ? {} : { Cookie: `token=${token}` };

export class BookingClient {
  constructor(private request: APIRequestContext) {}

  async getHealth() {
    return await this.request.get(API_CONFIG.ENDPOINTS.HEALTH);
  }

  async getBookingIds() {
    return await this.request.get(API_CONFIG.ENDPOINTS.BOOKING);
  }

  async getBooking(id: number | string) {
    return await this.request.get(`${API_CONFIG.ENDPOINTS.BOOKING}/${id}`);
  }

  async createBooking(data: BookingPayload) {
    return await this.request.post(API_CONFIG.ENDPOINTS.BOOKING, { data });
  }

  async updateBooking(id: number, data: BookingPayload, token?: string) {
    return await this.request.put(`${API_CONFIG.ENDPOINTS.BOOKING}/${id}`, {
      data,
      headers: authHeader(token),
    });
  }

  async partialUpdateBooking(id: number, data: Partial<Booking>, token?: string) {
    return await this.request.patch(`${API_CONFIG.ENDPOINTS.BOOKING}/${id}`, {
      data,
      headers: authHeader(token),
    });
  }

  async deleteBooking(id: number, token?: string) {
    return await this.request.delete(`${API_CONFIG.ENDPOINTS.BOOKING}/${id}`, {
      headers: authHeader(token),
    });
  }
}
