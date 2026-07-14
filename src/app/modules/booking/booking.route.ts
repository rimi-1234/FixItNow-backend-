import express from 'express';
import { BookingControllers } from './booking.controller.js';
import { auth } from '../../../middlewares/auth.js';
import { Role } from '@prisma/client';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { BookingValidation } from './booking.validation.js';

const router = express.Router();

router.post(
  '/',
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingControllers.createBooking
);
router.get('/', auth(Role.CUSTOMER), BookingControllers.getUserBookings);
router.get(
  '/:id',
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.bookingIdParamValidationSchema),
  BookingControllers.getBookingDetails
);
router.patch(
  '/:id/cancel',
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.bookingIdParamValidationSchema),
  BookingControllers.cancelBooking
);

export const BookingRoutes = router;
