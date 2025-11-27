import { Router } from "express";
import skills from "../data/skills.json";

const router = Router();

router.get("/", (_req, res) => {
  res.json(skills);
});

export default router;
