import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

async function seedDb() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sqlPath = path.resolve(__dirname, "./seed.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  await pool.query(sql);
  console.log("✅ Seed done (seed.sql executed)");
  process.exit(0);
}

seedDb().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
