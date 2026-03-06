import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
} from "../models/categoryModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

export const getAllCategories = async (_req, res, next) => {
  try {
    const cats = await getAllCategoriesService();
    handleResponse(res, 200, "Categories fetched successfully", cats);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const cat = await getCategoryByIdService(req.params.id);
    if (!cat) return handleResponse(res, 404, "Category not found");
    handleResponse(res, 200, "Category fetched successfully", cat);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const created = await createCategoryService(req.body.name);
    handleResponse(res, 201, "Category created successfully", created);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const updated = await updateCategoryService(req.params.id, req.body.name);
    if (!updated) return handleResponse(res, 404, "Category not found");
    handleResponse(res, 200, "Category updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await deleteCategoryService(req.params.id);
    if (!deleted) return handleResponse(res, 404, "Category not found");
    handleResponse(res, 200, "Category deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
