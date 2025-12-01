import { Router, Request, Response } from "express";
import type { ApiProfile } from "./types";
import { validateProfile } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import { profileRepository } from "../db/profileRepository";

const router = Router();

const validateAndNormalizeDataUrl = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  if (!match) {
    throw new Error("Invalid image format");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image is too large (max 5MB)");
  }
  // Возвращаем data URL как есть - будем хранить в БД
  return dataUrl;
};

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
    const body = req.body as Partial<ApiProfile> & { photoData?: string };
    const { photoData, ...safeBody } = body;
    try {
      const currentProfile = (await profileRepository.get()) || {
        name: "",
        role: { ru: "", en: "" },
        description: { ru: "", en: "" },
        photoUrl: "",
        aboutTexts: { ru: [], en: [] },
      };

      let photoUrl = currentProfile.photoUrl || "";

      try {
        if (photoData && typeof photoData === "string") {
          photoUrl = validateAndNormalizeDataUrl(photoData);
        } else if (safeBody.photoUrl !== undefined) {
          photoUrl =
            typeof safeBody.photoUrl === "string"
              ? safeBody.photoUrl.trim()
              : currentProfile.photoUrl || "";
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to upload photo";
        return res.status(400).json({ error: message });
      }

      const updatedProfile: ApiProfile = {
        ...currentProfile,
        ...safeBody,
        // Сохраняем aboutTexts, если они не переданы
        aboutTexts: safeBody.aboutTexts || currentProfile.aboutTexts,
        photoUrl,
      };
      await profileRepository.upsert(updatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
