import rateLimit from "express-rate-limit";

// Limiteur strict pour la connexion 
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 tentatives par IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error:
      "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
  },
});
