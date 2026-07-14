import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AdminServices } from './admin.service.js';
import { UserStatus } from '@prisma/client';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body as { status: UserStatus };
  const result = await AdminServices.updateUserStatus(req.params.id as string, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User status updated to ${status}`,
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllBookings(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All bookings retrieved successfully',
    data: result,
  });
});

export const AdminControllers = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
