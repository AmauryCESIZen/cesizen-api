import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import {
  createUserService,
  deleteUserService,
  disableUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
} from "../models/userModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
  res.status(status).json({ status, message, data });
};

const isPrismaUniqueError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
};

const isPrismaNotFoundError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await createUserService(email, passwordHash);
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      handleResponse(res, 409, "Email already exists");
      return;
    }
    next(err);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await getAllUsersService();
    handleResponse(res, 200, "Users fetched successfully", users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getUserByIdService(Number(req.params.id));
    if (!user) {
      handleResponse(res, 404, "User not found");
      return;
    }
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password, role, statut } = req.body;

  try {
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    const updatedUser = await updateUserService(Number(req.params.id), {
      email,
      passwordHash,
      role,
      statut,
    });

    if (!updatedUser) {
      handleResponse(res, 404, "User not found");
      return;
    }
    handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      handleResponse(res, 409, "Email already exists");
      return;
    }
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "User not found");
      return;
    }
    next(err);
  }
};

export const disableUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const disabled = await disableUserService(Number(req.params.id));
    if (!disabled) {
      handleResponse(res, 404, "User not found");
      return;
    }
    handleResponse(res, 200, "User disabled successfully", disabled);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "User not found");
      return;
    }
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedUser = await deleteUserService(Number(req.params.id));
    if (!deletedUser) {
      handleResponse(res, 404, "User not found");
      return;
    }
    handleResponse(res, 200, "User deleted successfully", deletedUser);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "User not found");
      return;
    }
    next(err);
  }
};
