import { Router, Request, Response } from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileStorage";
import type { ApiSkill } from "./types";

const DATA_FILE = "src/data/skills.json";

const router = Router();

// GET /api/skills - получить все навыки
router.get("/", (req: Request, res: Response) => {
  try {
    // Сервер хранит массив строк, но фронтенд ожидает массив ApiSkill
    // Для совместимости возвращаем массив строк
    const skills = readJsonFile<string[]>(DATA_FILE);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to read skills" });
  }
});

// GET /api/skills/:id - получить навык по ID (преобразуем строку в объект)
router.get("/:id", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<string[]>(DATA_FILE);
    const index = parseInt(req.params.id) - 1;
    if (index < 0 || index >= skills.length) {
      return res.status(404).json({ error: "Skill not found" });
    }
    const skill: ApiSkill = {
      id: `skill-${index + 1}`,
      name: skills[index],
      category: "other",
      level: "middle",
    };
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: "Failed to read skill" });
  }
});

// POST /api/skills - создать новый навык
router.post("/", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<string[]>(DATA_FILE);
    // Фронтенд отправляет объект { name, category, level }
    const skillName = req.body.name || req.body;
    if (!skillName || typeof skillName !== "string") {
      return res.status(400).json({ error: "Skill name is required" });
    }
    // Проверяем, нет ли уже такого навыка
    if (skills.includes(skillName)) {
      return res.status(400).json({ error: "Skill already exists" });
    }
    skills.push(skillName);
    writeJsonFile(DATA_FILE, skills);
    const newSkill: ApiSkill = {
      id: `skill-${skills.length}`,
      name: skillName,
      category: req.body.category || "other",
      level: req.body.level || "middle",
    };
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// PATCH /api/skills/:id - обновить навык
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<string[]>(DATA_FILE);
    const index = parseInt(req.params.id.replace("skill-", "")) - 1;
    if (index < 0 || index >= skills.length) {
      return res.status(404).json({ error: "Skill not found" });
    }
    // Фронтенд отправляет { name, category, level }
    const skillName = req.body.name;
    if (!skillName || typeof skillName !== "string") {
      return res.status(400).json({ error: "Skill name is required" });
    }
    skills[index] = skillName;
    writeJsonFile(DATA_FILE, skills);
    const updatedSkill: ApiSkill = {
      id: req.params.id,
      name: skillName,
      category: req.body.category || "other",
      level: req.body.level || "middle",
    };
    res.json(updatedSkill);
  } catch (error) {
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// DELETE /api/skills/:id - удалить навык
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const skills = readJsonFile<string[]>(DATA_FILE);
    const index = parseInt(req.params.id.replace("skill-", "")) - 1;
    if (index < 0 || index >= skills.length) {
      return res.status(404).json({ error: "Skill not found" });
    }
    skills.splice(index, 1);
    writeJsonFile(DATA_FILE, skills);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

export default router;
