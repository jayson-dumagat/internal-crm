import { Router } from "express";
import { authRateLimiter } from "../../middleware/security";

import {
  getCurrentSession,
  getEntraLoginUrl,
  getMicrosoftLogoutUrl,
  handleEntraCallback,
  logout,
} from "./auth.controller";

const router = Router();

router.get("/login-url", authRateLimiter, getEntraLoginUrl);

router.get("/callback", authRateLimiter, handleEntraCallback);

router.get("/session", getCurrentSession);

router.get("/logout-url", getMicrosoftLogoutUrl);

router.post("/logout", logout);

export default router;
