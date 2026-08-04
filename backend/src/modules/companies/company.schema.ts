import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value || null);

export const createCompanySchema = z.object({
  name: z.string().trim().min(1).max(255),
  industry: optionalText(200),
  location: optionalText(255),
  employees: optionalText(50),
  revenue: optionalText(100),
  website: optionalText(500),
  customerSince: z.string().trim().max(30).optional().transform((value) => value || null),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  status: z.enum(["Active", "Prospect", "Dormant"]).default("Prospect"),
  logoUrl: optionalText(1000),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
