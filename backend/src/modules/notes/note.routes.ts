import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createNote, deleteNote, listNotes, updateNote } from "./note.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("notes.read"), listNotes);
router.post("/", requirePermission("notes.create"), createNote);
router.patch("/:id", requirePermission("notes.update"), updateNote);
router.delete("/:id", requirePermission("notes.delete"), deleteNote);

export default router;
