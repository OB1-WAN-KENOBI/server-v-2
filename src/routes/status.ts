import { Router, Request, Response } from "express";
import { statusRepository } from "../db/statusRepository";
import { validateStatus } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import type { ApiStatus } from "./types";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const status = await statusRepository.get();
    if (!status) {
      const defaultStatus: ApiStatus = { status: "Available" };
      return res.json(defaultStatus);
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to read status" });
  }
});

router.patch(
  "/",
  adminRateLimit,
  requireAuth,
  validateStatus,
  async (req: Request, res: Response) => {
    try {
      const current = (await statusRepository.get()) || { status: "Available" };
      const updated: ApiStatus = {
        ...current,
        ...req.body,
      };
      const saved = await statusRepository.upsert(updated);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

export default router;
