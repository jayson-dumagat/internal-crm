import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1),

  MINIO_ENDPOINT: z.string().min(1).default("minio"),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  MINIO_ACCESS_KEY: z.string().min(3).default("cdex-minio"),
  MINIO_SECRET_KEY: z.string().min(8).default("cdex-minio-secret"),
  MINIO_BUCKET: z.string().min(1).default("crm-files"),

  REDIS_URL: z
    .string()
    .url()
    .default("redis://localhost:6379"),

  REDIS_SESSION_PREFIX: z
    .string()
    .min(1)
    .default("ccrms:sess:"),

  SESSION_TTL_SECONDS: z
    .coerce
    .number()
    .int()
    .positive()
    .default(8 * 60 * 60),

  SESSION_COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  SESSION_COOKIE_SAME_SITE: z
    .enum(["lax", "strict", "none"])
    .default("lax"),

  FRONTEND_ORIGIN: z.string().url(),
  FRONTEND_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),

  // Microsoft Entra ID
  AZURE_TENANT_ID: z.string().min(1),

  AZURE_CLIENT_ID: z.string().uuid(),

  AZURE_CLIENT_SECRET: z.string().min(1),

  AZURE_AUTHORITY: z.string().url(),

  AZURE_ISSUER: z.string().url(),

  AZURE_JWKS_URI: z.string().url(),

  AZURE_AUDIENCE: z.string().uuid(),
  AZURE_REDIRECT_URI: z.string().url(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment variables:",
    result.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const env = result.data;
