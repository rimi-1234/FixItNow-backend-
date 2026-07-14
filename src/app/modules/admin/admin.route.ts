import express from 'express';
import { AdminControllers } from './admin.controller.js';
import { auth } from '../../../middlewares/auth.js';
import { Role } from '@prisma/client';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { AdminValidation } from './admin.validation.js';
import { CategoryControllers } from '../category/category.controller.js';
import { CategoryValidation } from '../category/category.validation.js';

const router = express.Router();

router.get(
  '/users',
  auth(Role.ADMIN),
  validateRequest(AdminValidation.getAllUsersValidationSchema),
  AdminControllers.getAllUsers
);
router.patch(
  '/users/:id',
  auth(Role.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminControllers.updateUserStatus
);
router.get(
  '/bookings',
  auth(Role.ADMIN),
  validateRequest(AdminValidation.getAllBookingsValidationSchema),
  AdminControllers.getAllBookings
);

router.get('/categories', auth(Role.ADMIN), CategoryControllers.getAllCategories);
router.post(
  '/categories',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryControllers.createCategory
);
router.patch(
  '/categories/:id',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);
router.delete(
  '/categories/:id',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.categoryIdParamValidationSchema),
  CategoryControllers.deleteCategory
);

export const AdminRoutes = router;
