import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createLead, deleteLead, getLeadAvatar, listLeads, updateLead, uploadLeadAvatar } from "./lead.controller";
import { parseImageUpload } from "../../middleware/image-upload";

const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("leads.read"), listLeads);
router.post("/", requirePermission("leads.create"), createLead);
router.get("/:id/avatar", requirePermission("leads.read"), getLeadAvatar);
router.post("/:id/avatar", requirePermission("leads.update"), parseImageUpload, uploadLeadAvatar);
router.patch("/:id", requirePermission("leads.update"), updateLead);
router.delete("/:id", requirePermission("leads.delete"), deleteLead);

export default router;
