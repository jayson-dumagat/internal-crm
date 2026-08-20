import { RedisStore } from "connect-redis";
import { createClient } from "redis";

import { env } from "./env";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.error("Redis client error", error);
});

export const sessionStore = new RedisStore({
  client: redisClient,
  prefix: env.REDIS_SESSION_PREFIX,
  ttl: env.SESSION_TTL_SECONDS,
});

let redisConnectionPromise: Promise<void> | null = null;

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) return;
  if (!redisConnectionPromise) {
    redisConnectionPromise = redisClient
      .connect()
      .then(() => undefined)
      .finally(() => {
        redisConnectionPromise = null;
      });
  }
  await redisConnectionPromise;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
