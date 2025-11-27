import { Router } from "express";
import projects from "../data/projects.json";

const router = Router();

router.get("/", (_req, res) => {
  res.json(projects);
});

export default router;
