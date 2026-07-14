import { PaymentProvider } from '@prisma/client';

export interface IPaymentCreatePayload {
  bookingId: string;
  provider?: PaymentProvider;
}
