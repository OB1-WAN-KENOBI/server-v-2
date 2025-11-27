import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Не логируем полный stack в продакшене
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } else {
    // В продакшене логируем только общую информацию
    console.error("Error occurred:", err.constructor.name);
    // Не логируем message и stack, чтобы не раскрыть чувствительную информацию
  }

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
