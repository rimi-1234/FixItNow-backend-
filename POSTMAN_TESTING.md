# FixItNow — Postman Testing Guide

Base URL: `http://localhost:5000/api`  
Swagger UI: `http://localhost:5000/api-docs`

Before testing:
1. Run `npm run dev`
2. For Stripe webhooks, keep `npm run stripe:webhook` running in another terminal

---

## 1. Seed Accounts (ready to use)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fixitnow.com` | `Admin@1234` |
| Technician | `technician@fixitnow.com` | `tech123` |
| Customer | `customer@fixitnow.com` | `customer123` |

---

## 2. Postman Setup

1. Create a collection variable: `baseUrl` = `http://localhost:5000/api`
2. Create collection variables: `adminToken`, `techToken`, `customerToken`
3. After each login, copy `data.accessToken` into the matching token variable
4. For protected routes, set Authorization type to **Bearer Token** and use the token

Header for JSON bodies:
```
Content-Type: application/json
```

---

## 3. Auth

### Register Customer
`POST {{baseUrl}}/auth/register`

```json
{
  "email": "newcustomer@example.com",
  "password": "pass1234",
  "role": "CUSTOMER"
}
```

### Register Technician
`POST {{baseUrl}}/auth/register`

```json
{
  "email": "newtech@example.com",
  "password": "pass1234",
  "role": "TECHNICIAN",
  "skills": ["Plumbing", "Electrical"],
  "experience": 3,
  "hourlyRate": 30,
  "bio": "Experienced home technician",
  "location": "Dhaka"
}
```

### Login (Admin)
`POST {{baseUrl}}/auth/login`

```json
{
  "email": "admin@fixitnow.com",
  "password": "Admin@1234"
}
```

### Login (Technician)
`POST {{baseUrl}}/auth/login`

```json
{
  "email": "technician@fixitnow.com",
  "password": "tech123"
}
```

### Login (Customer)
`POST {{baseUrl}}/auth/login`

```json
{
  "email": "customer@fixitnow.com",
  "password": "customer123"
}
```

Save the returned `accessToken`.

### Get Me
`GET {{baseUrl}}/auth/me`  
Auth: Bearer token (any role)

---

## 4. Public Browse

### Get Categories
`GET {{baseUrl}}/categories`

### Get Services (with filters)
`GET {{baseUrl}}/services?type=Plumbing&location=Dhaka&minPrice=50&maxPrice=200&minRating=0&search=Pipe`

### Get Technicians (with filters)
`GET {{baseUrl}}/technicians?skill=Plumbing&location=Dhaka&minExperience=1&minRating=0&search=technician`

### Get Technician Profile
`GET {{baseUrl}}/technicians/{{technicianId}}`

Copy a technician `id` and a service `id` from these responses for booking.

---

## 5. Technician Management

Auth: Bearer `techToken`

### Update Profile
`PUT {{baseUrl}}/technicians/profile`

```json
{
  "skills": ["Plumbing", "Electrical", "AC Repair"],
  "experience": 5,
  "hourlyRate": 28,
  "bio": "Expert home service technician",
  "location": "Dhaka"
}
```

### Update Availability
`PUT {{baseUrl}}/technicians/availability`

```json
{
  "availability": [
    "Monday 9AM-5PM",
    "Wednesday 10AM-4PM",
    "Saturday 8AM-2PM"
  ]
}
```

### Create Service
`POST {{baseUrl}}/services`

First get a category id from `GET /categories`, then:

```json
{
  "name": "Drain Cleaning",
  "description": "Professional drain unclogging service",
  "price": 80,
  "categoryId": "{{categoryId}}"
}
```

### Update Service
`PATCH {{baseUrl}}/services/{{serviceId}}`

```json
{
  "price": 90,
  "description": "Updated drain cleaning service"
}
```

### Get My Bookings
`GET {{baseUrl}}/technicians/bookings`

### Accept Booking
`PATCH {{baseUrl}}/technicians/bookings/{{bookingId}}`

```json
{
  "status": "ACCEPTED"
}
```

### Decline Booking
```json
{
  "status": "DECLINED"
}
```

### Mark In Progress (only after PAID)
```json
{
  "status": "IN_PROGRESS"
}
```

### Mark Completed (only after IN_PROGRESS)
```json
{
  "status": "COMPLETED"
}
```

