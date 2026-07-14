export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FixItNow API',
    version: '1.0.0',
    description: `
## FixItNow — Home Services Marketplace API

A RESTful backend API where **Customers** browse & book home services, **Technicians** manage jobs, and **Admins** oversee the platform.

### Authentication
All protected routes require a Bearer JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Admin Credentials (pre-seeded)
- **Email:** admin@fixitnow.com
- **Password:** Admin@1234

### Demo Credentials
- **Technician:** technician@fixitnow.com / tech123
- **Customer:** customer@fixitnow.com / customer123
    `,
    contact: { name: 'FixItNow Support', email: 'admin@fixitnow.com' },
  },
  servers: [
    { url: 'http://localhost:5000/api', description: 'Local Development' },
    { url: 'https://fix-it-now-two.vercel.app/api', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
          errorDetails: { type: 'object' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 6, example: 'pass1234' },
          role: { type: 'string', enum: ['CUSTOMER', 'TECHNICIAN'], example: 'CUSTOMER' },
          skills: { type: 'array', items: { type: 'string' }, example: ['Plumbing', 'AC Repair'], description: 'Required if role is TECHNICIAN' },
          experience: { type: 'integer', example: 3, description: 'Years of experience (TECHNICIAN only)' },
          hourlyRate: { type: 'number', example: 25.0, description: 'Hourly rate in USD (TECHNICIAN only)' },
          bio: { type: 'string', example: 'Expert plumber with 3 years experience' },
          location: { type: 'string', example: 'Dhaka', description: 'Service location/area (TECHNICIAN only)' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@fixitnow.com' },
          password: { type: 'string', example: 'Admin@1234' },
        },
      },
      BookingCreate: {
        type: 'object',
        required: ['technicianId', 'serviceId', 'scheduledTime'],
        properties: {
          technicianId: { type: 'string', format: 'uuid' },
          serviceId: { type: 'string', format: 'uuid' },
          scheduledTime: { type: 'string', format: 'date-time', example: '2026-07-15T10:00:00Z' },
        },
      },
      PaymentCreate: {
        type: 'object',
        required: ['bookingId'],
        properties: {
          bookingId: { type: 'string', format: 'uuid', description: 'Must be an ACCEPTED booking' },
          provider: {
            type: 'string',
            enum: ['STRIPE', 'SSLCOMMERZ'],
            default: 'STRIPE',
            description: 'Payment gateway to use. Defaults to STRIPE.',
          },
        },
      },
      ReviewCreate: {
        type: 'object',
        required: ['bookingId', 'rating'],
        properties: {
          bookingId: { type: 'string', format: 'uuid', description: 'Must be a COMPLETED booking' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Great service, very professional!' },
        },
      },
      BookingStatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED'],
            example: 'ACCEPTED',
          },
        },
      },
      UserStatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['ACTIVE', 'BANNED'], example: 'BANNED' },
        },
      },
      CategoryCreate: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string', example: 'Painting' },
          slug: { type: 'string', example: 'painting' },
        },
      },
      CategoryUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Painting & Decorating' },
          slug: { type: 'string', example: 'painting-decorating' },
        },
      },
      ServiceCreate: {
        type: 'object',
        required: ['name', 'description', 'price', 'categoryId'],
        properties: {
          name: { type: 'string', example: 'Wall Painting' },
          description: { type: 'string', example: 'Professional interior wall painting' },
          price: { type: 'number', example: 150.0 },
          categoryId: { type: 'string', format: 'uuid' },
        },
      },
      ServiceUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          categoryId: { type: 'string', format: 'uuid' },
        },
      },
      AvailabilityUpdate: {
        type: 'object',
        required: ['availability'],
        properties: {
          availability: {
            type: 'array',
            items: { type: 'string' },
            example: ['Monday 9AM-5PM', 'Wednesday 10AM-4PM', 'Saturday 8AM-2PM'],
          },
        },
      },
    },
  },
  paths: {
    // ─── AUTH ───────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user (Customer or Technician)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Login successful, returns accessToken + user info' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    // ─── SERVICES ────────────────────────────────────────
    '/services': {
      get: {
        tags: ['Services (Public)'],
        summary: 'Browse all services with filters (type, location, rating, price)',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by category/type name' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: "Filter by the technician's location" },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 5 }, description: "Filter by the technician's minimum average rating" },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum price' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum price' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by service name/description' },
        ],
        responses: { 200: { description: 'List of services, each including technician averageRating & reviewCount' } },
      },
      post: {
        tags: ['Services (Public)'],
        summary: 'Create a service (Technician only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceCreate' } } },
        },
        responses: {
          201: { description: 'Service created' },
          403: { description: 'Forbidden' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/services/{id}': {
      patch: {
        tags: ['Services (Public)'],
        summary: 'Update your own service (Technician only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceUpdate' } } },
        },
        responses: {
          200: { description: 'Service updated' },
          403: { description: 'Access denied: Not your service' },
          404: { description: 'Service not found' },
        },
      },
      delete: {
        tags: ['Services (Public)'],
        summary: 'Delete your own service (Technician only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service deleted' },
          403: { description: 'Access denied: Not your service' },
          404: { description: 'Service not found' },
        },
      },
    },

    // ─── TECHNICIANS ─────────────────────────────────────
    '/technicians': {
      get: {
        tags: ['Technicians (Public)'],
        summary: 'Browse all technicians with filters (skill, location, rating, experience)',
        parameters: [
          { name: 'skill', in: 'query', schema: { type: 'string' }, description: 'Filter by skill (e.g. Plumbing)' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by location/area' },
          { name: 'minExperience', in: 'query', schema: { type: 'integer' }, description: 'Min years of experience' },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 5 }, description: 'Min average review rating' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by email' },
        ],
        responses: { 200: { description: 'List of technicians with profiles, services, averageRating & reviewCount' } },
      },
    },
    '/technicians/{id}': {
      get: {
        tags: ['Technicians (Public)'],
        summary: 'Get technician profile with services and reviews',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Technician profile' },
          404: { description: 'Technician not found' },
        },
      },
    },

    // ─── CATEGORIES ──────────────────────────────────────
    '/categories': {
      get: {
        tags: ['Categories (Public)'],
        summary: 'Get all service categories',
        responses: { 200: { description: 'List of categories' } },
      },
      post: {
        tags: ['Categories (Public)'],
        summary: 'Create a new service category (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } },
        },
        responses: { 201: { description: 'Category created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/categories/{id}': {
      patch: {
        tags: ['Categories (Public)'],
        summary: 'Update a service category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } },
        },
        responses: { 200: { description: 'Category updated' }, 404: { description: 'Category not found' } },
      },
      delete: {
        tags: ['Categories (Public)'],
        summary: 'Delete a service category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category deleted' },
          400: { description: 'Cannot delete a category that still has services' },
          404: { description: 'Category not found' },
        },
      },
    },

    // ─── BOOKINGS ────────────────────────────────────────
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking (Customer only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingCreate' } } },
        },
        responses: {
          201: { description: 'Booking created with status REQUESTED' },
          400: { description: 'Validation error' },
          403: { description: 'Forbidden — Customer role required' },
        },
      },
      get: {
        tags: ['Bookings'],
        summary: "Get current customer's bookings",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'List of bookings with payment & review status' } },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get specific booking details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Booking details' },
          403: { description: 'Access denied' },
          404: { description: 'Booking not found' },
        },
      },
    },
    '/bookings/{id}/cancel': {
      patch: {
        tags: ['Bookings'],
        summary: 'Cancel a booking (Customer only)',
        description: 'Customers can cancel a booking at any point before it reaches IN_PROGRESS status (i.e. while REQUESTED, ACCEPTED, or PAID).',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Booking cancelled' },
          400: { description: 'Booking can no longer be cancelled (already IN_PROGRESS/COMPLETED)' },
          403: { description: 'Access denied' },
          404: { description: 'Booking not found' },
        },
      },
    },

    // ─── PAYMENTS ────────────────────────────────────────
    '/payments/create': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Stripe or SSLCommerz payment session for an ACCEPTED booking',
        description: 'Set `provider` to `STRIPE` (default) or `SSLCOMMERZ`. Both return a `gatewayUrl` — redirect the customer there to pay. The booking must be in ACCEPTED status.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentCreate' } } },
        },
        responses: {
          201: {
            description: 'Payment session created',
            content: {
              'application/json': {
                examples: {
                  stripe: {
                    summary: 'Stripe Checkout response',
                    value: {
                      success: true,
                      message: 'Payment session created. Redirect the user to gatewayUrl to complete payment.',
                      data: {
                        provider: 'STRIPE',
                        gatewayUrl: 'https://checkout.stripe.com/c/pay/cs_test_...',
                        sessionId: 'cs_test_...',
                        payment: { id: 'uuid', status: 'PENDING' },
                      },
                    },
                  },
                  sslcommerz: {
                    summary: 'SSLCommerz response',
                    value: {
                      success: true,
                      message: 'Payment session created. Redirect the user to gatewayUrl to complete payment.',
                      data: {
                        provider: 'SSLCOMMERZ',
                        gatewayUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&...',
                        payment: { id: 'uuid', status: 'PENDING' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Booking not ACCEPTED or already paid' },
        },
      },
    },
    '/payments/confirm': {
      post: {
        tags: ['Payments'],
        summary: 'Stripe webhook — confirms payment (called by Stripe)',
        description: 'This endpoint receives raw webhook events from Stripe. Do NOT call this manually. Stripe calls it after a successful `payment_intent.succeeded` event.',
        parameters: [{ name: 'stripe-signature', in: 'header', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: '{ received: true }' },
          400: { description: 'Invalid webhook signature' },
        },
      },
    },
    '/payments/sslcommerz/success': {
      post: {
        tags: ['Payments'],
        summary: "SSLCommerz success callback — the customer's browser is redirected here (called by SSLCommerz)",
        description: 'Do NOT call this manually. Validates the transaction via the SSLCommerz Validation API, marks the payment COMPLETED and the booking PAID, then redirects to `APP_URL/payment/success`.',
        requestBody: {
          content: { 'application/x-www-form-urlencoded': { schema: { type: 'object', properties: { tran_id: { type: 'string' }, val_id: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Payment completed' }, 302: { description: 'Redirect to frontend success page' } },
      },
    },
    '/payments/sslcommerz/fail': {
      post: {
        tags: ['Payments'],
        summary: 'SSLCommerz failure callback (called by SSLCommerz)',
        responses: { 200: { description: 'Payment marked FAILED' }, 302: { description: 'Redirect to frontend fail page' } },
      },
    },
    '/payments/sslcommerz/cancel': {
      post: {
        tags: ['Payments'],
        summary: 'SSLCommerz cancel callback — triggered when the customer cancels on the gateway (called by SSLCommerz)',
        responses: { 200: { description: 'Payment marked FAILED' }, 302: { description: 'Redirect to frontend cancel page' } },
      },
    },
    '/payments/sslcommerz/ipn': {
      post: {
        tags: ['Payments'],
        summary: 'SSLCommerz Instant Payment Notification (server-to-server, called by SSLCommerz)',
        description: 'The authoritative server-to-server callback used to finalize the payment status, independent of the browser redirect flow.',
        responses: { 200: { description: '{ received: true }' } },
      },
    },
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment history for current customer',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'List of payments with booking details' } },
      },
    },
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get specific payment details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Payment details' },
          404: { description: 'Payment not found' },
        },
      },
    },

    // ─── TECHNICIAN MANAGEMENT ───────────────────────────
    '/technicians/profile': {
      put: {
        tags: ['Technician Management'],
        summary: 'Update technician profile (Technician only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  skills: { type: 'array', items: { type: 'string' }, example: ['Plumbing', 'Electrical'] },
                  experience: { type: 'integer', example: 5 },
                  hourlyRate: { type: 'number', example: 30 },
                  bio: { type: 'string', example: 'Expert plumber with 5 years of experience' },
                  location: { type: 'string', example: 'Dhaka' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Profile updated' }, 403: { description: 'Forbidden' } },
      },
    },
    '/technicians/availability': {
      put: {
        tags: ['Technician Management'],
        summary: 'Update availability slots (Technician only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AvailabilityUpdate' } } },
        },
        responses: { 200: { description: 'Availability updated' } },
      },
    },
    '/technicians/bookings': {
      get: {
        tags: ['Technician Management'],
        summary: "Get all bookings for the logged-in technician",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'List of incoming bookings' } },
      },
    },
    '/technicians/bookings/{id}': {
      patch: {
        tags: ['Technician Management'],
        summary: 'Accept / Decline / Progress / Complete a booking (Technician only)',
        description: `Valid status transitions:
- **REQUESTED → ACCEPTED** or **REQUESTED → DECLINED**
- **PAID → IN_PROGRESS**
- **IN_PROGRESS → COMPLETED**`,
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingStatusUpdate' } } },
        },
        responses: {
          200: { description: 'Booking status updated' },
          400: { description: 'Invalid status transition' },
          403: { description: 'Not your booking' },
        },
      },
    },

    // ─── REVIEWS ─────────────────────────────────────────
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Leave a review for a COMPLETED booking (Customer only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewCreate' } } },
        },
        responses: {
          201: { description: 'Review submitted' },
          400: { description: 'Booking not completed or already reviewed' },
        },
      },
    },

    // ─── ADMIN ───────────────────────────────────────────
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all platform users, with optional filters (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['CUSTOMER', 'TECHNICIAN', 'ADMIN'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'BANNED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by email' },
        ],
        responses: { 200: { description: 'All users (customers & technicians)' } },
      },
    },
    '/admin/users/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Ban or unban a user (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserStatusUpdate' } } },
        },
        responses: { 200: { description: 'User status updated' }, 404: { description: 'User not found' } },
      },
    },
    '/admin/bookings': {
      get: {
        tags: ['Admin'],
        summary: 'Get all bookings platform-wide, with optional status filter (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['REQUESTED', 'ACCEPTED', 'DECLINED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          },
        ],
        responses: { 200: { description: 'All platform bookings' } },
      },
    },
    '/admin/categories': {
      get: {
        tags: ['Admin'],
        summary: 'Get all categories (Admin only)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All service categories' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a new service category (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } },
        },
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/admin/categories/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Update a service category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } },
        },
        responses: { 200: { description: 'Category updated' }, 404: { description: 'Category not found' } },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a service category (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category deleted' },
          400: { description: 'Cannot delete a category that still has services' },
          404: { description: 'Category not found' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Registration, Login, and Profile' },
    { name: 'Services (Public)', description: 'Browse & manage services' },
    { name: 'Technicians (Public)', description: 'Browse technicians — no auth required' },
    { name: 'Categories (Public)', description: 'Browse & manage service categories' },
    { name: 'Bookings', description: 'Customer booking management' },
    { name: 'Payments', description: 'Stripe & SSLCommerz payment integration' },
    { name: 'Technician Management', description: 'Technician profile, availability & job management' },
    { name: 'Reviews', description: 'Post-job reviews by customers' },
    { name: 'Admin', description: 'Admin-only platform management endpoints' },
  ],
};
