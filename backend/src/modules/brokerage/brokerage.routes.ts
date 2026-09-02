import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { parseDocumentUpload } from "../../middleware/document-upload";
import {
  createBrokerageAccount,
  createCommunication,
  createComplianceCase,
  createKycCase,
  createSuitabilityProfile,
  downloadDocument,
  getAccountSnapshot,
  listBrokerageAccounts,
  listCommunications,
  listComplianceCases,
  listDocuments,
  listKycCases,
  listSuitabilityProfiles,
  reviewKycCase,
  updateBrokerageAccount,
  updateComplianceCase,
  updateKycCase,
  updateSuitabilityProfile,
  uploadDocument,
} from "./brokerage.controller";

const router = Router();
router.use(requireAuth);

router.get("/accounts", requirePermission("brokerageAccounts.read"), listBrokerageAccounts);
router.post("/accounts", requirePermission("brokerageAccounts.create"), createBrokerageAccount);
router.patch("/accounts/:id", requirePermission("brokerageAccounts.update"), updateBrokerageAccount);
router.get("/accounts/:id/snapshot", requirePermission("brokerageAccounts.snapshot.read"), getAccountSnapshot);

router.get("/kyc", requirePermission("kyc.read"), listKycCases);
router.post("/kyc", requirePermission("kyc.create"), createKycCase);
router.patch("/kyc/:id", requirePermission("kyc.update"), updateKycCase);
router.post("/kyc/:id/reviews", requirePermission("kyc.review"), reviewKycCase);

router.get("/suitability", requirePermission("suitability.read"), listSuitabilityProfiles);
router.post("/suitability", requirePermission("suitability.create"), createSuitabilityProfile);
router.patch("/suitability/:id", requirePermission("suitability.update"), updateSuitabilityProfile);

router.get("/documents", requirePermission("documents.read"), listDocuments);
router.post("/documents", requirePermission("documents.create"), parseDocumentUpload, uploadDocument);
router.get("/documents/:id/download", requirePermission("documents.download"), downloadDocument);

router.get("/compliance", requirePermission("compliance.read"), listComplianceCases);
router.post("/compliance", requirePermission("compliance.create"), createComplianceCase);
router.patch("/compliance/:id", requirePermission("compliance.update"), updateComplianceCase);

router.get("/communications", requirePermission("communications.read"), listCommunications);
router.post("/communications", requirePermission("communications.create"), createCommunication);

export default router;
