import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
import type { Lead } from "../../pages/CrmLeads/Leads";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type LeadCardsProps = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
};

const statusBadgeColor: Record<Lead["status"], BadgeColor> = {
  New: "info",
  Contacted: "light",
  Qualified: "primary",
  Converted: "success",
  Lost: "error",
};

const interestBadgeColor: Record<Lead["interestLevel"], BadgeColor> = {
  High: "success",
  Medium: "warning",
  Low: "light",
};

export default function LeadCards({ leads, onSelectLead }: LeadCardsProps) {
  return (
    <div className="divide-y divide-gray-100 md:hidden dark:divide-white/[0.05]">
      {leads.length > 0 ? (
        leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            onClick={() => onSelectLead(lead)}
            className="block w-full p-4 text-left transition active:bg-gray-50 dark:active:bg-white/[0.03]"
          >
            <div className="flex items-start gap-3">
              <Avatar src={lead.avatar} alt={lead.name} size="large" />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {lead.name}
                  </h3>

                  <Badge
                    variant="light"
                    color={statusBadgeColor[lead.status]}
                    size="sm"
                  >
                    {lead.status}
                  </Badge>
                </div>

                <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                  {lead.role} <span className="px-1">●</span>{" "}
                  {lead.lastActivity}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-gray-100 pt-3 dark:border-white/[0.05]">
                  <LeadCardField label="Company" value={lead.company} />
                  <LeadCardField label="Source" value={lead.source} />

                  <LeadPersonField
                    label="Owner"
                    avatar={lead.owner.avatar}
                    name={lead.owner.name}
                  />

                  <LeadInterestField value={lead.interestLevel} />
                </div>
              </div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No leads found.
        </div>
      )}
    </div>
  );
}

function LeadInterestField({ value }: { value: Lead["interestLevel"] }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">Interest</p>
      <Badge variant="light" color={interestBadgeColor[value]} size="sm">
        {value}
      </Badge>
    </div>
  );
}

function LeadPersonField({
  label,
  avatar,
  name,
}: {
  label: string;
  avatar: string;
  name: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar src={avatar} alt={name} size="xsmall" />
        <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
          {name}
        </span>
      </div>
    </div>
  );
}

function LeadCardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
        {value}
      </p>
    </div>
  );
}