import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createContact, deleteContact, getContactAvatar, listContacts, updateContact, uploadContactAvatar } from "./contact.controller";
import { parseImageUpload } from "../../middleware/image-upload";

const router = Router();

router.use(requireAuth);
router.get("/", listContacts);
router.post("/", createContact);
router.get("/:id/avatar", getContactAvatar);
router.post("/:id/avatar", parseImageUpload, uploadContactAvatar);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
