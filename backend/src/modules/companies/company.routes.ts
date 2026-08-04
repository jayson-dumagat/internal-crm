import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createCompany, deleteCompany, listCompanies, updateCompany } from "./company.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listCompanies);
router.post("/", createCompany);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
