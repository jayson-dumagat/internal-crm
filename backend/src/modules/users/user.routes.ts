import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { getUserAvatar, listUsers } from "./user.controller";

const router = Router();

router.use(requireAuth);
router.get("/me/avatar", getUserAvatar);
router.get("/:id/avatar", getUserAvatar);
router.get("/", listUsers);

export default router;
