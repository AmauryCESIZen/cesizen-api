import { describe, test, expect } from "@jest/globals";
import Joi from "joi";

const createContentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  body: Joi.string().min(10).required(),
  categoryIds: Joi.array().items(Joi.number().integer().positive()).default([]),
});

describe("Validation création de contenu", () => {
  test("accepte un contenu valide", () => {
    const input = {
      title: "Comprendre le stress",
      body: "Le stress est une réaction naturelle du corps face au danger...",
      categoryIds: [1, 2],
    };

    const { error, value } = createContentSchema.validate(input);

    expect(error).toBeUndefined();
    expect(value.title).toBe("Comprendre le stress");
    expect(value.categoryIds).toEqual([1, 2]);
  });

  test("refuse un contenu sans titre", () => {
    const input = {
      body: "Un contenu sans titre ne devrait pas passer la validation.",
    };

    const { error } = createContentSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("title");
  });

  test("refuse un titre de moins de 3 caractères", () => {
    const input = {
      title: "Ab",
      body: "Un contenu avec un titre trop court.",
    };

    const { error } = createContentSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("3");
  });

  test("refuse un body de moins de 10 caractères", () => {
    const input = {
      title: "Titre OK",
      body: "Court",
    };

    const { error } = createContentSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("body");
  });

  test("refuse des categoryIds non numériques", () => {
    const input = {
      title: "Titre valide",
      body: "Body assez long pour passer la validation.",
      categoryIds: ["abc", "def"],
    };

    const { error } = createContentSchema.validate(input);

    expect(error).toBeDefined();
  });

  test("met categoryIds à [] par défaut si absent", () => {
    const input = {
      title: "Titre valide",
      body: "Body assez long pour passer la validation OK.",
    };

    const { error, value } = createContentSchema.validate(input);

    expect(error).toBeUndefined();
    expect(value.categoryIds).toEqual([]);
  });
});
