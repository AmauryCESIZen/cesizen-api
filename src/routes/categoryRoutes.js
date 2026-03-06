import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { validateIdParam } from "../middlewares/inputValidator.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../middlewares/categoryValidator.js";

const router = express.Router();

// Public
router.get("/categories", getAllCategories);
router.get("/categories/:id", validateIdParam, getCategoryById);

// Admin
router.post(
  "/admin/categories",
  requireAuth,
  requireAdmin,
  validateCreateCategory,
  createCategory,
);
router.put(
  "/admin/categories/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  validateUpdateCategory,
  updateCategory,
);
router.delete(
  "/admin/categories/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  deleteCategory,
);

export default router;
