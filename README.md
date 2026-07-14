# FixItNow API

Home-services marketplace backend (Node.js + Express + TypeScript + Prisma + PostgreSQL).

Three roles: **CUSTOMER**, **TECHNICIAN**, **ADMIN**.

## Mandatory submission info

| Item | Value |
|------|--------|
| Backend Repo | https://github.com/rimi-1234/FixItNow |
| Live API | https://fix-it-now-two.vercel.app |
| API Docs (Swagger) | https://fix-it-now-two.vercel.app/api-docs |
| Postman Collection | [`FixItNow.postman_collection.json`](./FixItNow.postman_collection.json) |
| Demo Video | _(add Loom / Drive link)_ |
| Admin Email | `admin@fixitnow.com` |
| Admin Password | `Admin@1234` |

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fixitnow.com` | `Admin@1234` |
| Technician | `technician@fixitnow.com` | `tech123` |
| Customer | `customer@fixitnow.com` | `customer123` |

## Quick start

```bash
npm install
cp .env.example .env   # fill in secrets
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- API: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- Swagger: `http://localhost:5000/api-docs`

### Stripe webhooks (local)

```bash
npm run stripe:webhook
```

Copy the printed `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API.

## Response format

Success:

```json
{ "success": true, "message": "...", "data": {} }
```

Error:

```json
{ "success": false, "message": "...", "errorDetails": {} }
```

## Main modules

| Module | Base path |
|--------|-----------|
| Auth | `/api/auth` |
| Services | `/api/services` (public list) |
| Technicians | `/api/technicians` |
| Categories | `/api/categories` |
| Bookings | `/api/bookings` |
| Payments | `/api/payments` (Stripe + SSLCommerz) |
| Reviews | `/api/reviews` |
| Admin | `/api/admin` |

## Payment

- **Stripe Checkout** — `POST /api/payments/create` with `{ "bookingId", "provider": "STRIPE" }` returns `gatewayUrl`
- **SSLCommerz** — same endpoint with `"provider": "SSLCOMMERZ"`
- Webhook: `POST /api/payments/confirm`
- Status tracked on `Payment` (`PENDING` / `COMPLETED` / `FAILED`) and booking (`PAID`)

Test card: `4242 4242 4242 4242`

## Docs for testing

- [POSTMAN_TESTING.md](./POSTMAN_TESTING.md)
- [POSTMAN_STEP_BY_STEP.md](./POSTMAN_STEP_BY_STEP.md)
