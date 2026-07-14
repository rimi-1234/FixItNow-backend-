import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { BookingServices } from './booking.service.js';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.createBooking(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Booking created successfully", data: result });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getUserBookings(req.user.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getBookingDetails(req.params.id as string, req.user.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking details retrieved successfully", data: result });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.cancelBooking(req.params.id as string, req.user.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking cancelled successfully", data: result });
});

export const BookingControllers = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
};
