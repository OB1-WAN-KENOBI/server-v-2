import { Router, Request, Response } from "express";
import type { ApiSkill } from "./types";
import { validateSkill } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import { skillsRepository } from "../db/skillsRepository";

const router = Router();

// GET /api/skills - получить все навыки
router.get("/", async (req: Request, res: Response) => {
  try {
    const skills = await skillsRepository.getAll();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to read skills" });
  }
});

// GET /api/skills/:id - получить навык по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const skill = await skillsRepository.getById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: "Failed to read skill" });
  }
});

// POST /api/skills - создать новый навык
router.post(
  "/",
  adminRateLimit,
  requireAuth,
  validateSkill,
  async (req: Request, res: Response) => {
    try {
      // Фронтенд отправляет объект { name, category, level }
      const skillName = req.body.name;
      if (!skillName || typeof skillName !== "string") {
        return res.status(400).json({ error: "Skill name is required" });
      }

      const existing = await skillsRepository.getAll();
      if (existing.some((s) => s.name === skillName)) {
        return res.status(400).json({ error: "Skill already exists" });
      }

      const newSkill: ApiSkill = {
        id: "",
        name: skillName,
        category: req.body.category || "other",
        level: req.body.level || "middle",
        isCore: Boolean(req.body.isCore),
      };

      const created = await skillsRepository.create(newSkill);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create skill" });
    }
  }
);

// PATCH /api/skills/:id - обновить навык
router.patch(
  "/:id",
  adminRateLimit,
  requireAuth,
  validateSkill,
  async (req: Request, res: Response) => {
    try {
      const updatedSkill = await skillsRepository.update(
        req.params.id,
        req.body as Partial<ApiSkill>
      );
      if (!updatedSkill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.json(updatedSkill);
    } catch (error) {
      res.status(500).json({ error: "Failed to update skill" });
    }
  }
);

// DELETE /api/skills/:id - удалить навык
router.delete(
  "/:id",
  adminRateLimit,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const deleted = await skillsRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete skill" });
    }
  }
);

export default router;
