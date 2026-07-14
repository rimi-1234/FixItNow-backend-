import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma.js';
import { IAdminBookingFilters, IAdminUserFilters } from './admin.interface.js';
import { USER_SEARCHABLE_FIELDS } from './admin.constant.js';

const getAllUsers = async (filters: IAdminUserFilters) => {
  const { role, status, search } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (role) andConditions.push({ role });
  if (status) andConditions.push({ status });
  if (search) {
    andConditions.push({
      OR: USER_SEARCHABLE_FIELDS.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    });
  }

  const where: Prisma.UserWhereInput = andConditions.length ? { AND: andConditions } : {};

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      technicianProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateUserStatus = async (userId: string, status: 'ACTIVE' | 'BANNED') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

const getAllBookings = async (filters: IAdminBookingFilters) => {
  const { status } = filters;

  return prisma.booking.findMany({
    where: status ? { status } : {},
    include: {
      customer: { select: { id: true, email: true } },
      technician: { select: { id: true, email: true, technicianProfile: true } },
      service: { include: { category: true } },
      payment: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
