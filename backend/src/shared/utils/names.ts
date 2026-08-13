export function normalizeUserName(name: string): string {
  return name.replace(/\s*\(CGSI\)\s*$/i, "").trim() || name.trim();
}

export function splitPersonName(name: string): {
  firstName: string;
  lastName: string;
} {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts.shift() ?? name.trim(),
    lastName: parts.join(" ") || "—",
  };
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
