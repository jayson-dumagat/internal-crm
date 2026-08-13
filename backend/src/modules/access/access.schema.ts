import { z } from "zod";

export const accessPolicySchema = z
  .object({
    allowedPermissions: z.array(z.string()).max(500).default([]),
    deniedPermissions: z.array(z.string()).max(500).default([]),
    fieldRules: z.record(z.string(), z.enum(["visible", "hidden"])).default({}),
    dataScopes: z.record(z.string(), z.enum(["all", "assigned", "own"])).default({}),
    resourceAssignments: z
      .record(z.string(), z.array(z.string().uuid()).max(5000))
      .default({}),
  })
  .strict();
