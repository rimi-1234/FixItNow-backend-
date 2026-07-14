import { z } from 'zod';

const createServiceValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    price: z.number().nonnegative({ message: 'Price must be a positive number' }),
    categoryId: z.string().uuid({ message: 'Valid Category ID is required' }),
  }),
});

const updateServiceValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid service id' }),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

const getAllServicesValidationSchema = z.object({
  query: z.object({
    type: z.string().optional(),
    location: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    search: z.string().optional(),
  }),
});

const serviceIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid service id' }),
  }),
});

export const ServiceValidation = {
  createServiceValidationSchema,
  updateServiceValidationSchema,
  getAllServicesValidationSchema,
  serviceIdParamValidationSchema,
};
