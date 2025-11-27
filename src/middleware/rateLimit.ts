import rateLimit from "express-rate-limit";

// Rate limiting для контактной формы
export const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 запросов с одного IP
  message: "Too many contact form submissions, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting для API в целом
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // максимум 100 запросов с одного IP
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Более строгий лимит для админских операций
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 50, // максимум 50 операций
  message: "Too many admin operations, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
