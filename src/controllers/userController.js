import bcrypt from "bcryptjs";
import {
  createUserService,
  deleteUserService,
  disableUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
} from "../models/userModel.js";

//Standardized response function
const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

export const createUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await createUserService(email, passwordHash);
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (err) {
    if (err?.code === "23505") {
      return handleResponse(res, 409, "Email already exists");
    }
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    handleResponse(res, 200, "Users fetched successfully", users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    if (!user) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  const { email, password, role, statut } = req.body;

  try {
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    const updatedUser = await updateUserService(req.params.id, {
      email,
      passwordHash,
      role,
      statut,
    });

    if (!updatedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    if (err?.code === "23505") {
      return handleResponse(res, 409, "Email already exists");
    }
    next(err);
  }
};

export const disableUser = async (req, res, next) => {
  try {
    const disabled = await disableUserService(req.params.id);
    if (!disabled) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User disabled successfully", disabled);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserService(req.params.id);
    if (!deletedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User deleted successfully", deletedUser);
  } catch (err) {
    next(err);
  }
};
