import express from "express";
import {
  createContent,
  deleteContent,
  getAllContentsAdmin,
  getContentByIdAdmin,
  getPublishedContentById,
  getPublishedContents,
  updateContent,
} from "../controllers/contentController.js";
import { validateIdParam } from "../middlewares/inputValidator.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import {
  validateCreateContent,
  validateUpdateContent,
} from "../middlewares/contentValidator.js";

const router = express.Router();

router.get("/contents", getPublishedContents);
router.get("/contents/:id", validateIdParam, getPublishedContentById);

router.get("/admin/contents", requireAuth, requireAdmin, getAllContentsAdmin);
router.get(
  "/admin/contents/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  getContentByIdAdmin,
);
router.post(
  "/admin/contents",
  requireAuth,
  requireAdmin,
  validateCreateContent,
  createContent,
);
router.put(
  "/admin/contents/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  validateUpdateContent,
  updateContent,
);
router.delete(
  "/admin/contents/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  deleteContent,
);

export default router;
