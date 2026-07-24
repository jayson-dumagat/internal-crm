import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
import type { Lead } from "../../pages/CrmLeads/Leads";
import { EyeIcon, SquarePenIcon } from "../../icons";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type LeadTableProps = {
  leads: Lead[];
  selectedIds: number[];
  isCurrentPageSelected: boolean;
  onToggleSelected: (id: number) => void;
  onToggleCurrentPage: () => void;
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

export default function LeadTable({
  leads,
  selectedIds,
  isCurrentPageSelected,
  onToggleSelected,
  onToggleCurrentPage,
  onSelectLead,
}: LeadTableProps) {
  return (
    <>
      <div className="hidden md:flex">
        <div className="w-[328px] shrink-0 border-r border-gray-100 bg-white dark:border-white/[0.05] dark:bg-gray-900">
          <Table className="w-[328px] table-fixed border-collapse">
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="h-[45px] w-12 border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={isCurrentPageSelected}
                    onChange={onToggleCurrentPage}
                    className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                  />
                </TableCell>

                <TableCell
                  isHeader
                  className="h-[45px] w-[280px] border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900"
                >
                  <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                    Name
                  </p>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="h-[73px] w-12 border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => onToggleSelected(lead.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                      />
                    </TableCell>

                    <TableCell className="h-[73px] w-[280px] border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <Avatar src={lead.avatar} alt={lead.name} />

                        <div className="min-w-0">
                          <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {lead.name}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                            {lead.lastActivity}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-[73px] w-12 border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900" />
                  <TableCell className="h-[73px] w-[280px] border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 dark:border-white/[0.05] dark:bg-gray-900 dark:text-gray-400">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="custom-scrollbar min-w-0 flex-1 overflow-x-auto">
          <Table className="min-w-max table-fixed border-collapse">
            <TableHeader>
              <TableRow>
                {[
                  "Role",
                  "Company",
                  "Contact",
                  "Source",
                  "Owner",
                  "Assigned To",
                  "Status",
                  "Interest Level",
                  "Date Created",
                  "Address",
                  "Actions",
                ].map((label) => (
                  <TableCell
                    key={label}
                    isHeader
                    className="h-[45px] min-w-[160px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]"
                  >
                    <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                      {label}
                    </p>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                      {lead.role}
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                      {lead.company}
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <div className="min-w-[190px]">
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {lead.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                      {lead.source}
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <PersonCell
                        avatar={lead.owner.avatar}
                        name={lead.owner.name}
                      />
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <PersonCell
                        avatar={lead.assignedTo.avatar}
                        name={lead.assignedTo.name}
                      />
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <Badge
                        variant="light"
                        color={statusBadgeColor[lead.status]}
                        size="sm"
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <Badge
                        variant="light"
                        color={interestBadgeColor[lead.interestLevel]}
                        size="sm"
                      >
                        {lead.interestLevel}
                      </Badge>
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                      {lead.dateCreated}
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                      <p className="line-clamp-2 min-w-[240px]">
                        {lead.address}
                      </p>
                    </TableCell>

                    <TableCell className="h-[73px] border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`View ${lead.name}`}
                          onClick={() => onSelectLead(lead)}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        >
                          <EyeIcon />
                        </button>

                        <button
                          type="button"
                          aria-label={`Edit ${lead.name}`}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        >
                          <SquarePenIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-[73px] border border-gray-100 px-4 py-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      
    </>
  );
}

function PersonCell({ avatar, name }: { avatar: string; name: string }) {
  return (
    <div className="flex min-w-[150px] items-center gap-2">
      <Avatar src={avatar} alt={name} size="small" />
      <span className="truncate text-theme-sm font-medium text-gray-700 dark:text-gray-300">
        {name}
      </span>
    </div>
  );
}



