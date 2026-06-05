import prisma from "../config/prisma.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";
import type { Role, UserStatus } from "@prisma/client";

// Sélection des champs publics (sans password_hash)
const publicSelect = {
  id: true,
  email: true,
  role: true,
  statut: true,
  createdAt: true,
  updatedAt: true,
};

// Sélection avec password_hash (pour le login)
const withPasswordSelect = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  statut: true,
  createdAt: true,
  updatedAt: true,
};

export const getUserByEmailService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: withPasswordSelect,
  });
  return user ? toSnakeCase(user) : undefined;
};

export const createUserService = async (email: string, passwordHash: string) => {
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "USER",
      statut: "ACTIF",
    },
    select: publicSelect,
  });
  return toSnakeCase(user);
};

export const getUserPublicByIdService = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicSelect,
  });
  return user ? toSnakeCase(user) : undefined;
};

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    select: publicSelect,
    orderBy: { id: "asc" },
  });
  return toSnakeCase(users);
};

export const getUserByIdService = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicSelect,
  });
  return user ? toSnakeCase(user) : undefined;
};

interface UpdateUserInput {
  email?: string | null;
  passwordHash?: string | null;
  role?: Role | null;
  statut?: UserStatus | null;
}

export const updateUserService = async (
  id: number,
  { email = null, passwordHash = null, role = null, statut = null }: UpdateUserInput,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (email !== null) data.email = email.toLowerCase();
  if (passwordHash !== null) data.passwordHash = passwordHash;
  if (role !== null) data.role = role;
  if (statut !== null) data.statut = statut;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: publicSelect,
  });
  return toSnakeCase(user);
};

export const disableUserService = async (id: number) => {
  const user = await prisma.user.update({
    where: { id },
    data: { statut: "DESACTIVE" },
    select: publicSelect,
  });
  return toSnakeCase(user);
};

export const deleteUserService = async (id: number) => {
  const user = await prisma.user.delete({
    where: { id },
    select: publicSelect,
  });
  return toSnakeCase(user);
};

export const updateUserPasswordService = async (
  userId: number,
  passwordHash: string,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: publicSelect,
  });
  return toSnakeCase(user);
};
