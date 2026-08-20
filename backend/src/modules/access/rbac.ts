import { AccessControl, type IGrantsList } from "accesscontrol";

/**
 * The database stores permission codes as dot-separated values, for example
 * `leads.read` or `tasks.status.update`. AccessControl resource names cannot
 * contain dots, so the resource portion is encoded before it is handed to the
 * library. The original code remains the source of truth in the database.
 */
function parsePermission(code: string): { action: string; resource: string } | null {
  const parts = code
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const action = parts.at(-1);
  const resourceParts = parts.slice(0, -1);
  if (!action || !resourceParts.length) return null;

  return {
    action,
    resource: resourceParts.join("__"),
  };
}

function grantsForPermissions(permissions: readonly string[]): IGrantsList {
  return permissions.flatMap((permission) => {
    const parsed = parsePermission(permission);
    if (!parsed) return [];

    return [
      {
        role: "session",
        resource: parsed.resource,
        action: parsed.action,
        possession: "any",
        attributes: ["*"],
      },
    ];
  });
}

const controlCache = new Map<string, AccessControl>();
const MAX_CACHED_POLICIES = 128;

function accessControlFor(permissions: readonly string[]): AccessControl {
  const cacheKey = [...new Set(permissions)].sort().join("\u0000");
  const cached = controlCache.get(cacheKey);
  if (cached) return cached;

  let control: AccessControl;
  try {
    const grants = grantsForPermissions(permissions);
    control = grants.length
      ? new AccessControl(grants).lock()
      : new AccessControl([]);
  } catch {
    // A malformed catalog entry must fail closed rather than turn an
    // authorization check into an accidental 500 response.
    control = new AccessControl([]);
  }
  if (controlCache.size >= MAX_CACHED_POLICIES) {
    const firstKey = controlCache.keys().next().value;
    if (firstKey) controlCache.delete(firstKey);
  }
  controlCache.set(cacheKey, control);
  return control;
}

/**
 * Evaluates a permission through AccessControl. The effective permission list
 * is already resolved from Entra roles and restrictive database policies, so
 * this layer is deliberately fail-closed and never grants a permission that
 * is absent from that list.
 */
export function hasRbacPermission(
  permissions: readonly string[],
  permission: string,
): boolean {
  const parsed = parsePermission(permission);
  if (!parsed) return false;

  return accessControlFor(permissions)
    .tryCan("session")
    .action(parsed.action, parsed.resource).granted;
}

export function clearRbacPolicyCache(): void {
  controlCache.clear();
}
