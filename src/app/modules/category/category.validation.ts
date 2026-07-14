import { z } from 'zod';

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    slug: z.string().min(1, { message: "Slug is required" }),
  }),
});

const updateCategoryValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid category id' }),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
  }),
});

const categoryIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid category id' }),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
  categoryIdParamValidationSchema,
};
