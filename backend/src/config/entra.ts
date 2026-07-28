import { env } from "./env";

export const entra = {
  tenantId: env.AZURE_TENANT_ID,
  clientId: env.AZURE_CLIENT_ID,
  authority: env.AZURE_AUTHORITY,
  issuer: env.AZURE_ISSUER,
  audience: env.AZURE_AUDIENCE,
  jwksUri: env.AZURE_JWKS_URI,
};