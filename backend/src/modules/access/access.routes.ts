import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import {
  getAccessCatalog,
  listAccessRoles,
  listAccessPolicies,
  listAccessResources,
  updateAccessRolePermissions,
  updateAccessPolicy,
} from "./access.controller";

const router = Router();

router.use(requireAuth, requirePermission("access.manage"));
router.get("/catalog", getAccessCatalog);
router.get("/roles", listAccessRoles);
router.patch("/roles/:id", updateAccessRolePermissions);
router.get("/resources", listAccessResources);
router.get("/users", listAccessPolicies);
router.patch("/users/:entraObjectId", updateAccessPolicy);

export default router;
