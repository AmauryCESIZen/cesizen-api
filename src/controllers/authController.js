import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUserService,
  getUserByEmailService,
  getUserPublicByIdService,
} from "../models/userModel.js";

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
    // unique violation on email
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
