import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import "../utils/types.js"; // augmentation Express.Request

interface JwtPayload {
  sub: number;
  role: Role;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      res.status(401).json({ status: 401, message: "Token manquant." });
      return;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as unknown as JwtPayload;

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({ status: 401, message: "Token invalide ou expiré." });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res
      .status(403)
      .json({ status: 403, message: "Accès administrateur requis." });
    return;
  }
  next();
};
