import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandling from "./middlewares/errorHandler.js";
import { initDb } from "./data/initDb.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

//Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/api", userRoutes);
app.use("/api", authRoutes);

//Error handling middleware
app.use(errorHandling);

//Testing pg connection
app.get("/", async (req, res) => {
  const result = await pool.query("select current_database()");
  res.send(`The database name is : ${result.rows[0].current_database}`);
});

// Server running after DB initialization
(async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Server not started because DB init failed:", err);
    process.exit(1);
  }
})();
