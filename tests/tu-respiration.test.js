import { describe, test, expect } from "@jest/globals";
import Joi from "joi";

const createPresetSchema = Joi.object({
  code: Joi.string().min(2).max(10).required(),
  inspiration_s: Joi.number().integer().positive().required(),
  apnee_s: Joi.number().integer().min(0).required(),
  expiration_s: Joi.number().integer().positive().required(),
  actif: Joi.boolean().default(true),
});

// TU-ER-01
describe("TU-ER-01 — Calcul durée d'un cycle", () => {
  const cycleDuration = (p) => p.inspiration_s + p.apnee_s + p.expiration_s;

  test("le preset 7-4-8 dure 19 secondes", () => {
    expect(cycleDuration({ inspiration_s: 7, apnee_s: 4, expiration_s: 8 })).toBe(19);
  });
  test("le preset 5-5 (sans apnée) dure 10 secondes", () => {
    expect(cycleDuration({ inspiration_s: 5, apnee_s: 0, expiration_s: 5 })).toBe(10);
  });
  test("le preset 4-6 (sans apnée) dure 10 secondes", () => {
    expect(cycleDuration({ inspiration_s: 4, apnee_s: 0, expiration_s: 6 })).toBe(10);
  });
});

// TU-ER-02
describe("TU-ER-02 — Validation preset (Joi)", () => {
  test("accepte un preset valide", () => {
    const { error, value } = createPresetSchema.validate({ code: "748", inspiration_s: 7, apnee_s: 4, expiration_s: 8 });
    expect(error).toBeUndefined();
    expect(value.actif).toBe(true);
  });
  test("refuse une inspiration négative", () => {
    const { error } = createPresetSchema.validate({ code: "bad", inspiration_s: -1, apnee_s: 0, expiration_s: 5 });
    expect(error).toBeDefined();
  });
  test("refuse un preset sans code", () => {
    const { error } = createPresetSchema.validate({ inspiration_s: 5, apnee_s: 0, expiration_s: 5 });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("code");
  });
  test("refuse un code trop court (1 caractère)", () => {
    const { error } = createPresetSchema.validate({ code: "X", inspiration_s: 4, apnee_s: 0, expiration_s: 6 });
    expect(error).toBeDefined();
  });
  test("accepte une apnée à 0", () => {
    const { error } = createPresetSchema.validate({ code: "55", inspiration_s: 5, apnee_s: 0, expiration_s: 5 });
    expect(error).toBeUndefined();
  });
});

// TU-ER-03
describe("TU-ER-03 — Filtrage presets actifs", () => {
  const filterActive = (presets) => presets.filter((p) => p.actif === true);

  test("ne retourne que les presets actifs", () => {
    const presets = [
      { id: 1, code: "748", actif: true },
      { id: 2, code: "55", actif: false },
      { id: 3, code: "46", actif: true },
    ];
    const result = filterActive(presets);
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.actif)).toBe(true);
  });
  test("retourne un tableau vide si aucun preset actif", () => {
    expect(filterActive([{ id: 1, code: "old", actif: false }])).toHaveLength(0);
  });
});
