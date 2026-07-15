import Stripe from 'stripe';
import { randomUUID } from 'node:crypto';
import SSLCommerzPayment from 'sslcommerz-lts';
import prisma from '../../../lib/prisma.js';
import config from '../../../config/index.js';
import { PaymentProvider } from '@prisma/client';

const stripe = new Stripe(config.stripe_secret_key as string);

const getSslCommerzClient = () =>
  new SSLCommerzPayment(
    config.sslcommerz_store_id,
    config.sslcommerz_store_passwd,
    config.sslcommerz_is_live
  );

const createStripeCheckoutSession = async (
  bookingId: string,
  amount: number,
  serviceName: string,
  customerEmail: string
) => {
  const frontendUrl = config.frontend_url || 'http://localhost:5000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: serviceName || 'FixItNow Service Booking',
            description: `Booking ID: ${bookingId}`,
          },
        },
      },
    ],
    success_url: `${frontendUrl}/payment/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/payment/cancel?bookingId=${bookingId}`,
    metadata: { bookingId },
    client_reference_id: bookingId,
    payment_intent_data: {
      metadata: { bookingId },
    },
  });

  if (!session.url) {
    throw Object.assign(new Error('Failed to create Stripe Checkout URL'), { statusCode: 502 });
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      transactionId: session.id,
      amount,
      method: 'card',
      provider: 'STRIPE',
      status: 'PENDING',
    },
  });

  return {
    provider: 'STRIPE' as const,
    gatewayUrl: session.url,
    sessionId: session.id,
    payment,
  };
};

const createSslCommerzSession = async (
  bookingId: string,
  amount: number,
  customerEmail: string
) => {
  const tranId = `FIXITNOW_${randomUUID()}`;
  const baseUrl = config.app_url || 'http://localhost:5000';

  const sslcz = getSslCommerzClient();
  const apiResponse = await sslcz.init({
    total_amount: amount,
    currency: 'BDT',
    tran_id: tranId,
    success_url: `${baseUrl}/api/payments/sslcommerz/success`,
    fail_url: `${baseUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${baseUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${baseUrl}/api/payments/sslcommerz/ipn`,
    shipping_method: 'NO',
    product_name: 'FixItNow Service Booking',
    product_category: 'Service',
    product_profile: 'general',
    cus_name: customerEmail,
    cus_email: customerEmail,
    cus_add1: 'N/A',
    cus_city: 'N/A',
    cus_postcode: '0000',
    cus_country: 'Bangladesh',
    cus_phone: '00000000000',
  });

  if (apiResponse.status !== 'SUCCESS' || !apiResponse.GatewayPageURL) {
    throw Object.assign(
      new Error(apiResponse.failedreason || 'Failed to initiate SSLCommerz session'),
      { statusCode: 502 }
    );
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      transactionId: tranId,
      amount,
      method: 'sslcommerz',
      provider: 'SSLCOMMERZ',
      status: 'PENDING',
    },
  });

  return {
    provider: 'SSLCOMMERZ' as const,
    gatewayUrl: apiResponse.GatewayPageURL,
    payment,
  };
};

const createPaymentIntent = async (
  customerId: string,
  bookingId: string,
  provider: PaymentProvider = 'STRIPE'
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true, customer: true },
  });

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.customerId !== customerId)
    throw Object.assign(new Error('Access denied: Not your booking'), { statusCode: 403 });
  if (booking.status !== 'ACCEPTED')
    throw Object.assign(new Error('Booking must be ACCEPTED before payment'), { statusCode: 400 });

  // Resume an unfinished Stripe checkout instead of blocking the customer.
  if (booking.payment) {
    if (booking.payment.status === 'COMPLETED') {
      throw Object.assign(new Error('Payment already completed for this booking'), { statusCode: 400 });
    }

    if (
      booking.payment.provider === 'STRIPE' &&
      booking.payment.status === 'PENDING' &&
      booking.payment.transactionId
    ) {
      const session = await stripe.checkout.sessions.retrieve(booking.payment.transactionId);
      if (session.url && session.status === 'open') {
        return {
          provider: 'STRIPE' as const,
          gatewayUrl: session.url,
          sessionId: session.id,
          payment: booking.payment,
        };
      }
      // Session expired or unusable — drop it so a fresh checkout can be created.
      await prisma.payment.delete({ where: { id: booking.payment.id } });
    } else if (booking.payment.status === 'PENDING') {
      throw Object.assign(
        new Error('A payment session is already pending for this booking'),
        { statusCode: 400 }
      );
    } else {
      throw Object.assign(new Error('Payment already exists for this booking'), { statusCode: 400 });
    }
  }

  if (provider === 'SSLCOMMERZ') {
    return createSslCommerzSession(booking.id, booking.service.price, booking.customer.email);
  }

  return createStripeCheckoutSession(
    booking.id,
    booking.service.price,
    booking.service.name,
    booking.customer.email
  );
};

