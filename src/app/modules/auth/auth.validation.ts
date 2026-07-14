import { z } from 'zod';
import { Role } from '@prisma/client';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  }),
});

const registerValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    role: z.enum([Role.CUSTOMER, Role.TECHNICIAN]).optional(),
    skills: z.array(z.string()).optional(),
    experience: z.number().int().nonnegative().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
  })
    .refine(
      (data) => {
        // If role is TECHNICIAN, we might want to enforce skills/experience/hourlyRate
        if (data.role === Role.TECHNICIAN) {
          return data.skills !== undefined && data.experience !== undefined && data.hourlyRate !== undefined;
        }
        return true;
      },
      {
        message: "Technicians must provide skills, experience, and hourlyRate",
        path: ["role"],
      }
    ),
});

export const AuthValidation = {
  loginValidationSchema,
  registerValidationSchema,
};
