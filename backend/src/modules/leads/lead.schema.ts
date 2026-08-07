import { z } from "zod";

const leadFields = {
  name: z.string().trim().min(1).max(300),
  role: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().nullable(),
  company: z.string().trim().max(255).optional().nullable(),
  source: z.string().trim().max(150).optional().nullable(),
  annualRevenue: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"]).optional(),
  interestLevel: z.enum(["High", "Medium", "Low"]).optional(),
  address: z.string().trim().max(1000).optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
};

export const createLeadSchema = z.object(leadFields);
export const updateLeadSchema = createLeadSchema.partial();
