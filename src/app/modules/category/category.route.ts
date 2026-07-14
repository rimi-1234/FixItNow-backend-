import express from 'express';
import { CategoryControllers } from './category.controller.js';
import { auth } from '../../../middlewares/auth.js';
import { Role } from '@prisma/client';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { CategoryValidation } from './category.validation.js';

const router = express.Router();

router.get('/', CategoryControllers.getAllCategories);
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryControllers.createCategory
);
router.patch(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);
router.delete(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.categoryIdParamValidationSchema),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
