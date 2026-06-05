import Joi from "joi";
import { validateBody } from "./inputValidator.js";

export const validateCreateContent = validateBody(
  Joi.object({
    title: Joi.string().min(3).max(200).required(),
    body: Joi.string().min(10).required(),
    categoryIds: Joi.array()
      .items(Joi.number().integer().positive())
      .default([]),
  }),
);

export const validateUpdateContent = validateBody(
  Joi.object({
    title: Joi.string().min(3).max(200),
    body: Joi.string().min(10),
    status: Joi.string().valid("BROUILLON", "PUBLIE"),
    categoryIds: Joi.array().items(Joi.number().integer().positive()),
  }).min(1),
);
