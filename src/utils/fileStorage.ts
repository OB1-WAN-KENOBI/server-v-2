import * as fs from "fs";
import * as path from "path";

const ALLOWED_DATA_DIR = path.join(process.cwd(), "src/data");

const validatePath = (filePath: string): string => {
  const fullPath = path.join(process.cwd(), filePath);
  const normalizedPath = path.normalize(fullPath);

  // Проверяем, что путь находится в разрешенной директории
  if (!normalizedPath.startsWith(ALLOWED_DATA_DIR)) {
    throw new Error("Invalid file path: path traversal detected");
  }

  return normalizedPath;
};

export const readJsonFile = <T>(filePath: string): T => {
  const fullPath = validatePath(filePath);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data) as T;
};

export const writeJsonFile = <T>(filePath: string, data: T): void => {
  const fullPath = validatePath(filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
};
