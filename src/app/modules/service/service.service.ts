import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma.js';
import { IServiceFilters, IServicePayload, IServiceUpdatePayload } from './service.interface.js';

const getAllServices = async (filters: IServiceFilters) => {
  const { type, location, minRating, minPrice, maxPrice, search } = filters;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
    ...(type
      ? { category: { name: { contains: type, mode: Prisma.QueryMode.insensitive } } }
      : {}),
    ...(location
      ? {
          technician: {
            technicianProfile: {
              is: {
                location: { contains: location, mode: Prisma.QueryMode.insensitive },
              },
            },
          },
        }
      : {}),
    price: {
      ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
      ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {}),
    },
  } as Prisma.ServiceWhereInput;

  const services = await prisma.service.findMany({
    where,
    include: {
      category: true,
      technician: {
        select: {
          id: true,
          email: true,
          technicianProfile: true,
          reviewsReceived: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const withRatings = services.map((service) => {
    const { reviewsReceived, ...technicianRest } = service.technician;
    const reviewCount = reviewsReceived.length;
    const averageRating = reviewCount
      ? Number(
          (
            reviewsReceived.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
            reviewCount
          ).toFixed(2)
        )
      : 0;

    return {
      ...service,
      technician: { ...technicianRest, averageRating, reviewCount },
    };
  });

  if (minRating !== undefined) {
    return withRatings.filter((s) => s.technician.averageRating >= Number(minRating));
  }

  return withRatings;
};

const createService = async (technicianId: string, payload: IServicePayload) => {
  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });

  return prisma.service.create({
    data: { ...payload, technicianId },
    include: { category: true },
  });
};

const updateService = async (technicianId: string, serviceId: string, payload: IServiceUpdatePayload) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  if (service.technicianId !== technicianId) {
    throw Object.assign(new Error('Access denied: Not your service'), { statusCode: 403 });
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: payload,
    include: { category: true },
  });
};

const deleteService = async (technicianId: string, serviceId: string) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  if (service.technicianId !== technicianId) {
    throw Object.assign(new Error('Access denied: Not your service'), { statusCode: 403 });
  }

  return prisma.service.delete({ where: { id: serviceId } });
};

export const ServiceServices = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
