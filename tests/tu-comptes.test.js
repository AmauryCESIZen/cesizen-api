import { describe, test, expect } from "@jest/globals";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import Joi from "joi";

const JWT_SECRET = "test-secret-for-jest";

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

function mockReq(overrides = {}) {
  return { headers: {}, user: null, ...overrides };
}
function mockRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
}

// TU-CU-01
describe("TU-CU-01 — Hachage du mot de passe", () => {
  test("le hash bcrypt est différent du mot de passe original", async () => {
    const password = "MotDePasse123!";
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);
  });

  test("bcrypt.compare retourne true avec le bon mot de passe", async () => {
    const password = "MotDePasse123!";
    const hash = await bcrypt.hash(password, 12);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  test("bcrypt.compare retourne false avec un mauvais mot de passe", async () => {
    const hash = await bcrypt.hash("MotDePasse123!", 12);
    expect(await bcrypt.compare("MauvaisMDP", hash)).toBe(false);
  });
});

// TU-CU-02
describe("TU-CU-02 — Validation format email (Joi)", () => {
  test("accepte un email valide avec mot de passe correct", () => {
    const { error } = registerSchema.validate({ email: "user@cesizen.fr", password: "MonPass123!" });
    expect(error).toBeUndefined();
  });

  test("refuse un email invalide", () => {
    const { error } = registerSchema.validate({ email: "pas-un-email", password: "MonPass123!" });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("email");
  });

  test("refuse un mot de passe trop court (< 8 caractères)", () => {
    const { error } = registerSchema.validate({ email: "user@test.fr", password: "court" });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("password");
  });
});

// TU-CU-03
describe("TU-CU-03 — Génération token JWT", () => {
  test("le token contient sub et role", () => {
    const token = jwt.sign({ sub: 42, role: "ADMIN" }, JWT_SECRET, { expiresIn: "1h" });
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.sub).toBe(42);
    expect(decoded.role).toBe("ADMIN");
  });

  test("un token signé avec un mauvais secret est rejeté", () => {
    const token = jwt.sign({ sub: 1 }, JWT_SECRET);
    expect(() => jwt.verify(token, "mauvais-secret")).toThrow();
  });
});

// TU-CU-04
describe("TU-CU-04 — Hash SHA-256 du reset token", () => {
  test("le hash SHA-256 est différent du token brut", () => {
    const token = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    expect(hash).not.toBe(token);
    expect(hash).toHaveLength(64);
  });

  test("le même token produit toujours le même hash", () => {
    const token = randomBytes(32).toString("hex");
    const hash1 = createHash("sha256").update(token).digest("hex");
    const hash2 = createHash("sha256").update(token).digest("hex");
    expect(hash1).toBe(hash2);
  });
});

// TU-CU-05
describe("TU-CU-05 — Middleware requireAuth", () => {
  const requireAuth = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const [type, token] = authHeader.split(" ");
      if (type !== "Bearer" || !token)
        return res.status(401).json({ status: 401, message: "Token manquant." });
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      return res.status(401).json({ status: 401, message: "Token invalide ou expiré." });
    }
  };

  test("retourne 401 si aucun header Authorization", () => {
    const req = mockReq();
    const res = mockRes();
    requireAuth(req, res, () => {});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token manquant.");
  });

  test("retourne 401 si le token est invalide", () => {
    const req = mockReq({ headers: { authorization: "Bearer token-bidon" } });
    const res = mockRes();
    requireAuth(req, res, () => {});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token invalide ou expiré.");
  });

  test("appelle next() et remplit req.user si le token est valide", () => {
    const token = jwt.sign({ sub: 1, role: "USER" }, JWT_SECRET);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe(1);
    expect(req.user.role).toBe("USER");
  });
});

// TU-CU-06
describe("TU-CU-06 — Middleware requireAdmin", () => {
  const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN")
      return res.status(403).json({ status: 403, message: "Accès administrateur requis." });
    next();
  };

  test("retourne 403 si le rôle est USER", () => {
    const req = mockReq({ user: { id: 1, role: "USER" } });
    const res = mockRes();
    requireAdmin(req, res, () => {});
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Accès administrateur requis.");
  });

  test("appelle next() si le rôle est ADMIN", () => {
    const req = mockReq({ user: { id: 1, role: "ADMIN" } });
    const res = mockRes();
    let nextCalled = false;
    requireAdmin(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });
});
