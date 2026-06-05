import Joi from "joi";
import { validateBody } from "./inputValidator.js";

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(1).max(72).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().min(20).required(),
  password: Joi.string().min(8).max(72).required(),
});

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);
