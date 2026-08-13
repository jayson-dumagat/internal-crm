import type { LeadRecord } from "../api/crm";

export type LeadStatus = LeadRecord["status"];
export type InterestLevel = LeadRecord["interestLevel"];

/** Lead rows include presentation data resolved from related CRM records. */
export type Lead = LeadRecord & {
  companyLogo?: string | null;
};

export type LeadBadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
