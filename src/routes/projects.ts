import { Router, Request, Response } from "express";
import projects from "../data/projects.json";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(projects);
});

export default router;
