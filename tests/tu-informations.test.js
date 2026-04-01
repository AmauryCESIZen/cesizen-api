import { describe, test, expect } from "@jest/globals";
import Joi from "joi";

const createContentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  body: Joi.string().min(10).required(),
  categoryIds: Joi.array().items(Joi.number().integer().positive()).default([]),
});

// TU-IN-01
describe("TU-IN-01 — Filtrage contenus publiés", () => {
  const filterPublished = (contents) => contents.filter((c) => c.status === "PUBLIE");

  test("ne retourne que les contenus PUBLIE", () => {
    const contents = [
      { id: 1, title: "Article 1", status: "PUBLIE" },
      { id: 2, title: "Article 2", status: "BROUILLON" },
      { id: 3, title: "Article 3", status: "PUBLIE" },
    ];
    const result = filterPublished(contents);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.status === "PUBLIE")).toBe(true);
  });

  test("retourne un tableau vide si aucun contenu publié", () => {
    const contents = [{ id: 1, title: "Brouillon", status: "BROUILLON" }];
    expect(filterPublished(contents)).toHaveLength(0);
  });
});

// TU-IN-02
describe("TU-IN-02 — Validation création contenu (Joi)", () => {
  test("accepte un contenu valide avec catégories", () => {
    const { error, value } = createContentSchema.validate({
      title: "Comprendre le stress",
      body: "Le stress est une réaction naturelle du corps face au danger...",
      categoryIds: [1, 2],
    });
    expect(error).toBeUndefined();
    expect(value.title).toBe("Comprendre le stress");
    expect(value.categoryIds).toEqual([1, 2]);
  });

  test("refuse un contenu sans titre", () => {
    const { error } = createContentSchema.validate({
      body: "Un contenu sans titre ne devrait pas passer.",
    });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("title");
  });

  test("refuse un titre de moins de 3 caractères", () => {
    const { error } = createContentSchema.validate({
      title: "Ab",
      body: "Un contenu avec un titre trop court.",
    });
    expect(error).toBeDefined();
  });

  test("refuse un body de moins de 10 caractères", () => {
    const { error } = createContentSchema.validate({ title: "Titre OK", body: "Court" });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("body");
  });

  test("refuse des categoryIds non numériques", () => {
    const { error } = createContentSchema.validate({
      title: "Titre valide",
      body: "Body assez long pour passer la validation.",
      categoryIds: ["abc", "def"],
    });
    expect(error).toBeDefined();
  });

  test("met categoryIds à [] par défaut si absent", () => {
    const { error, value } = createContentSchema.validate({
      title: "Titre valide",
      body: "Body assez long pour passer la validation correctement.",
    });
    expect(error).toBeUndefined();
    expect(value.categoryIds).toEqual([]);
  });
});

// TU-IN-03
describe("TU-IN-03 — Association contenu-catégories", () => {
  function simulateSetCategories(contentId, categoryIds) {
    const deleted = `DELETE FROM contents_categories WHERE content_id = ${contentId}`;
    const inserts = categoryIds.map(
      (catId) => `INSERT INTO contents_categories (content_id, category_id) VALUES (${contentId}, ${catId})`,
    );
    return { deleted, inserts, count: inserts.length };
  }

  test("génère les bonnes requêtes pour 2 catégories", () => {
    const result = simulateSetCategories(1, [3, 5]);
    expect(result.count).toBe(2);
    expect(result.inserts[0]).toContain("VALUES (1, 3)");
    expect(result.inserts[1]).toContain("VALUES (1, 5)");
  });

  test("gère un tableau de catégories vide", () => {
    const result = simulateSetCategories(1, []);
    expect(result.count).toBe(0);
    expect(result.deleted).toContain("DELETE");
  });
});
