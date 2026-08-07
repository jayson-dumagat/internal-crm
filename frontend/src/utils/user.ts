export const CURRENT_USER_AVATAR = "/images/user/owner.png";

export function formatUserDisplayName(name: string | null | undefined): string {
  if (!name) return "";

  return name.replace(/\s*\(CGSI\)\s*$/i, "").trim() || name.trim();
}
