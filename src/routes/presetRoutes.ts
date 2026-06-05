import express from "express";
import {
  createPreset,
  deletePreset,
  getActivePresetById,
  getActivePresets,
  getAllPresetsAdmin,
  getPresetByIdAdmin,
  updatePreset,
} from "../controllers/presetController.js";
import { validateIdParam } from "../middlewares/inputValidator.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import {
  validateCreatePreset,
  validateUpdatePreset,
} from "../middlewares/presetValidator.js";

const router = express.Router();

router.get("/presets", getActivePresets);
router.get("/presets/:id", validateIdParam, getActivePresetById);

router.get("/admin/presets", requireAuth, requireAdmin, getAllPresetsAdmin);
router.get(
  "/admin/presets/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  getPresetByIdAdmin,
);
router.post(
  "/admin/presets",
  requireAuth,
  requireAdmin,
  validateCreatePreset,
  createPreset,
);
router.put(
  "/admin/presets/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  validateUpdatePreset,
  updatePreset,
);
router.delete(
  "/admin/presets/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  deletePreset,
);

export default router;
