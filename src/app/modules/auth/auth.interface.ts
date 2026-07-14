import { Role } from "@prisma/client";

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  email: string;
  password: string;
  role?: Role;
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  location?: string;
}
