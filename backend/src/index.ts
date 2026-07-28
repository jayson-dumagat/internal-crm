import { app } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./database/data-source";

async function bootstrap() {
  try {
    console.log("Initializing database...");

    await AppDataSource.initialize();

    console.log("Database connected.");

    const server = app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`CRM API running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down...");

      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }

        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start application");
    console.error(error);

    process.exit(1);
  }
}

bootstrap();