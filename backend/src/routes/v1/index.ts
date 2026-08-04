import { Router } from "express";
import authRouter from "../../modules/auth/auth.routes";
import companyRouter from "../../modules/companies/company.routes";
import contactRouter from "../../modules/contacts/contact.routes";
import userRouter from "../../modules/users/user.routes";

export const v1Router = Router();

v1Router.use("/auth", authRouter)
v1Router.use("/companies", companyRouter);
v1Router.use("/contacts", contactRouter);
v1Router.use("/users", userRouter);

