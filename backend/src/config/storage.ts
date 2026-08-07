import { Client } from "minio";

import { env } from "./env";

const objectStorage = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

let bucketReady: Promise<void> | undefined;

export function ensureObjectStorageBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const exists = await objectStorage.bucketExists(env.MINIO_BUCKET);
    if (!exists) {
      await objectStorage.makeBucket(env.MINIO_BUCKET);
    }
  })();

  return bucketReady;
}

export async function putObject(
  objectKey: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  await ensureObjectStorageBucket();
  await objectStorage.putObject(env.MINIO_BUCKET, objectKey, data, data.length, {
    "Content-Type": contentType,
  });
}

export async function getObject(objectKey: string) {
  await ensureObjectStorageBucket();
  return objectStorage.getObject(env.MINIO_BUCKET, objectKey);
}

export async function statObject(objectKey: string) {
  await ensureObjectStorageBucket();
  return objectStorage.statObject(env.MINIO_BUCKET, objectKey);
}

export async function removeObject(objectKey: string): Promise<void> {
  await ensureObjectStorageBucket();
  await objectStorage.removeObject(env.MINIO_BUCKET, objectKey);
}
