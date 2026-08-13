import type { Lead, LeadBadgeColor } from "../types/Leads";

export const leadStatusBadgeColor: Record<Lead["status"], LeadBadgeColor> = {
  New: "info",
  Contacted: "light",
  Qualified: "primary",
  Converted: "success",
  Lost: "error",
};

export const leadInterestBadgeColor: Record<Lead["interestLevel"], LeadBadgeColor> = {
  High: "success",
  Medium: "warning",
  Low: "light",
};

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}
