import express from "express";
import {
  createUser,
  deleteUser,
  disableUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import {
  validateCreateUser,
  validateUpdateUser,
  validateIdParam,
} from "../middlewares/inputValidator.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// CRUD users
router.post("/users", validateCreateUser, createUser);
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.get("/users/:id", validateIdParam, getUserById);
router.put(
  "/users/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  validateUpdateUser,
  updateUser,
);
router.patch(
  "/users/:id/disable",
  requireAuth,
  requireAdmin,
  validateIdParam,
  disableUser,
);

// hard delete
router.delete(
  "/users/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  deleteUser,
);

export default router;
