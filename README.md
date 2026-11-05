# Restful Booker API Automation

API tests for [Restful Booker](https://restful-booker.herokuapp.com) using Playwright and TypeScript.

Covers auth, booking CRUD, negative/boundary cases and authorization checks. Bugs found during testing are in [BUGS.md](BUGS.md).

## Tech stack

- Playwright Test (API testing via `APIRequestContext`, no browser)
- TypeScript
- dotenv for config
- GitHub Actions for CI

## Prerequisites

- Node.js 20 or later (tested on 22)
- npm

## Setup

```bash
git clone https://github.com/MangalaU/leegality-api-automation.git
cd leegality-api-automation
npm ci
```

Create a `.env` file from the example and fill in the credentials:

```bash
cp .env.example .env
```

```
BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=<username>
API_PASSWORD=<password>
```

`.env` is gitignored. In CI the credentials come from repository secrets `API_USERNAME` and `API_PASSWORD`.

## Running tests

| Command | What it runs |
|---|---|
| `npm test` | All tests |
| `npm run test:health` | `/ping` health check |
| `npm run test:auth` | Token generation, valid and invalid credentials |
| `npm run test:booking` | Booking CRUD flow |
| `npm run test:validation` | Negative and boundary tests |
| `npm run test:authorization` | PUT/PATCH/DELETE without or with an invalid token |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

Run a single test by name:

```bash
npx playwright test -g "negative total price"
```

## Report

An HTML report is created in `reports/html/` after every run. To open it:

```bash
npm run report
```

Failed tests keep a trace (`trace: 'retain-on-failure'`), which shows every request and response. Open it from the test's page in the report.

In CI the report is uploaded as the `html-report` artifact on each run.

## Project structure

```
src/
  clients/
    auth.client.ts        POST /auth
    booking.client.ts     /ping and all /booking endpoints
  config/
    api.config.ts         endpoint paths
  fixtures/
    api.fixture.ts        clients, auth token, test data fixtures
  test-data/
    booking.data.ts       Booking type and payload builders
tests/
  health.spec.ts
  auth.spec.ts
  booking-crud.spec.ts
  booking-validation.spec.ts
  booking-authorization.spec.ts
BUGS.md
playwright.config.ts
.github/workflows/playwright.yml
```

## How it's put together

**Clients.** `AuthClient` and `BookingClient` wrap the API calls, so tests don't build URLs or headers themselves. The token is optional on PUT/PATCH/DELETE so the authorization tests can call them without one.

**Fixtures** (`src/fixtures/api.fixture.ts`):

- `authToken` logs in once per test using the `.env` credentials. It fails early with a clear message if they are missing.
- `createdBooking` creates a fresh booking for the test and deletes it afterwards.
- `deletedBookingId` creates and then deletes a booking, giving an ID that is known not to exist. Used for the 404 tests, so no hardcoded IDs.
- `trackBooking` is used by negative tests. If the API wrongly accepts a bad payload, the booking still gets deleted at the end.

**Auth.** The token from `POST /auth` is sent as `Cookie: token=<token>`.

**Test data.** `createBookingData()` builds a valid booking with a timestamp in the first name, so every run creates its own data. `bookingWith()` and `bookingWithout()` make invalid variations for negative tests.

**Known bugs.** Tests for confirmed bugs check the correct behaviour and are marked `test.fail()` with a `BUG-xxx` annotation. They show as expected failures, so the suite stays green. If the API is fixed, Playwright reports them as "expected to fail but passed", and BUGS.md should be updated.

## Coverage

| Endpoint | Tests |
|---|---|
| `GET /ping` | Health check |
| `POST /auth` | Valid credentials, invalid credentials, empty credentials, status code for failed login |
| `GET /booking` | ID list contains a newly created booking |
| `GET /booking/{id}` | Existing booking, non-existent ID, non-numeric ID |
| `POST /booking` | Valid booking, zero price, optional field missing, malformed JSON, negative price, checkout before checkin, invalid dates, wrong data types, decimal price, each mandatory field missing, empty body |
| `PUT /booking/{id}` | Full update, missing fields, non-existent ID, no token, invalid token |
| `PATCH /booking/{id}` | Partial update, negative price, non-existent ID, no token, invalid token |
| `DELETE /booking/{id}` | Delete and confirm 404, non-existent ID, no token, invalid token |

41 tests in total. 18 of them are linked to bugs in BUGS.md.

## Bugs

9 bugs found, including negative prices and invalid dates being accepted, 500 errors for missing fields, and a failed login returning 200. Details and steps to reproduce are in [BUGS.md](BUGS.md).

## Known limitations

- The API is a shared public sandbox. Other people create and delete data on it, and it resets now and then, so tests only use data they create themselves.
- Tests run with one worker to avoid putting load on the sandbox. A full run takes about a minute.
- The sandbox can be slow to respond after a period of inactivity, so the first run of the day may take longer.
- There are no published validation rules for the API. Expected results in the negative tests are based on normal REST conventions, and unclear cases are listed in BUGS.md as observations rather than bugs.
- Response schemas are checked with `toEqual` against the sent payload, not with a JSON schema validator.
