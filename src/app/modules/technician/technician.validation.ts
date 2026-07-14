import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const updateTechnicianProfileValidationSchema = z.object({
  body: z.object({
    skills: z.array(z.string()).optional(),
    experience: z.number().int().nonnegative().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
  }),
});

const updateAvailabilityValidationSchema = z.object({
  body: z.object({
    availability: z.array(z.string(), {
      message: 'availability must be an array of time slot strings',
    }),
  }),
});

const getAllTechniciansValidationSchema = z.object({
  query: z.object({
    skill: z.string().optional(),
    location: z.string().optional(),
    minExperience: z.coerce.number().int().nonnegative().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    search: z.string().optional(),
  }),
});

const updateBookingStatusValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid booking id' }),
  }),
  body: z.object({
    status: z.enum(
      [
        BookingStatus.ACCEPTED,
        BookingStatus.DECLINED,
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
      ],
      {
        message: 'status must be ACCEPTED, DECLINED, IN_PROGRESS, or COMPLETED',
      }
    ),
  }),
});

const technicianIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid technician id' }),
  }),
});

export const TechnicianValidation = {
  updateTechnicianProfileValidationSchema,
  updateAvailabilityValidationSchema,
  getAllTechniciansValidationSchema,
  updateBookingStatusValidationSchema,
  technicianIdParamValidationSchema,
};