const markBookingPaid = async (bookingId: string, transactionId?: string) => {
  let payment = bookingId
    ? await prisma.payment.findUnique({ where: { bookingId } })
    : null;

  if (!payment && transactionId) {
    payment = await prisma.payment.findFirst({ where: { transactionId } });
  }

  if (!payment) return null;
  if (payment.status === 'COMPLETED') return payment;

  const [updated] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        ...(transactionId ? { transactionId } : {}),
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    }),
  ]);

  return updated;
};

/** Verify a Checkout Session with Stripe and mark the booking PAID if paid. */
const syncCheckoutSessionPaid = async (sessionId: string, customerId?: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return {
      synced: false,
      paymentStatus: session.payment_status,
      bookingId: session.metadata?.bookingId || session.client_reference_id || null,
    };
  }

  const bookingId = session.metadata?.bookingId || session.client_reference_id || '';

  if (customerId && bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customerId: true },
    });
    if (!booking || booking.customerId !== customerId) {
      throw Object.assign(new Error('Access denied: Not your booking'), { statusCode: 403 });
    }
  }

  const payment = await markBookingPaid(bookingId, session.id);

  return {
    synced: !!payment,
    paymentStatus: session.payment_status,
    bookingId: payment?.bookingId || bookingId || null,
    payment,
  };
};

const confirmPayment = async (rawBody: Buffer | string, sig: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      config.stripe_webhook_secret
    );
  } catch (err: any) {
    throw Object.assign(new Error(`Webhook signature verification failed: ${err.message}`), {
      statusCode: 400,
    });
  }

  // Stripe Checkout (redirect URL flow)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId || session.client_reference_id || '';
    await markBookingPaid(bookingId, session.id);
  }

  // Fallback for PaymentIntent-based flows (also fired by Checkout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata?.bookingId;
    if (bookingId) await markBookingPaid(bookingId);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata?.bookingId;

    if (bookingId) {
      await prisma.payment.update({
        where: { bookingId },
        data: { status: 'FAILED' },
      });
    }
  }

  return { received: true };
};

// Shared by the SSLCommerz `success` redirect and `ipn` server-to-server callback.
const validateSslCommerzTransaction = async (tranId: string, valId: string) => {
  const payment = await prisma.payment.findFirst({ where: { transactionId: tranId } });
  if (!payment) throw Object.assign(new Error('Payment record not found for this transaction'), { statusCode: 404 });

  const sslcz = getSslCommerzClient();
  const validation = await sslcz.validate({ val_id: valId });

  if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    throw Object.assign(new Error('SSLCommerz payment validation failed'), { statusCode: 400 });
  }

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    }),
  ]);

  return updatedPayment;
};

const markSslCommerzTransactionFailed = async (tranId: string) => {
  const payment = await prisma.payment.findFirst({ where: { transactionId: tranId } });
  if (!payment) return null;

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' },
  });
};

const getUserPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: {
      booking: { customerId },
    },
    include: {
      booking: {
        include: {
          service: true,
          technician: { select: { id: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getPaymentDetails = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          technician: { select: { id: true, email: true } },
          customer: { select: { id: true, email: true } },
        },
      },
    },
  });

  if (!payment) throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
  if (payment.booking.customerId !== customerId)
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });

  return payment;
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
  syncCheckoutSessionPaid,
  validateSslCommerzTransaction,
  markSslCommerzTransactionFailed,
  getUserPayments,
  getPaymentDetails,
};
