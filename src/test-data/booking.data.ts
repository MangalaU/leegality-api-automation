export const validBooking = {
    firstname: 'Krushal',
    lastname: 'Mishra',
    totalPrice: 200,
    depositpaid: true,

    bookingdates:{
        checkin: '2026-11-20',
        checkout: '2026-11-21',
  },

  additionalneeds: 'Breakfast',
};

 export const invalidBooking = {
    ...validBooking,
    totalprice:-500,
 };