import { Router, Request, Response } from "express";
import type { ApiProject } from "./types";
import { validateProject } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { adminRateLimit } from "../middleware/rateLimit";
import { projectsRepository } from "../db/projectsRepository";

const router = Router();

// GET /api/projects - получить все проекты
router.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await projectsRepository.getAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to read projects" });
  }
});

// GET /api/projects/:id - получить проект по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await projectsRepository.getById(req.params.id);
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
  async (req: Request, res: Response) => {
    try {
      const newProject = await projectsRepository.create(req.body);
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
  async (req: Request, res: Response) => {
    try {
      const currentProject = await projectsRepository.getById(req.params.id);
      if (!currentProject) {
        return res.status(404).json({ error: "Project not found" });
      }
      const updates = req.body;

      // Обрабатываем title: если пришла строка, сохраняем структуру { ru, en }
      if (updates.title !== undefined) {
        if (typeof updates.title === "string") {
          // Если текущий title - объект, обновляем оба языка
          if (typeof currentProject.title === "object" && currentProject.title !== null) {
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

      const updated = await projectsRepository.update(
        req.params.id,
        updates as Partial<ApiProject>
      );
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
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
  async (req: Request, res: Response) => {
    try {
      const deleted = await projectsRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
);

export default router;
