import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import { getAccessCatalog, listAccessPolicies, listAccessResources, updateAccessPolicy } from "./access.controller.js";

const router = Router();

router.use(requireAuth, requirePermission("access.manage"));
router.get("/catalog", getAccessCatalog);
router.get("/resources", listAccessResources);
router.get("/users", listAccessPolicies);
router.patch("/users/:entraObjectId", updateAccessPolicy);

export default router;
