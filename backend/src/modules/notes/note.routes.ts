import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createNote, deleteNote, listNotes, updateNote } from "./note.controller";

const router = Router();
router.use(requireAuth);
router.get("/", listNotes);
router.post("/", createNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
