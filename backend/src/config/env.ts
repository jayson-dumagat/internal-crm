import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1),

  FRONTEND_ORIGIN: z.string().url(),

  // Microsoft Entra ID
  AZURE_TENANT_ID: z.string().min(1),

  AZURE_CLIENT_ID: z.string().uuid(),

  AZURE_CLIENT_SECRET: z.string().min(1),

  AZURE_AUTHORITY: z.string().url(),

  AZURE_ISSUER: z.string().url(),

  AZURE_JWKS_URI: z.string().url(),

  AZURE_AUDIENCE: z.string().uuid(),
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