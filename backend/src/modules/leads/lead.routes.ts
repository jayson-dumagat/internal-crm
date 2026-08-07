import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createLead, deleteLead, listLeads, updateLead } from "./lead.controller";

const router = Router();
router.use(requireAuth);
router.get("/", listLeads);
router.post("/", createLead);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
