/**
 * This file serves as the entry point for the CRM API application.
 * It initializes the Express server, connects to Redis and the database, and sets up necessary configurations.
 *
 * The server entry point is separated from the application logic in app.ts.
 * This ensures that the server can be started and stopped independently of the application logic, 
 * which is useful for testing and development.
 * 
*/

import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { app, sessionMiddleware } from "./app";
import { env } from "./config/env";
import {
  connectRedis,
  disconnectRedis,
} from "./config/redis";
import { AppDataSource } from "./database/data-source";
import { ensureObjectStorageBucket } from "./config/storage";
import { registerRealtimeServer } from "./services/realtime";
import { startNotificationSubscriber, stopNotificationSubscriber } from "./services/notifications";

async function bootstrap() {
  try {
    console.log("Connecting to Redis...");

    await connectRedis();

    console.log("Redis connected.");

    console.log("Initializing database...");

    await AppDataSource.initialize();

    console.log("Database connected.");

    await AppDataSource.runMigrations();

    console.log("Database migrations complete.");

    console.log("Initializing object storage...");
    await ensureObjectStorageBucket();
    console.log("Object storage ready.");

    const server = createServer(app);
    const io = new SocketIOServer(server, {
      cors: { origin: env.FRONTEND_ORIGIN, credentials: true },
      maxHttpBufferSize: 1e6,
      allowRequest: (request, callback) => {
        const origin = request.headers.origin;
        if (!origin || origin.replace(/\/+$/, "") === env.FRONTEND_ORIGIN.replace(/\/+$/, "")) {
          callback(null, true);
          return;
        }
        callback("Origin not trusted", false);
      },
    });
    io.engine.use(sessionMiddleware as never);
    io.use((socket, next) => {
      const sessionUser = (socket.request as typeof socket.request & { session?: { user?: { tenantId?: string } } }).session?.user;
      if (!sessionUser?.tenantId) {
        next(new Error("Authentication required"));
        return;
      }
      socket.data.sessionUser = sessionUser;
      next();
    });
    io.on("connection", (socket) => {
      const tenantId = socket.data.sessionUser?.tenantId as string;
      socket.join(`tenant:${tenantId}`);
    });
    registerRealtimeServer(io);
    await startNotificationSubscriber();
    server.listen(env.PORT, "0.0.0.0", () => {
      console.log(`CRM API running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down...");

      server.close(async () => {
        await io.close();
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }

        await stopNotificationSubscriber();
        await disconnectRedis();

        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start application");
    console.error(error);

    await disconnectRedis().catch((shutdownError) => {
      console.error("Failed to disconnect Redis", shutdownError);
    });

    process.exit(1);
  }
}

bootstrap();
