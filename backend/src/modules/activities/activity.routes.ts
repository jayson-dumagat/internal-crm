import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createActivity, listActivities } from "./activity.controller";

const router = Router();
router.use(requireAuth);
router.get("/", listActivities);
router.post("/", createActivity);

export default router;
