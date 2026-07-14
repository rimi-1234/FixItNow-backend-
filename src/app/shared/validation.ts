import { z } from 'zod';

/** Shared Zod schema for routes with a UUID `:id` path param. */
export const uuidParamSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid id — must be a valid UUID' }),
  }),
});
