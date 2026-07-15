import { z } from 'zod';
import { PaymentProvider } from '@prisma/client';

const createPaymentValidationSchema = z.object({
  body: z.object({
    bookingId: z.string({ message: 'bookingId is required' }).uuid({ message: 'Invalid bookingId' }),
    provider: z
      .enum([PaymentProvider.STRIPE, PaymentProvider.SSLCOMMERZ], {
        message: `provider must be one of: ${Object.values(PaymentProvider).join(', ')}`,
      })
      .optional(),
  }),
});

const syncSessionValidationSchema = z.object({
  body: z.object({
    sessionId: z
      .string({ message: 'sessionId is required' })
      .min(1, { message: 'sessionId is required' }),
  }),
});

const paymentIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid payment id' }),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  syncSessionValidationSchema,
  paymentIdParamValidationSchema,
};
