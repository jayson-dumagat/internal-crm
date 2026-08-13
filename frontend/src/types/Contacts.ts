export type ContactStatus =
  | "Customer"
  | "Prospect"
  | "KYC Pending"
  | "Dormant"
  | "Closed";

export type RelationshipLevel = "High" | "Medium" | "Low";

export type ContactBadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export type Contact = {
  id: string | number;
  user: { image: string | null; name: string };
  position: string;
  company: { image: string | null; name: string };
  relationship_level: RelationshipLevel;
  contact: { email: string; phone: string };
  owner: { image: string | null; name: string };
  location: string;
  status: ContactStatus;
  last_activity: string | null;
  company_id?: string | null;
  type_of_client?: string | null;
  risk_profile?: string | null;
  preferred_contact_method?: string | null;
  tags?: string[];
};

export type ContactSortKey =
  | "name"
  | "position"
  | "company"
  | "relationship_level"
  | "contact"
  | "owner"
  | "location"
  | "status"
  | "last_activity";

export type SortOrder = "asc" | "desc";
