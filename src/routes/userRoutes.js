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

const router = express.Router();

// CRUD users
router.post("/users", validateCreateUser, createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", validateIdParam, getUserById);
router.put("/users/:id", validateIdParam, validateUpdateUser, updateUser);
router.patch("/users/:id/disable", validateIdParam, disableUser);

// hard delete
router.delete("/users/:id", validateIdParam, deleteUser);

export default router;
