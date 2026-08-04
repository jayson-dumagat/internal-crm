import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createContact, deleteContact, listContacts, updateContact } from "./contact.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listContacts);
router.post("/", createContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
