import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import prisma from "./config/prisma.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import presetRoutes from "./routes/presetRoutes.js";
import errorHandling from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

// L'application tourne derrière le reverse proxy Traefik 
app.set("trust proxy", 1);

// ─── Sécurité : en-têtes HTTP ─────────────────────────────────
// helmet positionne une série d'en-têtes de sécurité 
app.use(helmet());

// ─── Sécurité : restriction des origines (CORS) ───────────────
// Seules les origines explicitement autorisées peuvent appeler l'API.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── Sécurité : limitation du débit ────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes / IP / fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
});
app.use(globalLimiter);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", contentRoutes);
app.use("/api", presetRoutes);

// ─── Error handling middleware ────────────────────────────────
app.use(errorHandling);

// ─── Health check ─────────────────────────────────────────────
app.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw<
      Array<{ db: string; user: string; host: string | null; port: number | null }>
    >`
      SELECT
        current_database() AS db,
        current_user AS user,
        inet_server_addr()::text AS host,
        inet_server_port() AS port
    `;
    res.json(result[0]);
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ─── Server start ─────────────────────────────────────────────
(async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL via Prisma");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
