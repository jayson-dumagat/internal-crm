import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createCompany, deleteCompany, getCompanyLogo, listCompanies, updateCompany, uploadCompanyLogo } from "./company.controller";
import { parseImageUpload } from "../../middleware/image-upload";

const router = Router();

router.use(requireAuth);
router.get("/", listCompanies);
router.post("/", createCompany);
router.get("/:id/logo", getCompanyLogo);
router.post("/:id/logo", parseImageUpload, uploadCompanyLogo);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
