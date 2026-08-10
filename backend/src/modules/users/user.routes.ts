import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { getUserAvatar, listUsers } from "./user.controller";

const router = Router();

router.use(requireAuth);
router.get("/me/avatar", requirePermission("users.read"), getUserAvatar);
router.get("/:id/avatar", requirePermission("users.read"), getUserAvatar);
router.get("/", requirePermission("users.read"), listUsers);

export default router;
