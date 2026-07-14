import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { ServiceServices } from './service.service.js';

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.getAllServices(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Services retrieved successfully',
    data: result,
  });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.createService(req.user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Service created successfully',
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.updateService(req.user.id, req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceServices.deleteService(req.user.id, req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service deleted successfully',
    data: result,
  });
});

export const ServiceControllers = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
