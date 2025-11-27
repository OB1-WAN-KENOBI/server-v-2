import { Router, Request, Response } from "express";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  res.json({ status: "ok" });
});

export default router;
