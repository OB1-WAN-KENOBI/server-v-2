import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Не показываем детали ошибки в продакшене
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(500).json({
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Обработка 404
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({ error: "Route not found" });
};
