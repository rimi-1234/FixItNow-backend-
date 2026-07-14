import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    bookingId: z.string({ message: "Booking ID is required" }).uuid({ message: "Invalid booking ID" }),
    rating: z.number({ message: "Rating is required" }).min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
    comment: z.string().optional()
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema
};
