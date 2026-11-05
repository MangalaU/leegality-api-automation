# Bugs Found

API: https://restful-booker.herokuapp.com

All bugs below were reproduced 3 out of 3 times. Each one has an automated test marked with `test.fail()` (except BUG-009), so it shows up in the HTML report with its bug ID.

For protected endpoints, get a token from `POST /auth` and send it as `Cookie: token=<token>`.

Base payload used in the bugs below:

```json
{
  "firstname": "John",
  "lastname": "Smith",
  "totalprice": 150,
  "depositpaid": true,
  "bookingdates": { "checkin": "2027-01-10", "checkout": "2027-01-15" },
  "additionalneeds": "Breakfast"
}
```

| ID | Title | Severity | Priority |
|---|---|---|---|
| BUG-001 | Login with wrong credentials returns 200 | Medium | Medium |
| BUG-002 | Negative total price is accepted | High | High |
| BUG-003 | Checkout before checkin is accepted | High | High |
| BUG-004 | Invalid dates saved as "0NaN-aN-aN" | High | High |
| BUG-005 | Missing or invalid fields return 500 | Medium | High |
| BUG-006 | Wrong data types are accepted and converted | Medium | Medium |
| BUG-007 | Decimal price is cut to a whole number | Medium | Medium |
| BUG-008 | PUT/PATCH/DELETE on missing booking returns 405 | Low | Low |
| BUG-009 | DELETE returns 201 Created | Low | Low |

---

### BUG-001: Login with wrong credentials returns 200

- **Endpoint:** `POST /auth`
- **Request:** `{ "username": "invalid_user", "password": "invalid_password" }`
- **Expected:** 401
- **Actual:** 200 with `{"reason":"Bad credentials"}`. Same for empty credentials.
- **Test:** `tests/auth.spec.ts` › should return 401 for invalid credentials

### BUG-002: Negative total price is accepted

- **Endpoint:** `POST /booking`, `PATCH /booking/{id}`
- **Request:** base payload with `"totalprice": -500` (POST), `{ "totalprice": -1 }` (PATCH with token)
- **Expected:** 400
- **Actual:** 200, booking saved with the negative price
- **Test:** `tests/booking-validation.spec.ts` › should reject a negative total price, PATCH should reject a negative total price

### BUG-003: Checkout before checkin is accepted

- **Endpoint:** `POST /booking`
- **Request:** base payload with `"bookingdates": { "checkin": "2027-01-15", "checkout": "2027-01-10" }`
- **Expected:** 400
- **Actual:** 200, booking saved
- **Test:** `tests/booking-validation.spec.ts` › should reject a checkout date earlier than the checkin date

### BUG-004: Invalid dates saved as "0NaN-aN-aN"

- **Endpoint:** `POST /booking`
- **Request:** base payload with `"bookingdates": { "checkin": "not-a-date", "checkout": "2027-13-45" }`
- **Expected:** 400
- **Actual:** 200, both dates saved as `"0NaN-aN-aN"` and returned that way on GET
- **Test:** `tests/booking-validation.spec.ts` › should reject booking dates that are not valid dates

### BUG-005: Missing or invalid fields return 500

- **Endpoint:** `POST /booking`
- **Request:** any of
  - base payload with one of `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates` removed
  - empty body `{}`
  - `"firstname": 12345`
- **Expected:** 400
- **Actual:** 500 `Internal Server Error`. (PUT with missing fields correctly gives 400.)
- **Test:** `tests/booking-validation.spec.ts` › should return 400 when ... is missing / for an empty request body / when firstname is a number

### BUG-006: Wrong data types are accepted and converted

- **Endpoint:** `POST /booking`
- **Request:** base payload with `"totalprice": "abc"`, and separately with `"depositpaid": "yes"`
- **Expected:** 400
- **Actual:** 200. `"abc"` is saved as `null`, `"yes"` is saved as `true`.
- **Test:** `tests/booking-validation.spec.ts` › should reject a non-numeric total price, should reject a non-boolean depositpaid value

### BUG-007: Decimal price is cut to a whole number

- **Endpoint:** `POST /booking`
- **Request:** base payload with `"totalprice": 99.99`
- **Expected:** saved as 99.99 (or 400 if decimals aren't allowed)
- **Actual:** 200, saved as `99`
- **Test:** `tests/booking-validation.spec.ts` › should keep the decimal part of the total price

### BUG-008: PUT/PATCH/DELETE on missing booking returns 405

- **Endpoint:** `PUT`, `PATCH`, `DELETE /booking/{id}`
- **Precondition:** a booking ID that was created and then deleted, and a valid token
- **Expected:** 404 (GET on the same ID gives 404)
- **Actual:** 405 Method Not Allowed
- **Test:** `tests/booking-validation.spec.ts` › PUT / PATCH / DELETE should return 404 for a booking that does not exist

### BUG-009: DELETE returns 201 Created

- **Endpoint:** `DELETE /booking/{id}`
- **Steps:** create a booking, delete it with a valid token
- **Expected:** 200 or 204
- **Actual:** 201 `Created`. The booking is deleted though. `GET /ping` also returns 201.
- **Test:** `tests/booking-crud.spec.ts` › should delete an existing booking and return 404 afterwards (this test asserts 201 instead of using `test.fail()`, since it also checks the delete really worked)

---

### Not logged as bugs

The API has no documented validation rules, so these are noted only:

- Missing or invalid token gives 403, not 401. The request is still blocked.
- Past dates and an empty firstname are accepted.
- `"totalprice": "200"` is accepted and saved as 200.
