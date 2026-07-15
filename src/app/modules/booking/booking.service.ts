import prisma from '../../../lib/prisma.js';
import { IBookingCreatePayload } from './booking.interface.js';
import { BookingStatus } from '@prisma/client';

const createBooking = async (customerId: string, payload: IBookingCreatePayload) => {
  const [technician, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.technicianId, role: 'TECHNICIAN' } }),
    prisma.service.findUnique({ where: { id: payload.serviceId } }),
  ]);

  if (!technician) throw Object.assign(new Error('Technician not found'), { statusCode: 404 });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });

  if (service.technicianId !== payload.technicianId) {
    throw Object.assign(new Error('This service is not offered by the selected technician'), {
      statusCode: 400,
    });
  }

  const booking = await prisma.booking.create({
    data: {
      customerId,
      technicianId: payload.technicianId,
      serviceId: payload.serviceId,
      scheduledTime: new Date(payload.scheduledTime),
      status: 'REQUESTED'
    },
    include: {
      technician: { select: { id: true, email: true, technicianProfile: true } },
      service: true
    }
  });

  return booking;
};

const getUserBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      technician: { select: { id: true, email: true, technicianProfile: true } },
      service: true,
      payment: true,
      review: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getBookingDetails = async (bookingId: string, customerId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      technician: { select: { id: true, email: true, technicianProfile: true } },
      customer: { select: { id: true, email: true } },
      service: true,
      payment: true,
      review: true
    }
  });

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  
  // Ensure the booking belongs to the customer
  if (booking.customerId !== customerId) {
    throw Object.assign(new Error('You do not have permission to view this booking'), {
      statusCode: 403,
    });
  }

  return booking;
};

// Customers can cancel a booking at any point before it reaches IN_PROGRESS status.
const CANCELLABLE_STATUSES: BookingStatus[] = ['REQUESTED', 'ACCEPTED', 'PAID'];

const cancelBooking = async (bookingId: string, customerId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.customerId !== customerId) {
    throw Object.assign(new Error('You do not have permission to cancel this booking'), { statusCode: 403 });
  }
  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    throw Object.assign(
      new Error(`Booking cannot be cancelled once it is ${booking.status}`),
      { statusCode: 400 }
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' as BookingStatus },
    include: {
      technician: { select: { id: true, email: true } },
      service: true,
      payment: true,
    },
  });
};

export const BookingServices = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
};
