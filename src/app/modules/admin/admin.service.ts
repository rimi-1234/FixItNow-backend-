import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma.js';
import { IAdminBookingFilters, IAdminUserFilters } from './admin.interface.js';
import { USER_SEARCHABLE_FIELDS } from './admin.constant.js';

const getAllUsers = async (filters: IAdminUserFilters) => {
  const { role, status, search, page = '1', limit = '20' } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

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

  const [data, total] = await Promise.all([
    prisma.user.findMany({
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
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: { total, page: Number(page), limit: take } };
};

const updateUserStatus = async (userId: string, status: 'ACTIVE' | 'BANNED') => {
  try {
    return await prisma.user.update({
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
  } catch (err: any) {
    if (err.code === 'P2025') throw Object.assign(new Error('User not found'), { statusCode: 404 });
    throw err;
  }
};

const getAllBookings = async (filters: IAdminBookingFilters) => {
  const { status, page = '1', limit = '20' } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  const where = status ? { status } : {};

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, email: true } },
        technician: { select: { id: true, email: true, technicianProfile: true } },
        service: { include: { category: true } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.booking.count({ where }),
  ]);

  return { data, meta: { total, page: Number(page), limit: take } };
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
