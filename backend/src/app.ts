import "reflect-metadata";

import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { handleEntraCallback } from "./modules/auth/auth.controller";
import { apiRouter } from "./routes";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "ccrms.sid",
    secret: env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.AZURE_REDIRECT_URI.startsWith("https://"),
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

// Microsoft Entra redirects to the backend origin registered for this app.
app.get("/", handleEntraCallback);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CDEX API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  },
);