---

## 6. Customer Bookings

Auth: Bearer `customerToken`

### Create Booking
`POST {{baseUrl}}/bookings`

```json
{
  "technicianId": "{{technicianId}}",
  "serviceId": "{{serviceId}}",
  "scheduledTime": "2026-08-15T10:00:00.000Z"
}
```

### Get My Bookings
`GET {{baseUrl}}/bookings`

### Get Booking Details
`GET {{baseUrl}}/bookings/{{bookingId}}`

### Cancel Booking (before IN_PROGRESS)
`PATCH {{baseUrl}}/bookings/{{bookingId}}/cancel`  
No body needed.

---

## 7. Payments

Auth: Bearer `customerToken`  
Booking must be `ACCEPTED` first.

### Create Stripe Payment
`POST {{baseUrl}}/payments/create`

```json
{
  "bookingId": "{{bookingId}}",
  "provider": "STRIPE"
}
```

Response includes `gatewayUrl` — open it in a browser (or redirect frontend there).  
Pay with test card `4242 4242 4242 4242`.  

After success, Stripe redirects to `/payment/success?session_id=...` and the API **automatically** verifies the session and sets payment `COMPLETED` + booking `PAID` (no manual sync needed).  
Optional: keep `npm run stripe:webhook` running so webhooks also update the DB in the background.

### Create SSLCommerz Payment
`POST {{baseUrl}}/payments/create`

```json
{
  "bookingId": "{{bookingId}}",
  "provider": "SSLCOMMERZ"
}
```

Response includes `gatewayUrl` — open it in a browser to pay (sandbox).

### Payment History
`GET {{baseUrl}}/payments`

### Payment Details
`GET {{baseUrl}}/payments/{{paymentId}}`

---

## 8. Reviews

Auth: Bearer `customerToken`  
Booking must be `COMPLETED`.

### Create Review
`POST {{baseUrl}}/reviews`

```json
{
  "bookingId": "{{bookingId}}",
  "rating": 5,
  "comment": "Great service, very professional!"
}
```

---

## 9. Admin

Auth: Bearer `adminToken`

### Get All Users
`GET {{baseUrl}}/admin/users`  
Optional filters: `?role=TECHNICIAN&status=ACTIVE&search=technician`

### Ban User
`PATCH {{baseUrl}}/admin/users/{{userId}}`

```json
{
  "status": "BANNED"
}
```

### Unban User
```json
{
  "status": "ACTIVE"
}
```

### Get All Bookings
`GET {{baseUrl}}/admin/bookings`  
Optional: `?status=REQUESTED`  
Statuses: `REQUESTED`, `ACCEPTED`, `DECLINED`, `PAID`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Get Categories
`GET {{baseUrl}}/admin/categories`

### Create Category
`POST {{baseUrl}}/admin/categories`

```json
{
  "name": "Painting",
  "slug": "painting"
}
```

### Update Category
`PATCH {{baseUrl}}/admin/categories/{{categoryId}}`

```json
{
  "name": "Painting & Decorating",
  "slug": "painting-decorating"
}
```

### Delete Category
`DELETE {{baseUrl}}/admin/categories/{{categoryId}}`  
Fails if the category still has services.

---

## 10. Full Happy-Path Order (copy this flow)

1. Login as **Customer** → save `customerToken`
2. `GET /services` → copy `technicianId` + `serviceId`
3. `POST /bookings` → copy `bookingId` (status = `REQUESTED`)
4. Login as **Technician** → save `techToken`
5. `PATCH /technicians/bookings/{{bookingId}}` with `"status": "ACCEPTED"`
6. Login as **Customer** again
7. `POST /payments/create` with Stripe or SSLCommerz
8. Complete payment (Stripe webhook / SSLCommerz gateway)
9. Login as **Technician**
10. `PATCH` booking → `IN_PROGRESS`
11. `PATCH` booking → `COMPLETED`
12. Login as **Customer**
13. `POST /reviews`

---

## 11. Booking Status Cheat Sheet

```
REQUESTED
   ├─ ACCEPTED  →  PAID  →  IN_PROGRESS  →  COMPLETED
   └─ DECLINED

Customer can CANCEL while status is REQUESTED, ACCEPTED, or PAID
(not after IN_PROGRESS)
```
