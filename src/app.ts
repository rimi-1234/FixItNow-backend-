import express, { Application, Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "./app/routes/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { swaggerSpec } from "./app/docs/swagger.js";
import { PaymentServices } from "./app/modules/payment/payment.service.js";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhooks require the raw, unparsed request body to verify the
// signature — this MUST be registered before the global JSON body parser,
// otherwise the body will already be consumed/parsed as JSON by the time
// it reaches the payment route.
app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger API Docs ────────────────────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "FixItNow API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "FixItNow API is running",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      docs: "/api-docs",
    },
  });
});

// Stripe / SSLCommerz browser redirects (no frontend required for local testing)
app.get("/payment/success", async (req: Request, res: Response) => {
  const bookingIdQuery = typeof req.query.bookingId === "string" ? req.query.bookingId : "";
  const sessionId = typeof req.query.session_id === "string" ? req.query.session_id : "";

  let synced = false;
  let bookingId = bookingIdQuery;

  // Auto-mark PAID by verifying the Checkout Session with Stripe
  // (works even if the webhook was missed locally).
  if (sessionId) {
    try {
      const result = await PaymentServices.syncCheckoutSessionPaid(sessionId);
      synced = result.synced;
      if (result.bookingId) bookingId = result.bookingId;
    } catch (err) {
      console.error("Failed to sync Stripe Checkout session:", err);
    }
  }

  res.status(200).send(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem">
    <h1>${synced ? "Payment successful" : "Payment received"}</h1>
    <p>Booking ID: ${bookingId || "n/a"}</p>
    <p>Database status: ${synced ? "PAID / COMPLETED" : "pending webhook sync"}</p>
    <p>You can close this tab.</p>
  </body></html>`);
});

app.get("/payment/cancel", (req: Request, res: Response) => {
  const bookingId = typeof req.query.bookingId === "string" ? req.query.bookingId : "";
  res.status(200).send(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem">
    <h1>Payment cancelled</h1>
    <p>Booking ID: ${bookingId || "n/a"}</p>
    <p>You can close this tab and try again.</p>
  </body></html>`);
});

app.get("/payment/fail", (_req: Request, res: Response) => {
  res.status(200).send(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem">
    <h1>Payment failed</h1>
    <p>You can close this tab and try again.</p>
  </body></html>`);
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
