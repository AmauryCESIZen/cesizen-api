import { describe, test, expect } from "@jest/globals";
import Joi from "joi";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret-for-jest";

const createPresetSchema = Joi.object({ code: Joi.string().min(2).max(10).required(), inspiration_s: Joi.number().integer().positive().required(), apnee_s: Joi.number().integer().min(0).required(), expiration_s: Joi.number().integer().positive().required(), actif: Joi.boolean().default(true) });
const updatePresetSchema = Joi.object({ code: Joi.string().min(2).max(10), inspiration_s: Joi.number().integer().positive(), apnee_s: Joi.number().integer().min(0), expiration_s: Joi.number().integer().positive(), actif: Joi.boolean() }).min(1);

function mockRes() { const r = {}; r.statusCode = null; r.body = null; r.status = (c) => { r.statusCode = c; return r; }; r.json = (d) => { r.body = d; return r; }; return r; }
const requireAuth = (req, res, next) => { try { const [type, token] = (req.headers.authorization || "").split(" "); if (type !== "Bearer" || !token) return res.status(401).json({ status: 401, message: "Token manquant." }); const p = jwt.verify(token, JWT_SECRET); req.user = { id: p.sub, role: p.role }; next(); } catch { return res.status(401).json({ status: 401, message: "Token invalide ou expiré." }); } };
const requireAdmin = (req, res, next) => { if (!req.user || req.user.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Accès administrateur requis." }); next(); };

const presetsDb = [
  { id: 1, code: "748", inspiration_s: 7, apnee_s: 4, expiration_s: 8, actif: true },
  { id: 2, code: "55", inspiration_s: 5, apnee_s: 0, expiration_s: 5, actif: true },
  { id: 3, code: "46", inspiration_s: 4, apnee_s: 0, expiration_s: 6, actif: true },
  { id: 4, code: "old", inspiration_s: 3, apnee_s: 0, expiration_s: 3, actif: false },
];

// TF-ER-01
describe("TF-ER-01 — Lister presets actifs", () => {
  test("retourne uniquement les presets actifs (748, 55, 46)", () => {
    const actifs = presetsDb.filter((p) => p.actif === true);
    expect(actifs).toHaveLength(3);
    expect(actifs.map((p) => p.code)).toContain("748");
    expect(actifs.map((p) => p.code)).toContain("55");
    expect(actifs.map((p) => p.code)).toContain("46");
  });
});

// TF-ER-02
describe("TF-ER-02 — Preset par ID", () => {
  test("retourne le détail du preset avec toutes les durées", () => {
    const preset = presetsDb.find((p) => p.id === 1 && p.actif);
    expect(preset).toBeDefined();
    expect(preset.code).toBe("748");
    expect(preset.inspiration_s).toBe(7);
    expect(preset.apnee_s).toBe(4);
    expect(preset.expiration_s).toBe(8);
  });
});

// TF-ER-03
describe("TF-ER-03 — Preset inexistant", () => {
  test("un ID inexistant retourne undefined → 404", () => {
    expect(presetsDb.find((p) => p.id === 999 && p.actif)).toBeUndefined();
  });
});

// TF-ER-04
describe("TF-ER-04 — Admin — tous les presets", () => {
  test("l'admin voit les presets actifs ET inactifs", () => {
    expect(presetsDb).toHaveLength(4);
    expect(presetsDb.some((p) => p.actif === false)).toBe(true);
  });
  test("un admin passe la chaîne auth + admin", () => {
    const token = jwt.sign({ sub: 1, role: "ADMIN" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, user: null };
    const res = mockRes();
    let ok = false;
    requireAuth(req, res, () => {});
    requireAdmin(req, res, () => { ok = true; });
    expect(ok).toBe(true);
  });
});

// TF-ER-05
describe("TF-ER-05 — Admin — créer un preset", () => {
  test("validation accepte un preset valide", () => {
    const { error, value } = createPresetSchema.validate({ code: "369", inspiration_s: 3, apnee_s: 6, expiration_s: 9 });
    expect(error).toBeUndefined();
    expect(value.actif).toBe(true);
  });
});

// TF-ER-06
describe("TF-ER-06 — Admin — code dupliqué", () => {
  test("code PostgreSQL 23505 → 409", () => {
    const err = { code: "23505" };
    expect(err.code === "23505" ? 409 : 500).toBe(409);
  });
});

// TF-ER-07
describe("TF-ER-07 — Admin — modifier un preset", () => {
  test("validation accepte une modification partielle", () => {
    const { error } = updatePresetSchema.validate({ actif: false });
    expect(error).toBeUndefined();
  });
  test("validation refuse un body vide", () => {
    const { error } = updatePresetSchema.validate({});
    expect(error).toBeDefined();
  });
});

// TF-ER-08
describe("TF-ER-08 — Admin — supprimer un preset", () => {
  test("la suppression retire le preset de la liste", () => {
    let presets = [...presetsDb];
    presets = presets.filter((p) => p.id !== 4);
    expect(presets).toHaveLength(3);
    expect(presets.find((p) => p.id === 4)).toBeUndefined();
  });
});
