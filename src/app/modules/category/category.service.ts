import prisma from '../../../lib/prisma.js';
import { ICategoryPayload } from './category.interface.js';

const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { services: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};

const createCategory = async (payload: ICategoryPayload) => {
  return prisma.category.create({
    data: payload,
  });
};

const updateCategory = async (id: string, payload: Partial<ICategoryPayload>) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });

  return prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { services: true } } },
  });
  if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  if (category._count.services > 0) {
    throw Object.assign(
      new Error('Cannot delete a category that has services assigned to it'),
      { statusCode: 400 }
    );
  }

  return prisma.category.delete({ where: { id } });
};

export const CategoryServices = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
