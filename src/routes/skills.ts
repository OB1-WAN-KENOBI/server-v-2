import { Router, Request, Response } from "express";
import skills from "../data/skills.json";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(skills);
});

export default router;
