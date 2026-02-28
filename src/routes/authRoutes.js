import express from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import {
  validateLogin,
  validateRegister,
} from "../middlewares/authValidator.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auth/register", validateRegister, register);
router.post("/auth/login", validateLogin, login);
router.get("/auth/me", requireAuth, me);
router.post("/auth/logout", requireAuth, logout);

export default router;
