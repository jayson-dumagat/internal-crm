import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createActivity, listActivities } from "./activity.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("activities.read"), listActivities);
router.post("/", requirePermission("activities.create"), createActivity);

export default router;
