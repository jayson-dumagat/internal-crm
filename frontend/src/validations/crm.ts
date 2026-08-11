import { z } from "zod";

import {
  emailText,
  hexColor,
  optionalDate,
  optionalDateTimeLocal,
  optionalPhone,
  optionalText,
  optionalWebsite,
  requiredText,
  tagInput,
} from "./common";

export const leadFormSchema = z
  .object({
    name: requiredText("Name", 300),
    role: optionalText(200),
    email: emailText,
    phone: optionalPhone,
    company: optionalText(255),
    source: optionalText(150),
    annualRevenue: z
      .string()
      .trim()
      .max(100, "Annual revenue must be 100 characters or fewer.")
      .refine(
        (value) => value === "" || /^[A-Za-z]{0,5}\s?[\d,.]+(?:\s?[A-Za-z]{1,3})?$/.test(value),
        "Enter revenue as a number or currency amount.",
      )
      .optional(),
    status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"]),
    interestLevel: z.enum(["High", "Medium", "Low"]),
    address: optionalText(1000),
  })
  .strict();

export const companyFormSchema = z
  .object({
    name: requiredText("Company name", 255),
    industry: optionalText(200),
    location: optionalText(255),
    employees: z
      .string()
      .trim()
      .max(50, "Employees must be 50 characters or fewer.")
      .refine((value) => value === "" || /^\d+(\s*-\s*\d+)?$/.test(value), "Enter an employee count or range.")
      .optional(),
    revenue: optionalText(100),
    website: optionalWebsite,
    customerSince: optionalDate,
    tags: tagInput,
    status: z.enum(["Active", "Prospect", "Dormant"]),
  })
  .strict();

export const contactFormSchema = z
  .object({
    name: requiredText("Contact name", 255),
    role: optionalText(200),
    companyId: z.string().trim().max(36, "Select a valid company.").optional(),
    email: emailText,
    phone: optionalPhone,
    relationshipLevel: z.enum(["High", "Medium", "Low"]),
    relationshipOwnerId: z.string().trim().max(150, "Select a valid relationship owner.").optional(),
    location: optionalText(255),
    typeOfClient: z
      .enum(["Retail Investor", "High Net Worth Individual", "Institutional Investor", "Corporate Client", "Partner / Introducer"])
      .or(z.literal("")),
    riskProfile: z.enum(["Conservative", "Balanced", "Aggressive"]).or(z.literal("")),
    preferredContactMethod: z.enum(["Email", "Phone", "Meeting", "Video Call"]).or(z.literal("")),
    status: z.enum(["Customer", "Prospect", "KYC Pending", "Dormant", "Closed"]),
    tags: tagInput,
  })
  .strict();

export const noteFormSchema = z
  .object({
    title: requiredText("Title", 255),
    content: z.string().trim().min(1, "Note content is required.").max(100000, "Note content is too long."),
    contentHtml: z.string().max(200000, "Note content is too long."),
    relatedTo: optionalText(255),
    category: z.enum(["Client", "Follow-up", "Investment", "Internal"]),
  })
  .strict();

export const taskFormSchema = z
  .object({
    title: requiredText("Task title", 255),
    description: optionalText(10000),
    type: z.enum(["general", "call", "email", "meeting", "follow_up", "document", "review"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    status: z.enum(["not-started", "in-progress", "completed", "overdue", "blocked"]),
    color: hexColor,
    startAt: optionalDateTimeLocal,
    dueAt: optionalDateTimeLocal,
    reminderAt: optionalDateTimeLocal,
    assigneeId: z.string().trim().max(150).optional(),
    leadId: z.string().trim().max(36).optional(),
  })
  .strict()
  .superRefine((values, context) => {
    if (values.startAt && values.dueAt && new Date(values.dueAt) < new Date(values.startAt)) {
      context.addIssue({ code: "custom", path: ["dueAt"], message: "Due date must be after the start date." });
    }

    if (values.reminderAt && values.startAt && new Date(values.reminderAt) > new Date(values.startAt)) {
      context.addIssue({ code: "custom", path: ["reminderAt"], message: "Reminder must be before the start date." });
    }
  });

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type CompanyFormValues = z.infer<typeof companyFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type NoteFormValues = z.infer<typeof noteFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
