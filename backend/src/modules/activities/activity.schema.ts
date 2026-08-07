import { z } from "zod";

export const createActivitySchema = z.object({
  action: z.string().trim().min(1).max(500),
  target: z.string().trim().min(1).max(500),
  category: z.enum(["Authentication", "Client", "KYC", "Pipeline", "Task", "System"]),
  outcome: z.enum(["Success", "Warning", "Denied"]),
  ipAddress: z.string().trim().max(100).optional().nullable(),
  details: z.string().trim().max(5000).optional().nullable(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
