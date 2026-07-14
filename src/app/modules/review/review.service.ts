import prisma from '../../../lib/prisma.js';
import { IReviewCreatePayload } from './review.interface.js';

const httpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const createReview = async (customerId: string, payload: IReviewCreatePayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (!booking) throw httpError('Booking not found', 404);

  if (booking.customerId !== customerId) {
    throw httpError('You can only review your own bookings', 403);
  }

  if (booking.status !== 'COMPLETED') {
    throw httpError('You can only review completed jobs', 400);
  }

  if (booking.review) {
    throw httpError('This booking has already been reviewed', 400);
  }

  const review = await prisma.review.create({
    data: {
      bookingId: payload.bookingId,
      customerId,
      technicianId: booking.technicianId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return review;
};

export const ReviewServices = {
  createReview,
};
