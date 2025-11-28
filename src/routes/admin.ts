import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";

const router = Router();

// Лёгкий healthcheck для проверки админского токена без побочных эффектов
router.get("/ping", adminRateLimit, requireAuth, (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
