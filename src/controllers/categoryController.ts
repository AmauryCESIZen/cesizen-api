import type { Request, Response, NextFunction } from "express";
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
} from "../models/categoryModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
  res.status(status).json({ status, message, data });
};

const isPrismaNotFoundError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
};

export const getAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cats = await getAllCategoriesService();
    handleResponse(res, 200, "Categories fetched successfully", cats);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cat = await getCategoryByIdService(Number(req.params.id));
    if (!cat) {
      handleResponse(res, 404, "Category not found");
      return;
    }
    handleResponse(res, 200, "Category fetched successfully", cat);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await createCategoryService(req.body.name);
    handleResponse(res, 201, "Category created successfully", created);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await updateCategoryService(Number(req.params.id), req.body.name);
    if (!updated) {
      handleResponse(res, 404, "Category not found");
      return;
    }
    handleResponse(res, 200, "Category updated successfully", updated);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Category not found");
      return;
    }
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await deleteCategoryService(Number(req.params.id));
    if (!deleted) {
      handleResponse(res, 404, "Category not found");
      return;
    }
    handleResponse(res, 200, "Category deleted successfully", deleted);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Category not found");
      return;
    }
    next(err);
  }
};
