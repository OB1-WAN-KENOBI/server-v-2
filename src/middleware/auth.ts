import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Для обратной совместимости допускаем статичный токен через заголовок
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set. It is required for admin auth.");
  process.exit(1);
}

type JwtPayload = {
  sub: string;
  email: string;
};

export const issueAuthToken = (email: string): string => {
  return jwt.sign(
    {
      sub: email,
      email,
    } as JwtPayload,
    JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookieToken = req.cookies?.auth_token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : undefined;

  // Предпочитаем JWT из куки
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Сначала пробуем JWT
  try {
    jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    return next();
  } catch (err) {
    // Fallback на старый статичный токен, чтобы не ломать существующих клиентов
    if (ADMIN_TOKEN && token === ADMIN_TOKEN) {
      return next();
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};
