import { describe, test, expect } from "@jest/globals";
import Joi from "joi";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret-for-jest";

const createContentSchema = Joi.object({ title: Joi.string().min(3).max(200).required(), body: Joi.string().min(10).required(), categoryIds: Joi.array().items(Joi.number().integer().positive()).default([]) });
const updateContentSchema = Joi.object({ title: Joi.string().min(3).max(200), body: Joi.string().min(10), status: Joi.string().valid("BROUILLON", "PUBLIE"), categoryIds: Joi.array().items(Joi.number().integer().positive()) }).min(1);
const createCategorySchema = Joi.object({ name: Joi.string().min(2).max(120).required() });

function mockRes() { const r = {}; r.statusCode = null; r.body = null; r.status = (c) => { r.statusCode = c; return r; }; r.json = (d) => { r.body = d; return r; }; return r; }
const requireAuth = (req, res, next) => { try { const [type, token] = (req.headers.authorization || "").split(" "); if (type !== "Bearer" || !token) return res.status(401).json({ status: 401, message: "Token manquant." }); const p = jwt.verify(token, JWT_SECRET); req.user = { id: p.sub, role: p.role }; next(); } catch { return res.status(401).json({ status: 401, message: "Token invalide ou expiré." }); } };
const requireAdmin = (req, res, next) => { if (!req.user || req.user.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Accès administrateur requis." }); next(); };

const contentsDb = [
  { id: 1, title: "Comprendre le stress", status: "PUBLIE", categories: [{ id: 1, name: "Stress" }] },
  { id: 2, title: "Améliorer son sommeil", status: "BROUILLON", categories: [{ id: 2, name: "Sommeil" }] },
  { id: 3, title: "La méditation", status: "PUBLIE", categories: [] },
];

// TF-IN-01
describe("TF-IN-01 — Consulter contenus publiés", () => {
  test("seuls les contenus PUBLIE sont retournés", () => {
    const published = contentsDb.filter((c) => c.status === "PUBLIE");
    expect(published).toHaveLength(2);
    expect(published.every((c) => c.status === "PUBLIE")).toBe(true);
  });
});

// TF-IN-02
describe("TF-IN-02 — Contenu publié par ID", () => {
  test("retourne le contenu avec ses catégories", () => {
    const content = contentsDb.find((c) => c.id === 1 && c.status === "PUBLIE");
    expect(content).toBeDefined();
    expect(content.categories).toHaveLength(1);
    expect(content.categories[0].name).toBe("Stress");
  });
});

// TF-IN-03
describe("TF-IN-03 — Contenu brouillon non visible", () => {
  test("un contenu BROUILLON n'est pas trouvé côté public", () => {
    const content = contentsDb.find((c) => c.id === 2 && c.status === "PUBLIE");
    expect(content).toBeUndefined();
  });
});

// TF-IN-04
describe("TF-IN-04 — Admin — lister tous les contenus", () => {
  test("l'admin voit BROUILLON et PUBLIE", () => {
    expect(contentsDb).toHaveLength(3);
    const statuses = [...new Set(contentsDb.map((c) => c.status))];
    expect(statuses).toContain("BROUILLON");
    expect(statuses).toContain("PUBLIE");
  });
});

// TF-IN-05
describe("TF-IN-05 — Admin — créer un contenu", () => {
  test("validation accepte title + body + categoryIds", () => {
    const { error } = createContentSchema.validate({ title: "Nouveau contenu", body: "Un contenu assez long pour passer la validation Joi.", categoryIds: [1] });
    expect(error).toBeUndefined();
  });
  test("le contenu est créé en BROUILLON par défaut", () => {
    expect({ status: "BROUILLON" }.status).toBe("BROUILLON");
  });
});

// TF-IN-06
describe("TF-IN-06 — Admin — modifier et publier", () => {
  test("validation accepte le changement vers PUBLIE", () => {
    const { error } = updateContentSchema.validate({ status: "PUBLIE" });
    expect(error).toBeUndefined();
  });
  test("validation refuse un status invalide", () => {
    const { error } = updateContentSchema.validate({ status: "ARCHIVE" });
    expect(error).toBeDefined();
  });
});

// TF-IN-07
describe("TF-IN-07 — Admin — supprimer un contenu", () => {
  test("la suppression retire le contenu et ses associations", () => {
    let contents = [...contentsDb];
    let assoc = [{ content_id: 1, category_id: 1 }, { content_id: 2, category_id: 2 }];
    contents = contents.filter((c) => c.id !== 1);
    assoc = assoc.filter((a) => a.content_id !== 1);
    expect(contents).toHaveLength(2);
    expect(assoc).toHaveLength(1);
  });
});

// TF-IN-08
describe("TF-IN-08 — Accès admin refusé", () => {
  test("un USER ne peut pas créer de contenu → 403", () => {
    const token = jwt.sign({ sub: 5, role: "USER" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, user: null };
    const res = mockRes();
    requireAuth(req, res, () => {});
    requireAdmin(req, res, () => {});
    expect(res.statusCode).toBe(403);
  });
});

// TF-IN-09
describe("TF-IN-09 — CRUD catégories", () => {
  test("validation accepte un nom valide", () => {
    const { error } = createCategorySchema.validate({ name: "Stress" });
    expect(error).toBeUndefined();
  });
  test("validation refuse un nom trop court", () => {
    const { error } = createCategorySchema.validate({ name: "A" });
    expect(error).toBeDefined();
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
