import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createCompany, deleteCompany, getCompanyLogo, listCompanies, updateCompany, uploadCompanyLogo } from "./company.controller";
import { parseImageUpload } from "../../middleware/image-upload";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission("companies.read"), listCompanies);
router.post("/", requirePermission("companies.create"), createCompany);
router.get("/:id/logo", requirePermission("companies.read"), getCompanyLogo);
router.post("/:id/logo", requirePermission("companies.update"), parseImageUpload, uploadCompanyLogo);
router.patch("/:id", requirePermission("companies.update"), updateCompany);
router.delete("/:id", requirePermission("companies.delete"), deleteCompany);

export default router;
