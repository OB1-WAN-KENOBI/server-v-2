import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import projectsRouter from "./routes/projects";
import skillsRouter from "./routes/skills";
import contactRouter from "./routes/contact";
import profileRouter from "./routes/profile";
import adminRouter from "./routes/admin";
import statusRouter from "./routes/status";
import { apiRateLimit } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Trust first proxy (Render ingress) to keep correct IP for rate limiting
app.set("trust proxy", 1);

// Security headers
app.use(helmet());
app.use(cookieParser());

// CORS настройки
// Поддерживаем несколько доменов через запятую или один домен
// Например: "http://localhost:5173,https://your-domain.com"
const normalizeOrigin = (origin: string): string => {
  const trimmed = origin.trim();
  // убираем завершающий слэш, чтобы не было рассинхрона с Origin заголовком
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const getCorsOrigin = (): string | string[] | boolean => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "WARNING: FRONTEND_URL is not set in production. CORS allows all origins."
      );
    }
    return "*";
  }

  // Если несколько доменов через запятую
  if (frontendUrl.includes(",")) {
    return frontendUrl.split(",").map((url) => normalizeOrigin(url));
  }

  return normalizeOrigin(frontendUrl);
};

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);

// Body parser с лимитом размера
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting для всего API
app.use("/api", apiRateLimit);

// Раздача загруженных файлов
const uploadsDir = path.resolve(process.cwd(), "uploads");
const profileUploadsDir = path.join(uploadsDir, "profile");
const projectsUploadsDir = path.join(uploadsDir, "projects");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}
if (!fs.existsSync(projectsUploadsDir)) {
  fs.mkdirSync(projectsUploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Роуты
app.use("/api/projects", projectsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/status", statusRouter);

// Обработка ошибок
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
