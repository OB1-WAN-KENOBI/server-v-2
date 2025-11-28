import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, issueAuthToken } from "../middleware/auth";
import { adminRateLimit, loginRateLimit } from "../middleware/rateLimit";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.warn(
    "WARNING: ADMIN_EMAIL or ADMIN_PASSWORD_HASH not set. Login will be unavailable until set."
  );
}

router.post(
  "/login",
  loginRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      res.status(500).json({ error: "Admin credentials not configured" });
      return;
    }

    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (email !== ADMIN_EMAIL) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = issueAuthToken(email);

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    res.json({ status: "ok" });
  }
);

router.post("/logout", requireAuth, (req: Request, res: Response): void => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ status: "ok" });
});

// Лёгкий healthcheck для проверки админского токена без побочных эффектов
router.get("/ping", adminRateLimit, requireAuth, (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
