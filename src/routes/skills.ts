import { Router, Request, Response } from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileStorage";
import type { ApiSkill } from "./types";
import { validateSkill } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";

const DATA_FILE = "src/data/skills.json";

const router = Router();

// GET /api/skills - получить все навыки
router.get("/", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<ApiSkill[]>(DATA_FILE);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to read skills" });
  }
});

// GET /api/skills/:id - получить навык по ID
router.get("/:id", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<ApiSkill[]>(DATA_FILE);
    const skill = skills.find((s) => s.id === req.params.id);
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
  (req: Request, res: Response) => {
    try {
      const skills = readJsonFile<ApiSkill[]>(DATA_FILE);
      // Фронтенд отправляет объект { name, category, level }
      const skillName = req.body.name;
      if (!skillName || typeof skillName !== "string") {
        return res.status(400).json({ error: "Skill name is required" });
      }
      // Проверяем, нет ли уже такого навыка
      if (skills.some((s) => s.name === skillName)) {
        return res.status(400).json({ error: "Skill already exists" });
      }
      const newSkill: ApiSkill = {
        id: `skill-${Date.now()}`,
        name: skillName,
        category: req.body.category || "other",
        level: req.body.level || "middle",
      };
      skills.push(newSkill);
      writeJsonFile(DATA_FILE, skills);
      res.status(201).json(newSkill);
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
  (req: Request, res: Response) => {
    try {
      const skills = readJsonFile<ApiSkill[]>(DATA_FILE);
      const index = skills.findIndex((s) => s.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Skill not found" });
      }
      // Обновляем навык
      const updatedSkill: ApiSkill = {
        ...skills[index],
        ...req.body,
        id: req.params.id, // ID не изменяется
      };
      skills[index] = updatedSkill;
      writeJsonFile(DATA_FILE, skills);
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
  (req: Request, res: Response) => {
    try {
      const skills = readJsonFile<ApiSkill[]>(DATA_FILE);
      const filtered = skills.filter((s) => s.id !== req.params.id);
      if (filtered.length === skills.length) {
        return res.status(404).json({ error: "Skill not found" });
      }
      writeJsonFile(DATA_FILE, filtered);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete skill" });
    }
  }
);

export default router;
