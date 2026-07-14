# FixItNow — Step by Step Postman Test

Base URL: `http://localhost:5000/api`

---

## Before You Start

1. Open Terminal 1 and run:
```bash
npm run dev
```

2. Open Terminal 2 and run:
```bash
npm run stripe:webhook
```
Keep Terminal 2 open.

3. In Postman, for every JSON request set header:
```
Content-Type: application/json
```

---

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@fixitnow.com | customer123 |
| Technician | technician@fixitnow.com | tech123 |
| Admin | admin@fixitnow.com | Admin@1234 |

---

## STEP 1 — Login as Customer

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "customer@fixitnow.com",
  "password": "customer123"
}
```

**What to do:**
- Copy `data.accessToken`
- In Postman Authorization → Type: Bearer Token → paste token

---

## STEP 2 — Get Services

**Method:** GET  
**URL:** `http://localhost:5000/api/services`  
**Auth:** not required

**What to do:**
- Copy one technician id → save as `technicianId`
- Copy one service id → save as `serviceId`

Example path in response:
- `data[0].technician.id`
- `data[0].id`

---

## STEP 3 — Create Booking

**Method:** POST  
**URL:** `http://localhost:5000/api/bookings`  
**Auth:** Customer Bearer Token

**Body:**
```json
{
  "technicianId": "PASTE_TECHNICIAN_ID_HERE",
  "serviceId": "PASTE_SERVICE_ID_HERE",
  "scheduledTime": "2026-08-15T10:00:00.000Z"
}
```

**What to do:**
- Copy `data.id` → save as `bookingId`
- Check status is `REQUESTED`

---

## STEP 4 — Login as Technician

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "technician@fixitnow.com",
  "password": "tech123"
}
```

**What to do:**
- Copy new `accessToken`
- Use this as Technician Bearer Token

---

## STEP 5 — Accept Booking

**Method:** PATCH  
**URL:** `http://localhost:5000/api/technicians/bookings/PASTE_BOOKING_ID_HERE`  
**Auth:** Technician Bearer Token

**Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Check:** status becomes `ACCEPTED`

---

## STEP 6 — Login as Customer Again

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "customer@fixitnow.com",
  "password": "customer123"
}
```

Use customer token again for payment.

---

## STEP 7 — Create Payment (Stripe)

**Method:** POST  
**URL:** `http://localhost:5000/api/payments/create`  
**Auth:** Customer Bearer Token

**Body:**
```json
{
  "bookingId": "PASTE_BOOKING_ID_HERE",
  "provider": "STRIPE"
}
```

**What you get:**
- `data.gatewayUrl` — open this URL in the browser (or redirect frontend there)
- `data.sessionId`
- payment status `PENDING`

**Note:**  
Open `gatewayUrl`, pay with Stripe test card:
```
4242 4242 4242 4242
```
Any future expiry, any CVC, any ZIP.

After successful payment + webhook (`stripe listen`), booking status becomes `PAID`.

---

## STEP 8 — Optional SSLCommerz Payment

Use a different accepted booking.

**Method:** POST  
**URL:** `http://localhost:5000/api/payments/create`  
**Auth:** Customer Bearer Token

**Body:**
```json
{
  "bookingId": "PASTE_BOOKING_ID_HERE",
  "provider": "SSLCOMMERZ"
}
```

Open `data.gatewayUrl` in browser and pay with SSLCommerz sandbox.

---

## STEP 9 — Technician Marks Job In Progress

Login as technician again if needed.

**Method:** PATCH  
**URL:** `http://localhost:5000/api/technicians/bookings/PASTE_BOOKING_ID_HERE`  
**Auth:** Technician Bearer Token

**Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Check:** booking must already be `PAID`

---

## STEP 10 — Technician Completes Job

**Method:** PATCH  
**URL:** `http://localhost:5000/api/technicians/bookings/PASTE_BOOKING_ID_HERE`  
**Auth:** Technician Bearer Token

**Body:**
```json
{
  "status": "COMPLETED"
}
```

---

## STEP 11 — Customer Leaves Review

Login as customer again.

**Method:** POST  
**URL:** `http://localhost:5000/api/reviews`  
**Auth:** Customer Bearer Token

**Body:**
```json
{
  "bookingId": "PASTE_BOOKING_ID_HERE",
  "rating": 5,
  "comment": "Great service, very professional!"
}
```

---

## STEP 12 — Admin Checks

### Login Admin
**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "admin@fixitnow.com",
  "password": "Admin@1234"
}
```

### Get All Users
**GET** `http://localhost:5000/api/admin/users`  
Auth: Admin Bearer Token

### Get All Bookings
**GET** `http://localhost:5000/api/admin/bookings`  
Auth: Admin Bearer Token

### Ban User
**PATCH** `http://localhost:5000/api/admin/users/PASTE_USER_ID`

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

### Create Category
**POST** `http://localhost:5000/api/admin/categories`

```json
{
  "name": "Painting",
  "slug": "painting"
}
```

---

## Extra Useful Requests

### Get My Profile
**GET** `http://localhost:5000/api/auth/me`

### Get My Bookings (Customer)
**GET** `http://localhost:5000/api/bookings`

### Get Booking Details
**GET** `http://localhost:5000/api/bookings/PASTE_BOOKING_ID`

### Cancel Booking (before IN_PROGRESS)
**PATCH** `http://localhost:5000/api/bookings/PASTE_BOOKING_ID/cancel`

### Technician Update Profile
**PUT** `http://localhost:5000/api/technicians/profile`

```json
{
  "skills": ["Plumbing", "Electrical"],
  "experience": 5,
  "hourlyRate": 30,
  "bio": "Expert technician",
  "location": "Dhaka"
}
```

### Technician Set Availability
**PUT** `http://localhost:5000/api/technicians/availability`

```json
{
  "availability": ["Monday 9AM-5PM", "Saturday 8AM-2PM"]
}
```

### Filter Services
**GET** `http://localhost:5000/api/services?type=Plumbing&location=Dhaka&minPrice=50&maxPrice=200`

### Filter Technicians
**GET** `http://localhost:5000/api/technicians?skill=Plumbing&location=Dhaka&minExperience=1`

---

## Status Flow Reminder

```
REQUESTED
   → ACCEPTED
       → PAID
           → IN_PROGRESS
               → COMPLETED
   → DECLINED

Customer can CANCEL only before IN_PROGRESS
```

---

## Quick Checklist

- [ ] Step 1 Customer login
- [ ] Step 2 Get services / copy ids
- [ ] Step 3 Create booking
- [ ] Step 4 Technician login
- [ ] Step 5 Accept booking
- [ ] Step 6 Customer login again
- [ ] Step 7 Create Stripe payment
- [ ] Step 9 In progress
- [ ] Step 10 Completed
- [ ] Step 11 Review
- [ ] Step 12 Admin check
