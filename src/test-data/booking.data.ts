// A type alias (not an interface) so it can be passed straight to toMatchObject()
export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds?: string;
};

export const createBookingData = (
  firstname = 'John',
  lastname = 'Smith'
): Booking => {
  return {
    // Timestamp keeps each booking unique on the shared sandbox
    firstname: `${firstname}_${Date.now()}`,
    lastname,
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2027-01-10',
      checkout: '2027-01-15',
    },
    additionalneeds: 'Breakfast',
  };
};
