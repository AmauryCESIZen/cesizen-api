import Joi from "joi";
import type { Request, Response, NextFunction, RequestHandler } from "express";

export const validateBody =
  (schema: Joi.Schema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
      return;
    }

    req.body = value;
    next();
  };

export const validateIdParam = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const idSchema = Joi.number().integer().positive().required();
  const { error, value } = idSchema.validate(req.params.id);

  if (error) {
    res.status(400).json({ status: 400, message: "ID invalide." });
    return;
  }

  req.params.id = String(value);
  next();
};

export const createUserSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().max(255),
  password: Joi.string().min(8).max(72),
  role: Joi.string().valid("USER", "ADMIN"),
  statut: Joi.string().valid("ACTIF", "DESACTIVE"),
}).min(1);

export const validateCreateUser = validateBody(createUserSchema);
export const validateUpdateUser = validateBody(updateUserSchema);
