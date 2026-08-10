import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createContact, deleteContact, getContactAvatar, listContacts, updateContact, uploadContactAvatar } from "./contact.controller";
import { parseImageUpload } from "../../middleware/image-upload";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission("contacts.read"), listContacts);
router.post("/", requirePermission("contacts.create"), createContact);
router.get("/:id/avatar", requirePermission("contacts.read"), getContactAvatar);
router.post("/:id/avatar", requirePermission("contacts.update"), parseImageUpload, uploadContactAvatar);
router.patch("/:id", requirePermission("contacts.update"), updateContact);
router.delete("/:id", requirePermission("contacts.delete"), deleteContact);

export default router;
