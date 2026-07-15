import express from 'express';
import { PaymentControllers } from './payment.controller.js';
import { auth } from '../../../middlewares/auth.js';
import { Role } from '@prisma/client';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { PaymentValidation } from './payment.validation.js';

const router = express.Router();

router.post(
  '/create',
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentControllers.createPayment
);

router.post(
  '/sync-session',
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.syncSessionValidationSchema),
  PaymentControllers.syncCheckoutSession
);

router.post('/confirm', PaymentControllers.confirmPayment);

router.post('/sslcommerz/success', PaymentControllers.sslcommerzSuccess);
router.post('/sslcommerz/fail', PaymentControllers.sslcommerzFail);
router.post('/sslcommerz/cancel', PaymentControllers.sslcommerzCancel);
router.post('/sslcommerz/ipn', PaymentControllers.sslcommerzIPN);

router.get('/', auth(Role.CUSTOMER), PaymentControllers.getUserPayments);

router.get(
  '/:id',
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.paymentIdParamValidationSchema),
  PaymentControllers.getPaymentDetails
);

export const PaymentRoutes = router;
