import { Router, Request, Response } from "express";
import type { ApiProfile } from "./types";
import { validateProfile } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import { profileRepository } from "../db/profileRepository";

const router = Router();

// GET /api/profile - получить профиль
router.get("/", async (req: Request, res: Response) => {
  try {
    const profile = await profileRepository.get();
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
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
  async (req: Request, res: Response) => {
    try {
      const currentProfile = (await profileRepository.get()) || {
        name: "",
        role: { ru: "", en: "" },
        description: { ru: "", en: "" },
        aboutTexts: { ru: [], en: [] },
      };

      const updatedProfile: ApiProfile = {
        ...currentProfile,
        ...req.body,
        // Сохраняем aboutTexts, если они не переданы
        aboutTexts: req.body.aboutTexts || currentProfile.aboutTexts,
      };
      await profileRepository.upsert(updatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
