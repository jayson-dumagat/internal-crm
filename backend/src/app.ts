import "reflect-metadata";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { apiRouter } from "./routes";

export const app = express();

app.disable("x-powered-by");

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