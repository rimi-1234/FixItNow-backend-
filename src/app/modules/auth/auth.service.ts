import prisma from '../../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import { Prisma, Role } from '@prisma/client';
import { ILoginPayload, IRegisterPayload } from './auth.interface.js';

const httpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const registerUser = async (payload: IRegisterPayload) => {
  if (!payload) throw httpError('Request payload is required', 400);
  const { email, password, role, ...profileData } = payload;
  if (!email || !password) throw httpError('Email and password are required', 400);
  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds) || 12);

  const technicianProfileCreate = {
    skills: profileData.skills || [],
    experience: profileData.experience || 0,
    hourlyRate: profileData.hourlyRate || 0,
    bio: profileData.bio || null,
    location: profileData.location || null,
  } as Prisma.TechnicianProfileCreateWithoutUserInput;

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || Role.CUSTOMER,
      technicianProfile:
        role === Role.TECHNICIAN
          ? {
              create: technicianProfileCreate,
            }
          : undefined,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: true,
    },
  });

  return user;
};

const loginUser = async (payload: ILoginPayload) => {
  if (!payload) throw httpError('Request payload is required', 400);
  const { email, password } = payload;
  if (!email || !password) throw httpError('Email and password are required', 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw httpError('User not found', 404);
  if (user.status === 'BANNED') throw httpError('User is banned', 403);

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw httpError('Incorrect password', 401);

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_access_secret as string,
    { expiresIn: (config.jwt_access_expires_in || '1d') as any }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

const getMeFromDB = async (email: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: true,
    },
  });
  return result;
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMeFromDB,
};
