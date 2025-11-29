import { Request, Response, NextFunction } from "express";
import type { ApiProject, ApiSkill, ApiProfile, ApiStatus } from "../routes/types";

// Валидация проекта
export const validateProject = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const project = req.body;

  // Проверка обязательных полей
  if (!project.title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!project.description) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (!Array.isArray(project.techStack)) {
    return res.status(400).json({ error: "Tech stack must be an array" });
  }

  if (
    typeof project.year !== "number" ||
    project.year < 1900 ||
    project.year > 2100
  ) {
    return res
      .status(400)
      .json({ error: "Year must be a valid number between 1900 and 2100" });
  }

  if (!project.status) {
    return res.status(400).json({ error: "Status is required" });
  }

  // Sanitization: обрезаем пробелы и ограничиваем длину
  if (typeof project.title === "string") {
    project.title = project.title.trim().slice(0, 200);
  }

  if (typeof project.description === "string") {
    project.description = project.description.trim().slice(0, 2000);
  }

  if (Array.isArray(project.techStack)) {
    project.techStack = project.techStack
      .map((tech: string) => String(tech).trim().slice(0, 50))
      .filter((tech: string) => tech.length > 0)
      .slice(0, 20); // Максимум 20 технологий
  }

  next();
};

// Валидация навыка
export const validateSkill = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const skill = req.body;

  if (skill.name !== undefined) {
    if (typeof skill.name !== "string" || skill.name.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Skill name is required and must be a string" });
    }
    // Sanitization
    skill.name = skill.name.trim().slice(0, 100);
  } else if (req.method === "POST") {
    return res
      .status(400)
      .json({ error: "Skill name is required and must be a string" });
  }

  if (
    skill.category &&
    !["frontend", "backend", "tooling", "other"].includes(skill.category)
  ) {
    return res.status(400).json({ error: "Invalid skill category" });
  }

  if (
    skill.level &&
    !["beginner", "middle", "advanced"].includes(skill.level)
  ) {
    return res.status(400).json({ error: "Invalid skill level" });
  }

  if (skill.isCore !== undefined && typeof skill.isCore !== "boolean") {
    return res.status(400).json({ error: "isCore must be a boolean" });
  }

  next();
};

// Валидация профиля
export const validateProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const profile = req.body;

  if (profile.name !== undefined) {
    if (typeof profile.name !== "string" || profile.name.trim().length === 0) {
      return res.status(400).json({ error: "Name must be a non-empty string" });
    }
    profile.name = profile.name.trim().slice(0, 100);
  }

  if (profile.role !== undefined) {
    if (typeof profile.role === "object" && profile.role !== null) {
      if (
        typeof profile.role.ru !== "string" ||
        typeof profile.role.en !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Role must have ru and en strings" });
      }
      profile.role.ru = profile.role.ru.trim().slice(0, 100);
      profile.role.en = profile.role.en.trim().slice(0, 100);
    }
  }

  if (profile.description !== undefined) {
    if (
      typeof profile.description === "object" &&
      profile.description !== null
    ) {
      if (
        typeof profile.description.ru !== "string" ||
        typeof profile.description.en !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Description must have ru and en strings" });
      }
      profile.description.ru = profile.description.ru.trim().slice(0, 500);
      profile.description.en = profile.description.en.trim().slice(0, 500);
    }
  }

  if (profile.photoUrl !== undefined) {
    if (typeof profile.photoUrl !== "string") {
      return res.status(400).json({ error: "photoUrl must be a string" });
    }
    profile.photoUrl = profile.photoUrl.trim().slice(0, 2048);
  }

  if (profile.photoData !== undefined) {
    if (typeof profile.photoData !== "string") {
      return res.status(400).json({ error: "photoData must be a base64 string" });
    }
    // Простая проверка объема: ограничим до ~10MB строки
    if (profile.photoData.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "photoData is too large" });
    }
  }

  // Sanitization социальных сетей
  if (profile.socials) {
    if (profile.socials.github) {
      profile.socials.github = String(profile.socials.github)
        .trim()
        .slice(0, 200);
    }
    if (profile.socials.linkedin) {
      profile.socials.linkedin = String(profile.socials.linkedin)
        .trim()
        .slice(0, 200);
    }
    if (profile.socials.telegram) {
      profile.socials.telegram = String(profile.socials.telegram)
        .trim()
        .slice(0, 100);
    }
  }

  next();
};

// Валидация контактной формы
export const validateContact = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, message } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  // Простая валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return res
      .status(400)
      .json({ error: "Message must be at least 10 characters" });
  }

  // Sanitization
  req.body.name = name.trim().slice(0, 100);
  req.body.email = email.trim().slice(0, 200);
  req.body.message = message.trim().slice(0, 2000);

  next();
};

export const validateStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = req.body as Partial<ApiStatus>;

  const allowedStatuses: ApiStatus["status"][] = [
    "Available",
    "Busy",
    "Not taking projects",
  ];

  if (!status.status || !allowedStatuses.includes(status.status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  if (status.message !== undefined) {
    if (typeof status.message === "object" && status.message !== null) {
      const { ru, en } = status.message;
      if ((ru && typeof ru !== "string") || (en && typeof en !== "string")) {
        return res
          .status(400)
          .json({ error: "Message must be strings for ru/en" });
      }
    } else {
      return res.status(400).json({ error: "Message must be an object" });
    }
  }

  next();
};
