import { describe, test, expect } from "@jest/globals";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret-for-jest";

describe("Hachage de mot de passe (bcrypt)", () => {
  test("le hash est différent du mot de passe original", async () => {
    const password = "MonMotDePasse123";
    const hash = await bcrypt.hash(password, 12);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  test("bcrypt.compare retourne true avec le bon mot de passe", async () => {
    const password = "MonMotDePasse123";
    const hash = await bcrypt.hash(password, 12);

    const result = await bcrypt.compare(password, hash);
    expect(result).toBe(true);
  });

  test("bcrypt.compare retourne false avec un mauvais mot de passe", async () => {
    const hash = await bcrypt.hash("MonMotDePasse123", 12);

    const result = await bcrypt.compare("MauvaisMotDePasse", hash);
    expect(result).toBe(false);
  });
});

describe("Génération et vérification JWT", () => {
  test("le token contient les bonnes infos (sub et role)", () => {
    const user = { id: 42, role: "ADMIN" };
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const decoded = jwt.verify(token, JWT_SECRET);

    expect(decoded.sub).toBe(42);
    expect(decoded.role).toBe("ADMIN");
  });

  test("un token signé avec un mauvais secret est rejeté", () => {
    const token = jwt.sign({ sub: 1 }, JWT_SECRET);

    expect(() => {
      jwt.verify(token, "mauvais-secret");
    }).toThrow();
  });
});
