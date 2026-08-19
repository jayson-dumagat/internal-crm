import { redisClient } from "../config/redis";
import { emitNotification } from "./realtime";

const channel = "crm:notifications";
let subscriber: typeof redisClient | null = null;

export async function startNotificationSubscriber(): Promise<void> {
  if (subscriber) return;
  subscriber = redisClient.duplicate();
  subscriber.on("error", (error) =>
    console.error("Redis notification subscriber error", error),
  );
  await subscriber.connect();
  await subscriber.subscribe(channel, (message) => {
    try {
      emitNotification(JSON.parse(message) as Record<string, unknown>);
    } catch {
      console.error("Ignoring malformed Redis notification");
    }
  });
}

export async function publishNotification(
  notification: Record<string, unknown>,
): Promise<void> {
  if (!redisClient.isOpen) return;
  await redisClient.publish(channel, JSON.stringify(notification));
}

export async function stopNotificationSubscriber(): Promise<void> {
  if (!subscriber) return;
  await subscriber.quit();
  subscriber = null;
}
