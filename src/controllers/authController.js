import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
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

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const signToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUserService(email, passwordHash);

    const token = signToken(user);

    return handleResponse(res, 201, "Compte créé", { user, token });
  } catch (err) {
    if (err?.code === "23505") {
      return handleResponse(res, 409, "Cet email est déjà utilisé.");
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmailService(email);
    if (!user) return handleResponse(res, 401, "Identifiants invalides.");

    if (user.statut !== "ACTIF") {
      return handleResponse(res, 403, "Compte désactivé.");
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return handleResponse(res, 401, "Identifiants invalides.");

    const token = signToken(user);

    const userPublic = {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return handleResponse(res, 200, "Connexion réussie", {
      user: userPublic,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getUserPublicByIdService(req.user.id);
    if (!user) return handleResponse(res, 404, "Utilisateur introuvable.");
    return handleResponse(res, 200, "OK", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "Déconnecté (supprime le token côté client).",
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmailService(email);

    const genericMsg =
      "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.";

    if (!user || user.statut !== "ACTIF") {
      return handleResponse(res, 200, genericMsg);
    }

    await invalidateOldTokensForUser(user.id);

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 60);
    const expireAt = new Date(Date.now() + minutes * 60 * 1000);

    await createResetTokenService({
      userId: user.id,
      tokenHash,
      expireAt,
    });

    const baseUrl = process.env.RESET_PASSWORD_URL;
    const resetLink = `${baseUrl}?token=${encodeURIComponent(token)}`;

    await sendResetPasswordEmail({
      to: user.email,
      resetLink,
    });

    return handleResponse(res, 200, genericMsg);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetRow = await findValidResetTokenByHashService(tokenHash);
    if (!resetRow) {
      return handleResponse(res, 400, "Token invalide ou expiré.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const updatedUser = await updateUserPasswordService(
      resetRow.user_id,
      passwordHash,
    );

    await markResetTokenUsedService(resetRow.id);

    return handleResponse(res, 200, "Mot de passe mis à jour.", {
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
