import type { Request, Response, NextFunction } from "express";
import {
  createPresetService,
  deletePresetService,
  getActivePresetByIdService,
  getActivePresetsService,
  getAllPresetsAdminService,
  getPresetByIdAdminService,
  updatePresetService,
} from "../models/presetModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
  res.status(status).json({ status, message, data });
};

const isPrismaUniqueError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
};

const isPrismaNotFoundError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
};

// ── Public ────────────────────────────────────────────────────
export const getActivePresets = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const presets = await getActivePresetsService();
    handleResponse(res, 200, "Presets fetched successfully", presets);
  } catch (err) {
    next(err);
  }
};

export const getActivePresetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const preset = await getActivePresetByIdService(Number(req.params.id));
    if (!preset) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    handleResponse(res, 200, "Preset fetched successfully", preset);
  } catch (err) {
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────
export const getAllPresetsAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const presets = await getAllPresetsAdminService();
    handleResponse(res, 200, "Presets fetched successfully", presets);
  } catch (err) {
    next(err);
  }
};

export const getPresetByIdAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const preset = await getPresetByIdAdminService(Number(req.params.id));
    if (!preset) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    handleResponse(res, 200, "Preset fetched successfully", preset);
  } catch (err) {
    next(err);
  }
};

export const createPreset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await createPresetService(req.body);
    handleResponse(res, 201, "Preset created successfully", created);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      handleResponse(res, 409, "Preset code already exists");
      return;
    }
    next(err);
  }
};

export const updatePreset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await updatePresetService(Number(req.params.id), req.body);
    if (!updated) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    handleResponse(res, 200, "Preset updated successfully", updated);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      handleResponse(res, 409, "Preset code already exists");
      return;
    }
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    next(err);
  }
};

export const deletePreset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await deletePresetService(Number(req.params.id));
    if (!deleted) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    handleResponse(res, 200, "Preset deleted successfully", deleted);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Preset not found");
      return;
    }
    next(err);
  }
};
