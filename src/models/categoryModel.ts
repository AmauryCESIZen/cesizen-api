import prisma from "../config/prisma.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";

const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllCategoriesService = async () => {
  const categories = await prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
  return toSnakeCase(categories);
};

export const getCategoryByIdService = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });
  return category ? toSnakeCase(category) : undefined;
};

export const createCategoryService = async (name: string) => {
  const category = await prisma.category.create({
    data: { name },
    select: categorySelect,
  });
  return toSnakeCase(category);
};

export const updateCategoryService = async (id: number, name: string) => {
  const category = await prisma.category.update({
    where: { id },
    data: { name },
    select: categorySelect,
  });
  return toSnakeCase(category);
};

export const deleteCategoryService = async (id: number) => {
  const category = await prisma.category.delete({
    where: { id },
    select: categorySelect,
  });
  return toSnakeCase(category);
};
