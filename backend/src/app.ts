/**
 * This file seperates from the index.ts.
 * The benefit of this is that the server can be started and stopped independently of the application
 * logic, which is useful for testing and development.
 */

import "reflect-metadata";

import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import { createLogger } from "./shared/utils/logger";

import { env } from "./config/env";
import { sessionStore } from "./config/redis";
import { sessionCookieOptions } from "./config/session";
import { handleEntraCallback } from "./modules/auth/auth.controller";
import { apiRouter } from "./routes";
import { morganMiddleware } from "./middleware/http-logger";
import {
  apiRateLimiter,
  authRateLimiter,
  preventApiCaching,
  requireTrustedOrigin,
} from "./middleware/security";

const appLogger = createLogger("app");

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

app.use(morganMiddleware);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
export const sessionMiddleware = session({
    name: "ccrms.sid",
    secret: env.JWT_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      ...sessionCookieOptions,
    },
});

app.use(sessionMiddleware);

app.get("/", authRateLimiter, handleEntraCallback);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CDEX API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  "/api",
  preventApiCaching,
  apiRateLimiter,
  requireTrustedOrigin,
  apiRouter,
);

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
    appLogger.error("Unhandled application error", {
      error: err,
      method: _req.method,
      url: _req.originalUrl,
    });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  },
);
