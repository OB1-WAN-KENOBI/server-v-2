import { Request, Response, NextFunction } from "express";

// Простая базовая аутентификация для админки
// В продакшене используйте JWT или OAuth

const ADMIN_TOKEN =
  process.env.ADMIN_TOKEN || "admin-secret-token-change-in-production";

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
