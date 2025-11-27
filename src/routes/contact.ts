import { Router, Request, Response } from "express";
import { validateContact } from "../middleware/validation";
import { contactRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post(
  "/",
  contactRateLimit,
  validateContact,
  (req: Request, res: Response) => {
    // Данные уже валидированы и санитизированы в middleware
    const { name, email, message } = req.body;

    // TODO: Отправить email или сохранить в базу данных
    // Пока просто возвращаем успех

    res.json({ status: "ok", message: "Message received" });
  }
);

export default router;
