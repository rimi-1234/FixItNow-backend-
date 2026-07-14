import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { PaymentServices } from './payment.service.js';
import config from '../../../config/index.js';

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const { bookingId, provider } = req.body as { bookingId: string; provider?: 'STRIPE' | 'SSLCOMMERZ' };

  const result = await PaymentServices.createPaymentIntent(customerId, bookingId, provider);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment session created. Redirect the user to gatewayUrl to complete payment.',
    data: result,
  });
});

// Stripe webhook — receives raw body
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    throw Object.assign(new Error('Missing or invalid stripe-signature header'), { statusCode: 400 });
  }

  const result = await PaymentServices.confirmPayment(req.body as Buffer, sig);
  res.status(200).json(result);
});

// SSLCommerz redirects the customer's browser here (POST) after a successful payment
const sslcommerzSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tran_id, val_id } = req.body as { tran_id?: string; val_id?: string };
  if (!tran_id || !val_id) {
    throw Object.assign(new Error('Missing tran_id or val_id from SSLCommerz'), { statusCode: 400 });
  }

  const payment = await PaymentServices.validateSslCommerzTransaction(tran_id, val_id);

  if (config.app_url) {
    return res.redirect(`${config.app_url}/payment/success?bookingId=${payment.bookingId}`);
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment completed successfully',
    data: payment,
  });
});

// SSLCommerz redirects here (POST) when the payment fails
const sslcommerzFail = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.body as { tran_id?: string };
  if (tran_id) await PaymentServices.markSslCommerzTransactionFailed(tran_id);

  if (config.app_url) {
    return res.redirect(`${config.app_url}/payment/fail`);
  }
  sendResponse(res, { statusCode: 200, success: false, message: 'Payment failed', data: null });
});

// SSLCommerz redirects here (POST) when the customer cancels the payment
const sslcommerzCancel = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.body as { tran_id?: string };
  if (tran_id) await PaymentServices.markSslCommerzTransactionFailed(tran_id);

  if (config.app_url) {
    return res.redirect(`${config.app_url}/payment/cancel`);
  }
  sendResponse(res, { statusCode: 200, success: false, message: 'Payment cancelled', data: null });
});

// SSLCommerz server-to-server Instant Payment Notification — the source of truth
const sslcommerzIPN = catchAsync(async (req: Request, res: Response) => {
  const { tran_id, val_id, status } = req.body as { tran_id?: string; val_id?: string; status?: string };
  if (!tran_id || !val_id) {
    return res.status(200).json({ received: true, message: 'Missing tran_id or val_id' });
  }

  if (status === 'VALID' || status === 'VALIDATED') {
    await PaymentServices.validateSslCommerzTransaction(tran_id, val_id);
  } else {
    await PaymentServices.markSslCommerzTransactionFailed(tran_id);
  }

  res.status(200).json({ received: true });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getUserPayments(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getPaymentDetails(req.params.id as string, req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

export const PaymentControllers = {
  createPayment,
  confirmPayment,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIPN,
  getUserPayments,
  getPaymentDetails,
};
