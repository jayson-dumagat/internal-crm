import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value || null);

export const createContactSchema = z.object({
  name: z.string().trim().min(1).max(255),
  role: optionalText(200),
  companyId: z.string().uuid().optional().nullable(),
  companyName: optionalText(255),
  email: z.string().trim().email().max(320),
  phone: optionalText(50),
  relationshipLevel: z.enum(["High", "Medium", "Low"]).default("Medium"),
  relationshipOwner: optionalText(255),
  relationshipOwnerId: z.string().trim().max(150).optional().nullable(),
  location: optionalText(255),
  typeOfClient: optionalText(80),
  riskProfile: optionalText(30),
  preferredContactMethod: optionalText(30),
  status: z.enum(["Customer", "Prospect", "KYC Pending", "Dormant", "Closed"]).default("Prospect"),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  avatarUrl: optionalText(1000),
  lastActivityAt: z.string().datetime().optional().nullable(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
