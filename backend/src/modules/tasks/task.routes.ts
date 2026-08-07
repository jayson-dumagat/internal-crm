import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { createTask, deleteTask, listTasks, updateTask, updateTaskStatus } from "./task.controller";

const router = Router();
router.use(requireAuth);
router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id/status", updateTaskStatus);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
