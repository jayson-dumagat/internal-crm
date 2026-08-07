function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const tenantId = requireEnvironmentVariable("AZURE_TENANT_ID");
const clientId = requireEnvironmentVariable("AZURE_CLIENT_ID");
const clientSecret = requireEnvironmentVariable("AZURE_CLIENT_SECRET");

export const entraConfig = {
  tenantId,
  clientId,
  clientSecret,

  authority:
    process.env.AZURE_AUTHORITY ??
    `https://login.microsoftonline.com/${tenantId}`,

  redirectUri: requireEnvironmentVariable("AZURE_REDIRECT_URI"),

  frontendUrl: requireEnvironmentVariable("FRONTEND_URL"),

  scopes: ["openid", "profile", "email", "User.Read"],

  postLogoutRedirectUri:
    process.env.FRONTEND_URL ?? "http://localhost:5173",
} as const;
