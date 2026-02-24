import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

export async function initDb() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sqlPath = path.resolve(__dirname, "./data.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);

  console.log("Database schema ensured (data.sql executed)");
}
