import prisma from '../../../lib/prisma.js';
import { ITechnicianFilters, ITechnicianUpdateProfilePayload } from './technician.interface.js';
import { BookingStatus } from '@prisma/client';

const withAverageRating = <T extends { reviewsReceived: { rating: number }[] }>(technician: T) => {
  const { reviewsReceived, ...rest } = technician;
  const reviewCount = reviewsReceived.length;
  const averageRating = reviewCount
    ? Number((reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2))
    : 0;

  return { ...rest, averageRating, reviewCount };
};

const getAllTechnicians = async (filters: ITechnicianFilters) => {
  const { skill, location, minExperience, minRating, search } = filters;

  const technicians = await prisma.user.findMany({
    where: {
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      ...(search && {
        email: { contains: search, mode: 'insensitive' },
      }),
      technicianProfile: {
        ...(skill && { skills: { has: skill } }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(minExperience !== undefined && { experience: { gte: Number(minExperience) } }),
      },
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      technicianProfile: true,
      services: {
        include: { category: true },
      },
      reviewsReceived: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const withRatings = technicians.map(withAverageRating);

  if (minRating !== undefined) {
    return withRatings.filter((t) => t.averageRating >= Number(minRating));
  }

  return withRatings;
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.user.findUnique({
    where: { id, role: 'TECHNICIAN' },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      technicianProfile: true,
      services: {
        include: { category: true },
      },
      reviewsReceived: {
        include: {
          customer: { select: { id: true, email: true } },
          booking: { select: { id: true, service: true } },
        },
      },
    },
  });

  if (!technician) throw Object.assign(new Error('Technician not found'), { statusCode: 404 });

  const { reviewsReceived, ...rest } = technician;
  const reviewCount = reviewsReceived.length;
  const averageRating = reviewCount
    ? Number((reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2))
    : 0;

  return { ...rest, reviews: reviewsReceived, averageRating, reviewCount };
};

const updateProfile = async (id: string, payload: ITechnicianUpdateProfilePayload) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: id },
  });

  if (!profile) {
    return prisma.technicianProfile.create({
      data: { userId: id, ...payload },
    });
  }

  return prisma.technicianProfile.update({
    where: { userId: id },
    data: payload,
  });
};

const updateAvailability = async (technicianId: string, availability: string[]) => {
  return prisma.technicianProfile.upsert({
    where: { userId: technicianId },
    create: { userId: technicianId, skills: [], availability },
    update: { availability },
  });
};

const getTechnicianBookings = async (technicianId: string) => {
  return prisma.booking.findMany({
    where: { technicianId },
    include: {
      customer: { select: { id: true, email: true } },
      service: { include: { category: true } },
      payment: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateBookingStatus = async (
  technicianId: string,
  bookingId: string,
  status: BookingStatus
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.technicianId !== technicianId)
    throw Object.assign(new Error('Access denied: Not your booking'), { statusCode: 403 });

  // Validate allowed transitions
  // Flow: REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED
  const allowed: Partial<Record<BookingStatus, BookingStatus[]>> = {
    REQUESTED: ['ACCEPTED', 'DECLINED'],
    PAID: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
  };

  if (!allowed[booking.status]?.includes(status)) {
    let message = `Cannot transition booking from ${booking.status} to ${status}`;

    if (booking.status === 'ACCEPTED' && status === 'IN_PROGRESS') {
      message =
        'Booking must be PAID before it can be marked IN_PROGRESS. Ask the customer to complete payment first.';
    } else if (booking.status === 'REQUESTED' && status === 'IN_PROGRESS') {
      message =
        'Booking must be ACCEPTED and then PAID before it can be marked IN_PROGRESS.';
    } else if (status === 'COMPLETED' && booking.status !== 'IN_PROGRESS') {
      message =
        'Booking must be IN_PROGRESS before it can be marked COMPLETED.';
    }

    throw Object.assign(new Error(message), { statusCode: 400 });
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      customer: { select: { id: true, email: true } },
      service: true,
    },
  });
};

export const TechnicianServices = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};
