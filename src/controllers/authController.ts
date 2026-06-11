import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import {
  createUserService,
  getUserByEmailService,
  getUserPublicByIdService,
  updateUserPasswordService,
} from "../models/userModel.js";
import {
  createResetTokenService,
  findValidResetTokenByHashService,
  invalidateOldTokensForUser,
  markResetTokenUsedService,
} from "../models/resetTokenModel.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
  res.status(status).json({ status, message, data });
};

interface UserForToken {
  id: number;
  role: Role;
}

const signToken = (user: UserForToken): string => {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as any },
  );
};

// Prisma unique constraint error code
const isPrismaUniqueError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUserService(email, passwordHash);

    const token = signToken(user);

    handleResponse(res, 201, "Compte créé", { user, token });
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      handleResponse(res, 409, "Cet email est déjà utilisé.");
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmailService(email);
    if (!user) {
      handleResponse(res, 401, "Identifiants invalides.");
      return;
    }

    if (user.statut !== "ACTIF") {
      handleResponse(res, 403, "Compte désactivé.");
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      handleResponse(res, 401, "Identifiants invalides.");
      return;
    }

    const token = signToken(user);

    const userPublic = {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    handleResponse(res, 200, "Connexion réussie", { user: userPublic, token });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      handleResponse(res, 401, "Non authentifié.");
      return;
    }
    const user = await getUserPublicByIdService(req.user.id);
    if (!user) {
      handleResponse(res, 404, "Utilisateur introuvable.");
      return;
    }
    handleResponse(res, 200, "OK", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 200,
    message: "Déconnecté (supprime le token côté client).",
  });
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await getUserByEmailService(email);

    const genericMsg =
      "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.";

    if (!user || user.statut !== "ACTIF") {
      handleResponse(res, 200, genericMsg);
      return;
    }

    await invalidateOldTokensForUser(user.id);

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 60);
    const expireAt = new Date(Date.now() + minutes * 60 * 1000);

    await createResetTokenService({ userId: user.id, tokenHash, expireAt });

    const baseUrl = process.env.RESET_PASSWORD_URL;
    const resetLink = `${baseUrl}?token=${encodeURIComponent(token)}`;

    await sendResetPasswordEmail({ to: user.email, resetLink });

    handleResponse(res, 200, genericMsg);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token, password } = req.body;

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetRow = await findValidResetTokenByHashService(tokenHash);
    if (!resetRow) {
      handleResponse(res, 400, "Token invalide ou expiré.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const updatedUser = await updateUserPasswordService(resetRow.user_id, passwordHash);

    await markResetTokenUsedService(resetRow.id);

    handleResponse(res, 200, "Mot de passe mis à jour.", { user: updatedUser });
  } catch (err) {
    next(err);
  }
};
