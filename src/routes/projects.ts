import { Router, Request, Response } from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileStorage";
import type { ApiProject } from "./types";
import { validateProject } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";

const DATA_FILE = "src/data/projects.json";

const router = Router();

// GET /api/projects - получить все проекты
router.get("/", (req: Request, res: Response) => {
  try {
    const projects = readJsonFile<ApiProject[]>(DATA_FILE);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to read projects" });
  }
});

// GET /api/projects/:id - получить проект по ID
router.get("/:id", (req: Request, res: Response) => {
  try {
    const projects = readJsonFile<ApiProject[]>(DATA_FILE);
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to read project" });
  }
});

// POST /api/projects - создать новый проект
router.post(
  "/",
  adminRateLimit,
  requireAuth,
  validateProject,
  (req: Request, res: Response) => {
    try {
      const projects = readJsonFile<ApiProject[]>(DATA_FILE);
      const newProject: ApiProject = {
        ...req.body,
        id: Date.now().toString(),
      };
      projects.push(newProject);
      writeJsonFile(DATA_FILE, projects);
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  }
);

// PATCH /api/projects/:id - обновить проект
router.patch(
  "/:id",
  adminRateLimit,
  requireAuth,
  validateProject,
  (req: Request, res: Response) => {
    try {
      const projects = readJsonFile<ApiProject[]>(DATA_FILE);
      const index = projects.findIndex((p) => p.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Project not found" });
      }

      const currentProject = projects[index];
      const updates = req.body;

      // Обрабатываем title: если пришла строка, сохраняем структуру { ru, en }
      if (updates.title !== undefined) {
        if (typeof updates.title === "string") {
          // Если текущий title - объект, обновляем оба языка
          if (
            typeof currentProject.title === "object" &&
            currentProject.title !== null
          ) {
            updates.title = {
              ru: updates.title,
              en: updates.title,
            };
          }
          // Если текущий title - строка, оставляем строку
        }
      }

      // Обрабатываем description: если пришла строка, сохраняем структуру { ru, en }
      if (updates.description !== undefined) {
        if (typeof updates.description === "string") {
          // Если текущий description - объект, обновляем оба языка
          if (
            typeof currentProject.description === "object" &&
            currentProject.description !== null
          ) {
            updates.description = {
              ru: updates.description,
              en: updates.description,
            };
          }
          // Если текущий description - строка, оставляем строку
        }
      }

      projects[index] = { ...currentProject, ...updates, id: req.params.id };
      writeJsonFile(DATA_FILE, projects);
      res.json(projects[index]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  }
);

// DELETE /api/projects/:id - удалить проект
router.delete(
  "/:id",
  adminRateLimit,
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const projects = readJsonFile<ApiProject[]>(DATA_FILE);
      const filtered = projects.filter((p) => p.id !== req.params.id);
      if (filtered.length === projects.length) {
        return res.status(404).json({ error: "Project not found" });
      }
      writeJsonFile(DATA_FILE, filtered);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
);

export default router;
