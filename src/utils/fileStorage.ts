import * as fs from "fs";
import * as path from "path";

export const readJsonFile = <T>(filePath: string): T => {
  const fullPath = path.join(process.cwd(), filePath);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data) as T;
};

export const writeJsonFile = <T>(filePath: string, data: T): void => {
  const fullPath = path.join(process.cwd(), filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
};
