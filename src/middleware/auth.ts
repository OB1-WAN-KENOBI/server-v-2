import { Request, Response, NextFunction } from "express";

// Простая базовая аутентификация для админки
// В продакшене используйте JWT или OAuth

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("ERROR: ADMIN_TOKEN environment variable is not set!");
  console.error("Please set ADMIN_TOKEN in your environment variables.");
  console.error("Server will exit for security reasons.");
  process.exit(1);
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Проверяем только для методов изменения данных (POST, PATCH, DELETE)
  if (["POST", "PATCH", "DELETE"].includes(req.method)) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    if (token !== ADMIN_TOKEN) {
      return res.status(403).json({ error: "Invalid token" });
    }
  }

  next();
};
