# EventX REST API

The backend runs at `http://localhost:4000`; all API endpoints are prefixed with
`/api`. Interactive OpenAPI documentation is available at `/api/docs`.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and set a MySQL URL, distinct
   JWT secrets, Razorpay API credentials, and the Razorpay webhook secret.
2. From `backend/`, run `npm install`, `npm run db:generate`, and
   `npm run db:migrate`.
3. Start the API with `npm run dev`. `GET /api/health` checks database
   connectivity.
4. To provision the first administrator, provide `BOOTSTRAP_ADMIN_EMAIL` and
   `BOOTSTRAP_ADMIN_PASSWORD` in a trusted environment and run `npm run db:seed`
   once; remove those bootstrap values afterwards.

Never use example secrets in a deployed environment. The Razorpay webhook
endpoint must be configured at the provider to send `payment_link.paid`,
`payment_link.expired`, and `payment_link.cancelled` events to
`POST /api/payments/webhook`.

## Response format

Success responses use `{ "success": true, "data": ..., "meta": ... }`.
Paginated list responses put `page`, `limit`, `total`, and `pages` in `meta`.
Errors use `{ "success": false, "error": { "code": "...", "message": "..." } }`.
Validation errors may include a `details` object. All request bodies are
validated with Zod; unknown body fields are rejected on write endpoints.

## Authentication

Register or sign in to receive short-lived access and rotating refresh tokens.
Send the access token as `Authorization: Bearer <accessToken>`. Refresh tokens
are persisted only as SHA-256 hashes and rotated once per refresh. Registering
as an organizer creates an unapproved organizer account; an admin must approve
it before event creation or image uploads are allowed. Admin accounts must be
provisioned through the one-time trusted seed workflow, not public registration.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create customer or organizer (`name`, `email`, `password`, optional E.164 `phone` and `accountType`) |
| POST | `/api/auth/login` | Public | Sign in (`email`, `password`) |
| POST | `/api/auth/refresh` | Public | Rotate a refresh token |
| POST | `/api/auth/logout` | Public | Revoke a refresh token |
| GET | `/api/auth/me` | Authenticated | Read current account |
| PATCH | `/api/auth/me` | Authenticated | Update name and/or E.164 phone number |

## Events

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/events` | Public | Search published events; accepts `page`, `limit` (max 50), `search`, `city`, `category`, `dateFrom`, `dateTo`, `featured` |
| GET | `/api/events/:id` | Public | Published event details |
| POST | `/api/events` | Approved organizer | Create a draft event with ticket types |
| GET | `/api/events/organizer/mine` | Organizer | List own events |
| PATCH | `/api/events/:id` | Approved organizer | Edit own draft |
| POST | `/api/organizer/events/images` | Approved organizer | Upload JPEG, PNG or WebP (max 5 MB by default), multipart field `image` |

New events remain drafts until admin review. Event prices and available ticket
inventory are derived from database ticket types; clients cannot set either.

## Bookings and tickets

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/bookings` | Customer | Reserve tickets; requires a unique `Idempotency-Key` header and `{ "eventId": "...", "items": [{ "ticketTypeId": "...", "quantity": 1 }] }` |
| GET | `/api/bookings/mine` | Customer | List own bookings |
| POST | `/api/bookings/:id/cancel` | Customer | Cancel own pending booking and release inventory |
| GET | `/api/organizer/events/:eventId/attendees` | Organizer | List confirmed attendees for own event |
| POST | `/api/organizer/events/:eventId/check-in` | Organizer | Validate one ticket using `{ "qrToken": "..." }` |

Bookings reserve inventory in a serializable Prisma transaction and expire
after 15 minutes. A background job releases expired reservations. Ticket
check-in is an atomic conditional update; already checked-in tickets return
`409 TICKET_ALREADY_CHECKED_IN`.
Once a payment link is issued, cancellation is blocked until the link's
15-minute expiry to avoid racing a payment capture.

## Payments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/payments/links` | Booking owner | Create/reuse an expiring Razorpay Payment Link for `{ "bookingId": "..." }` |
| POST | `/api/payments/webhook` | Razorpay signature | Verify raw-body HMAC and settle a matching booking |

Payment totals are calculated from stored booking items. Set an E.164 phone
number on the user profile before creating a link. The provider link expires
with the 15-minute reservation. The webhook validates the signature, payment
link reference, provider payment ID, currency, and amount in paise. Webhook
event IDs and provider payment IDs are unique; payment settlement and ticket
issuance share a database transaction. Never mark a booking paid from a browser
callback.

## Admin

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | Admin | Platform metrics |
| GET | `/api/admin/transactions` | Admin | Paginated payment monitoring; optional `status` |
| GET | `/api/admin/events/pending` | Admin | List draft events for review |
| PATCH | `/api/admin/events/:id/review` | Admin | Publish or reject (`{ "publish": true }`) |
| GET | `/api/admin/organizers` | Admin | List organizer accounts |
| PATCH | `/api/admin/organizers/:id/approval` | Admin | Approve/revoke (`{ "approved": true }`) |