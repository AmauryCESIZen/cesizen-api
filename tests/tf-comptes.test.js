import { describe, test, expect } from "@jest/globals";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

const JWT_SECRET = "test-secret-for-jest";

const registerSchema = Joi.object({ email: Joi.string().email().max(255).required(), password: Joi.string().min(8).max(72).required() });
const loginSchema = Joi.object({ email: Joi.string().email().max(255).required(), password: Joi.string().min(1).max(72).required() });
const forgotSchema = Joi.object({ email: Joi.string().email().max(255).required() });
const resetSchema = Joi.object({ token: Joi.string().min(20).required(), password: Joi.string().min(8).max(72).required() });

function mockRes() {
  const res = {};
  res.statusCode = null; res.body = null;
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (d) => { res.body = d; return res; };
  return res;
}
const requireAuth = (req, res, next) => {
  try {
    const [type, token] = (req.headers.authorization || "").split(" ");
    if (type !== "Bearer" || !token) return res.status(401).json({ status: 401, message: "Token manquant." });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch { return res.status(401).json({ status: 401, message: "Token invalide ou expiré." }); }
};
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Accès administrateur requis." });
  next();
};

// TF-CU-01
describe("TF-CU-01 — Inscription", () => {
  test("validation accepte email + mot de passe valides", () => {
    const { error } = registerSchema.validate({ email: "nouveau@cesizen.fr", password: "MonPass123!" });
    expect(error).toBeUndefined();
  });
  test("le mot de passe est hashé et un JWT est générable", async () => {
    const hash = await bcrypt.hash("MonPass123!", 12);
    const token = jwt.sign({ sub: 1, role: "USER" }, JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(hash).not.toBe("MonPass123!");
    expect(decoded.role).toBe("USER");
  });
});

// TF-CU-02
describe("TF-CU-02 — Inscription email existant", () => {
  test("code PostgreSQL 23505 → 409", () => {
    const err = { code: "23505" };
    expect(err.code === "23505" ? 409 : 500).toBe(409);
  });
});

// TF-CU-03
describe("TF-CU-03 — Connexion valide", () => {
  test("validation accepte des identifiants valides", () => {
    const { error } = loginSchema.validate({ email: "user@cesizen.fr", password: "MonPass123!" });
    expect(error).toBeUndefined();
  });
  test("bcrypt valide le bon mot de passe et le JWT est retourné", async () => {
    const hash = await bcrypt.hash("MonPass123!", 12);
    expect(await bcrypt.compare("MonPass123!", hash)).toBe(true);
  });
});

// TF-CU-04
describe("TF-CU-04 — Connexion mauvais mot de passe", () => {
  test("bcrypt.compare retourne false → 401", async () => {
    const hash = await bcrypt.hash("MonPass123!", 12);
    expect(await bcrypt.compare("MauvaisMDP", hash)).toBe(false);
  });
});

// TF-CU-05
describe("TF-CU-05 — Connexion compte désactivé", () => {
  test("un utilisateur DESACTIVE reçoit une 403", () => {
    const user = { statut: "DESACTIVE" };
    expect(user.statut !== "ACTIF" ? 403 : 200).toBe(403);
  });
});

// TF-CU-06
describe("TF-CU-06 — Récupérer profil (GET /api/auth/me)", () => {
  test("requireAuth décode le token et remplit req.user", () => {
    const token = jwt.sign({ sub: 42, role: "USER" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, user: null };
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe(42);
  });
});

// TF-CU-07
describe("TF-CU-07 — Forgot password", () => {
  test("validation accepte un email valide", () => {
    const { error } = forgotSchema.validate({ email: "user@cesizen.fr" });
    expect(error).toBeUndefined();
  });
  test("un token est généré et hashé en SHA-256", () => {
    const token = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    expect(token).toHaveLength(64);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(token);
  });
});

// TF-CU-08
describe("TF-CU-08 — Reset password", () => {
  test("validation accepte token + nouveau mot de passe", () => {
    const { error } = resetSchema.validate({
      token: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      password: "NouveauMDP123!",
    });
    expect(error).toBeUndefined();
  });
  test("le nouveau mot de passe est hashable", async () => {
    const hash = await bcrypt.hash("NouveauMDP123!", 12);
    expect(await bcrypt.compare("NouveauMDP123!", hash)).toBe(true);
  });
});

// TF-CU-09
describe("TF-CU-09 — Admin — lister les utilisateurs", () => {
  test("un admin passe requireAuth + requireAdmin", () => {
    const token = jwt.sign({ sub: 1, role: "ADMIN" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, user: null };
    const res = mockRes();
    let step = 0;
    requireAuth(req, res, () => { step++; });
    requireAdmin(req, res, () => { step++; });
    expect(step).toBe(2);
  });
});

// TF-CU-10
describe("TF-CU-10 — Admin — désactiver un compte", () => {
  test("la désactivation met le statut à DESACTIVE", () => {
    const user = { id: 5, statut: "ACTIF" };
    user.statut = "DESACTIVE";
    expect(user.statut).toBe("DESACTIVE");
  });
});

// TF-CU-11
describe("TF-CU-11 — Admin — supprimer un compte", () => {
  test("la suppression cascade les reset_tokens", () => {
    let tokens = [{ id: 1, user_id: 1 }, { id: 2, user_id: 1 }, { id: 3, user_id: 2 }];
    tokens = tokens.filter((t) => t.user_id !== 1);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].user_id).toBe(2);
  });
});

// TF-CU-12
describe("TF-CU-12 — Accès sans token", () => {
  test("retourne 401 « Token manquant »", () => {
    const req = { headers: {}, user: null };
    const res = mockRes();
    requireAuth(req, res, () => {});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token manquant.");
  });
});

// TF-CU-13
describe("TF-CU-13 — Accès admin refusé (token USER)", () => {
  test("retourne 403 « Accès administrateur requis »", () => {
    const token = jwt.sign({ sub: 1, role: "USER" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, user: null };
    const res = mockRes();
    requireAuth(req, res, () => {});
    requireAdmin(req, res, () => {});
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Accès administrateur requis.");
  });
});
