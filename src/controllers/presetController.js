import {
  createPresetService,
  deletePresetService,
  getActivePresetByIdService,
  getActivePresetsService,
  getAllPresetsAdminService,
  getPresetByIdAdminService,
  updatePresetService,
} from "../models/presetModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// Public
export const getActivePresets = async (_req, res, next) => {
  try {
    const presets = await getActivePresetsService();
    handleResponse(res, 200, "Presets fetched successfully", presets);
  } catch (err) {
    next(err);
  }
};

export const getActivePresetById = async (req, res, next) => {
  try {
    const preset = await getActivePresetByIdService(req.params.id);
    if (!preset) return handleResponse(res, 404, "Preset not found");
    handleResponse(res, 200, "Preset fetched successfully", preset);
  } catch (err) {
    next(err);
  }
};

// Admin
export const getAllPresetsAdmin = async (_req, res, next) => {
  try {
    const presets = await getAllPresetsAdminService();
    handleResponse(res, 200, "Presets fetched successfully", presets);
  } catch (err) {
    next(err);
  }
};

export const getPresetByIdAdmin = async (req, res, next) => {
  try {
    const preset = await getPresetByIdAdminService(req.params.id);
    if (!preset) return handleResponse(res, 404, "Preset not found");
    handleResponse(res, 200, "Preset fetched successfully", preset);
  } catch (err) {
    next(err);
  }
};

export const createPreset = async (req, res, next) => {
  try {
    const created = await createPresetService(req.body);
    handleResponse(res, 201, "Preset created successfully", created);
  } catch (err) {
    // code unique
    if (err?.code === "23505") {
      return handleResponse(res, 409, "Preset code already exists");
    }
    next(err);
  }
};

export const updatePreset = async (req, res, next) => {
  try {
    const updated = await updatePresetService(req.params.id, req.body);
    if (!updated) return handleResponse(res, 404, "Preset not found");
    handleResponse(res, 200, "Preset updated successfully", updated);
  } catch (err) {
    if (err?.code === "23505") {
      return handleResponse(res, 409, "Preset code already exists");
    }
    next(err);
  }
};

export const deletePreset = async (req, res, next) => {
  try {
    const deleted = await deletePresetService(req.params.id);
    if (!deleted) return handleResponse(res, 404, "Preset not found");
    handleResponse(res, 200, "Preset deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
