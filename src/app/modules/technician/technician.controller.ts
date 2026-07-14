import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { TechnicianServices } from './technician.service.js';
import { BookingStatus } from '@prisma/client';

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianServices.getAllTechnicians(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Technicians retrieved successfully',
    data: result,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianServices.getTechnicianById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Technician profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianServices.updateProfile(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const { availability } = req.body;
  const result = await TechnicianServices.updateAvailability(req.user.id, availability);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Availability updated successfully',
    data: result,
  });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianServices.getTechnicianBookings(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const status = req.body.status as BookingStatus;
  const result = await TechnicianServices.updateBookingStatus(
    req.user.id,
    req.params.id as string,
    status
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Booking status updated to ${status}`,
    data: result,
  });
});

export const TechnicianControllers = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};
