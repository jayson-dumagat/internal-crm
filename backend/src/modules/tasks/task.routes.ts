import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth";
import { requirePermission } from "../../middleware/require-permission";
import { createTask, deleteTask, listTasks, updateTask, updateTaskStatus } from "./task.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("tasks.read"), listTasks);
router.post("/", requirePermission("tasks.create"), createTask);
router.patch("/:id/status", requirePermission("tasks.status.update"), updateTaskStatus);
router.patch("/:id", requirePermission("tasks.update"), updateTask);
router.delete("/:id", requirePermission("tasks.delete"), deleteTask);

export default router;
