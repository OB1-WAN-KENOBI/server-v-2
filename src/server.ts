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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
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

// Body parser с лимитом размера (увеличено для base64 изображений)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
// Раздача статических файлов с CORS заголовками
app.use(
  "/uploads",
  (req, res, next) => {
    const origin = req.headers.origin;
    const corsOrigin = getCorsOrigin();

    // Устанавливаем CORS заголовки
    if (origin) {
      if (corsOrigin === "*" || corsOrigin === true) {
        res.header("Access-Control-Allow-Origin", "*");
      } else if (Array.isArray(corsOrigin)) {
        if (corsOrigin.includes(origin)) {
          res.header("Access-Control-Allow-Origin", origin);
          res.header("Access-Control-Allow-Credentials", "true");
        }
      } else if (typeof corsOrigin === "string" && corsOrigin === origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
      }
    } else {
      if (corsOrigin === "*" || corsOrigin === true) {
        res.header("Access-Control-Allow-Origin", "*");
      } else if (typeof corsOrigin === "string") {
        res.header("Access-Control-Allow-Origin", corsOrigin);
        res.header("Access-Control-Allow-Credentials", "true");
      }
    }

    // Дополнительные заголовки для статических файлов
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  },
  express.static(uploadsDir, {
    setHeaders: (res, path) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

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
