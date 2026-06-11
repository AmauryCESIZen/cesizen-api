import prisma from "../config/prisma.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";

const presetSelect = {
  id: true,
  code: true,
  inspirationS: true,
  apneeS: true,
  expirationS: true,
  actif: true,
  createdAt: true,
  updatedAt: true,
};

// ── Public ────────────────────────────────────────────────────
export const getActivePresetsService = async () => {
  const presets = await prisma.breathingPreset.findMany({
    where: { actif: true },
    select: presetSelect,
    orderBy: [{ inspirationS: "asc" }, { expirationS: "asc" }],
  });
  return toSnakeCase(presets);
};

export const getActivePresetByIdService = async (id: number) => {
  const preset = await prisma.breathingPreset.findFirst({
    where: { id, actif: true },
    select: presetSelect,
  });
  return preset ? toSnakeCase(preset) : undefined;
};

// ── Admin ─────────────────────────────────────────────────────
export const getAllPresetsAdminService = async () => {
  const presets = await prisma.breathingPreset.findMany({
    select: presetSelect,
    orderBy: { createdAt: "desc" },
  });
  return toSnakeCase(presets);
};

export const getPresetByIdAdminService = async (id: number) => {
  const preset = await prisma.breathingPreset.findUnique({
    where: { id },
    select: presetSelect,
  });
  return preset ? toSnakeCase(preset) : undefined;
};

// Note : on accepte les noms snake_case (comme avant) côté input
// pour ne pas casser le contrat avec les controllers existants.
interface PresetInput {
  code: string;
  inspiration_s: number;
  apnee_s: number;
  expiration_s: number;
  actif?: boolean;
}

export const createPresetService = async (data: PresetInput) => {
  const preset = await prisma.breathingPreset.create({
    data: {
      code: data.code,
      inspirationS: data.inspiration_s,
      apneeS: data.apnee_s,
      expirationS: data.expiration_s,
      actif: data.actif ?? true,
    },
    select: presetSelect,
  });
  return toSnakeCase(preset);
};

interface UpdatePresetInput {
  code?: string | null;
  inspiration_s?: number | null;
  apnee_s?: number | null;
  expiration_s?: number | null;
  actif?: boolean | null;
}

export const updatePresetService = async (
  id: number,
  data: UpdatePresetInput,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (data.code !== null && data.code !== undefined) updateData.code = data.code;
  if (data.inspiration_s !== null && data.inspiration_s !== undefined)
    updateData.inspirationS = data.inspiration_s;
  if (data.apnee_s !== null && data.apnee_s !== undefined)
    updateData.apneeS = data.apnee_s;
  if (data.expiration_s !== null && data.expiration_s !== undefined)
    updateData.expirationS = data.expiration_s;
  if (data.actif !== null && data.actif !== undefined)
    updateData.actif = data.actif;

  const preset = await prisma.breathingPreset.update({
    where: { id },
    data: updateData,
    select: presetSelect,
  });
  return toSnakeCase(preset);
};

export const deletePresetService = async (id: number) => {
  const preset = await prisma.breathingPreset.delete({
    where: { id },
    select: presetSelect,
  });
  return toSnakeCase(preset);
};
