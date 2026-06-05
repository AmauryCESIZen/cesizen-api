import Joi from "joi";
import { validateBody } from "./inputValidator.js";

export const validateCreateCategory = validateBody(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
  }),
);

export const validateUpdateCategory = validateBody(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
  }),
);
