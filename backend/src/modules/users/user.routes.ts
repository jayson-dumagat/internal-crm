import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { listUsers } from "./user.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listUsers);

export default router;
