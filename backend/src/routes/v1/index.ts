import { Router } from "express";
import authRouter from "../../modules/auth/auth.routes";
import companyRouter from "../../modules/companies/company.routes";
import contactRouter from "../../modules/contacts/contact.routes";
import userRouter from "../../modules/users/user.routes";
import leadRouter from "../../modules/leads/lead.routes";
import activityRouter from "../../modules/activities/activity.routes";
import noteRouter from "../../modules/notes/note.routes";
import taskRouter from "../../modules/tasks/task.routes";

export const v1Router = Router();

v1Router.use("/auth", authRouter)
v1Router.use("/companies", companyRouter);
v1Router.use("/contacts", contactRouter);
v1Router.use("/users", userRouter);
v1Router.use("/leads", leadRouter);
v1Router.use("/activities", activityRouter);
v1Router.use("/notes", noteRouter);
v1Router.use("/tasks", taskRouter);

