import Joi from "joi";
import { validateBody } from "./inputValidator.js";

export const validateCreatePreset = validateBody(
  Joi.object({
    code: Joi.string().min(2).max(10).required(),
    inspiration_s: Joi.number().integer().positive().required(),
    apnee_s: Joi.number().integer().min(0).required(),
    expiration_s: Joi.number().integer().positive().required(),
    actif: Joi.boolean().default(true),
  }),
);

export const validateUpdatePreset = validateBody(
  Joi.object({
    code: Joi.string().min(2).max(10),
    inspiration_s: Joi.number().integer().positive(),
    apnee_s: Joi.number().integer().min(0),
    expiration_s: Joi.number().integer().positive(),
    actif: Joi.boolean(),
  }).min(1),
);
