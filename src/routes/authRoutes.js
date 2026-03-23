import express from "express";
import {
  login,
  logout,
  me,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/authValidator.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auth/register", validateRegister, register);
router.post("/auth/login", validateLogin, login);
router.get("/auth/me", requireAuth, me);
router.post("/auth/logout", requireAuth, logout);
router.post("/auth/forgot-password", validateForgotPassword, forgotPassword);
router.post("/auth/reset-password", validateResetPassword, resetPassword);

export default router;
