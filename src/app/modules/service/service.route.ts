import express from 'express';
import { ServiceControllers } from './service.controller.js';
import { auth } from '../../../middlewares/auth.js';
import { Role } from '@prisma/client';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { ServiceValidation } from './service.validation.js';

const router = express.Router();

// Public browse — customers/technicians/guests can list services
router.get(
  '/',
  validateRequest(ServiceValidation.getAllServicesValidationSchema),
  ServiceControllers.getAllServices
);

router.post(
  '/',
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.createServiceValidationSchema),
  ServiceControllers.createService
);

router.patch(
  '/:id',
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.updateServiceValidationSchema),
  ServiceControllers.updateService
);

router.delete(
  '/:id',
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.serviceIdParamValidationSchema),
  ServiceControllers.deleteService
);

export const ServiceRoutes = router;
