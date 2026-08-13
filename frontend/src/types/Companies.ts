export type CompanyStatus = "Active" | "Prospect" | "Dormant";

export type CompanySortKey =
  | "name"
  | "industry"
  | "location"
  | "employees"
  | "revenue"
  | "website"
  | "customerSince"
  | "status"
  | "lastActivity";

export type Company = {
  id: string | number;
  name: string;
  logoUrl?: string | null;
  industry: string;
  location: string;
  employees: string;
  revenue: string;
  contacts: Array<{ name: string; avatar: string | null }>;
  website: string;
  customerSince: string | null;
  tags: string[];
  status: CompanyStatus;
  lastActivity: string | null;
};
