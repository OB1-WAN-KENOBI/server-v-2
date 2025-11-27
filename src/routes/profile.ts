import { Router, Request, Response } from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileStorage";
import type { ApiProfile } from "./types";
import { validateProfile } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";

const DATA_FILE = "src/data/profile.json";

const router = Router();

// GET /api/profile - получить профиль
router.get("/", (req: Request, res: Response) => {
  try {
    const profile = readJsonFile<ApiProfile>(DATA_FILE);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to read profile" });
  }
});

// PATCH /api/profile - обновить профиль
router.patch(
  "/",
  adminRateLimit,
  requireAuth,
  validateProfile,
  (req: Request, res: Response) => {
    try {
      const currentProfile = readJsonFile<ApiProfile>(DATA_FILE);
      const updatedProfile: ApiProfile = {
        ...currentProfile,
        ...req.body,
        // Сохраняем aboutTexts, если они не переданы
        aboutTexts: req.body.aboutTexts || currentProfile.aboutTexts,
      };
      writeJsonFile(DATA_FILE, updatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
