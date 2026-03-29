import { describe, test, expect } from "@jest/globals";
import Joi from "joi";

const createPresetSchema = Joi.object({
  code: Joi.string().max(10).required(),
  inspiration_s: Joi.number().integer().min(1).required(),
  apnee_s: Joi.number().integer().min(0).required(),
  expiration_s: Joi.number().integer().min(1).required(),
  actif: Joi.boolean().default(true),
});

describe("Validation création de preset", () => {
  test("accepte un preset 7-4-8 valide", () => {
    const input = {
      code: "748",
      inspiration_s: 7,
      apnee_s: 4,
      expiration_s: 8,
    };
    const { error, value } = createPresetSchema.validate(input);
    expect(error).toBeUndefined();
    expect(value.actif).toBe(true);
  });

  test("refuse une inspiration négative", () => {
    const input = {
      code: "bad",
      inspiration_s: -1,
      apnee_s: 0,
      expiration_s: 5,
    };
    const { error } = createPresetSchema.validate(input);
    expect(error).toBeDefined();
  });

  test("refuse un preset sans code", () => {
    const input = { inspiration_s: 5, apnee_s: 0, expiration_s: 5 };
    const { error } = createPresetSchema.validate(input);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("code");
  });

  test("accepte une apnée à 0 (pas de pause)", () => {
    const input = { code: "55", inspiration_s: 5, apnee_s: 0, expiration_s: 5 };
    const { error } = createPresetSchema.validate(input);
    expect(error).toBeUndefined();
  });
});
