import { app } from "./app";
import { env } from "./config/env";
import {
  connectRedis,
  disconnectRedis,
} from "./config/redis";
import { AppDataSource } from "./database/data-source";

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

    const server = app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`CRM API running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down...");

      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }

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
