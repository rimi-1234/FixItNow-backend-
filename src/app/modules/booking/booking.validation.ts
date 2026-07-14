import { z } from 'zod';
import { uuidParamSchema } from '../../shared/validation.js';

const createBookingValidationSchema = z.object({
  body: z.object({
    technicianId: z.string({ message: "Technician ID is required" }).uuid({ message: "Invalid technician ID" }),
    serviceId: z.string({ message: "Service ID is required" }).uuid({ message: "Invalid service ID" }),
    scheduledTime: z.string({ message: "Scheduled time is required" }).datetime({ message: "Invalid datetime format, must be ISO 8601" })
  }),
});

const bookingIdParamValidationSchema = uuidParamSchema;

export const BookingValidation = {
  createBookingValidationSchema,
  bookingIdParamValidationSchema,
};
