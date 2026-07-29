import { Router } from "express";

import {
  getCurrentSession,
  getEntraLoginUrl,
  handleEntraCallback,
  logout,
} from "./auth.controller";

const router = Router();

router.get("/login-url", getEntraLoginUrl);

router.get("/callback", handleEntraCallback);

router.get("/session", getCurrentSession);

router.post("/logout", logout);

export default router;