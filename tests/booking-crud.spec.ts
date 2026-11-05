import { test, expect } from '../src/fixtures/api.fixture';
import { createBookingData } from '../src/test-data/booking.data';

test.describe('Booking CRUD API Tests', () => {

  test('should create a new booking successfully', async ({
    bookingClient,
    authToken,
  }) => {
    const bookingData = createBookingData();

    const response = await bookingClient.createBooking(bookingData);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(typeof responseBody.bookingid).toBe('number');
    expect(responseBody.booking).toEqual(bookingData);

    await bookingClient.deleteBooking(responseBody.bookingid, authToken);
  });

  test('should retrieve an existing booking by ID', async ({
    bookingClient,
    createdBooking,
  }) => {
    const response = await bookingClient.getBooking(createdBooking.id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(createdBooking.data);
  });

  test('should include a newly created booking in the booking IDs list', async ({
    bookingClient,
    createdBooking,
  }) => {
    const response = await bookingClient.getBookingIds();

    expect(response.status()).toBe(200);

    const bookingIds: { bookingid: number }[] = await response.json();

    expect(Array.isArray(bookingIds)).toBe(true);
    expect(bookingIds.length).toBeGreaterThan(0);
    expect(bookingIds).toContainEqual({ bookingid: createdBooking.id });
  });

  test('should fully update an existing booking using PUT', async ({
    bookingClient,
    authToken,
    createdBooking,
  }) => {
    const updatedData = {
      ...createBookingData('UpdatedJohn', 'UpdatedSmith'),
      totalprice: 250,
      depositpaid: false,
      bookingdates: { checkin: '2027-02-01', checkout: '2027-02-05' },
      additionalneeds: 'Late checkout',
    };

    const updateResponse = await bookingClient.updateBooking(
      createdBooking.id,
      updatedData,
      authToken
    );

    expect(updateResponse.status()).toBe(200);
    expect(await updateResponse.json()).toEqual(updatedData);

    // Confirm the change was actually persisted, not just echoed back
    const getResponse = await bookingClient.getBooking(createdBooking.id);
    expect(await getResponse.json()).toEqual(updatedData);
  });

  test('should partially update an existing booking using PATCH', async ({
    bookingClient,
    authToken,
    createdBooking,
  }) => {
    const patchData = { firstname: 'PatchedJohn', totalprice: 999 };

    const patchResponse = await bookingClient.partialUpdateBooking(
      createdBooking.id,
      patchData,
      authToken
    );

    expect(patchResponse.status()).toBe(200);

    const expectedBooking = { ...createdBooking.data, ...patchData };

    expect(await patchResponse.json()).toEqual(expectedBooking);

    // Fields not in the PATCH body should be untouched
    const getResponse = await bookingClient.getBooking(createdBooking.id);
    expect(await getResponse.json()).toEqual(expectedBooking);
  });

  test('should delete an existing booking and return 404 afterwards', async ({
    bookingClient,
    authToken,
  }) => {
    const createResponse = await bookingClient.createBooking(createBookingData());
    expect(createResponse.status()).toBe(200);

    const { bookingid } = await createResponse.json();

    const deleteResponse = await bookingClient.deleteBooking(bookingid, authToken);

    // API returns 201 Created on delete rather than 200/204
    expect(deleteResponse.status()).toBe(201);

    const getResponse = await bookingClient.getBooking(bookingid);
    expect(getResponse.status()).toBe(404);
  });

});
