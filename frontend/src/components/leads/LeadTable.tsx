import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

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

const headerCellClass =
  "border border-gray-100 px-4 py-3 dark:border-white/[0.05]";

const bodyCellClass =
  "border border-gray-100 px-4 py-4 text-theme-sm text-gray-800 dark:border-white/[0.05] dark:text-gray-400";

export default function LeadTable({
  leads,
  selectedIds,
  isCurrentPageSelected,
  onToggleSelected,
  onToggleCurrentPage,
  onSelectLead,
}: LeadTableProps) {
  const stopRowClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    lead: Lead,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectLead(lead);
    }
  };

  return (
    <div className="custom-scrollbar hidden max-w-full overflow-x-auto md:block">
      <Table className="min-w-[2220px] table-fixed border-collapse">
        <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell
              isHeader
              className={`sticky left-0 z-30 w-[52px] min-w-[52px] max-w-[52px] bg-white text-center dark:bg-gray-900 ${headerCellClass}`}
            >
              <input
                type="checkbox"
                aria-label="Select all leads on this page"
                checked={isCurrentPageSelected}
                onChange={onToggleCurrentPage}
                className="size-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
              />
            </TableCell>

            <TableHeaderCell
              className="sticky left-[52px] z-30 w-[260px] min-w-[260px] bg-white dark:bg-gray-900"
            >
              Name
            </TableHeaderCell>

            <TableHeaderCell className="w-[180px]">
              Role
            </TableHeaderCell>

            <TableHeaderCell className="w-[190px]">
              Company
            </TableHeaderCell>

            <TableHeaderCell className="w-[240px]">
              Contact
            </TableHeaderCell>

            <TableHeaderCell className="w-[140px]">
              Source
            </TableHeaderCell>

            <TableHeaderCell className="w-[190px]">
              Owner
            </TableHeaderCell>

            <TableHeaderCell className="w-[190px]">
              Assigned To
            </TableHeaderCell>

            <TableHeaderCell className="w-[140px]">
              Status
            </TableHeaderCell>

            <TableHeaderCell className="w-[150px]">
              Interest Level
            </TableHeaderCell>

            <TableHeaderCell className="w-[150px]">
              Date Created
            </TableHeaderCell>

            <TableHeaderCell className="w-[280px]">
              Address
            </TableHeaderCell>

            <TableHeaderCell className="w-[130px]">
              Actions
            </TableHeaderCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.length > 0 ? (
            leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);

              return (
                <TableRow
                  key={lead.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${lead.name}`}
                  onClick={() => onSelectLead(lead)}
                  onKeyDown={(event) => handleRowKeyDown(event, lead)}
                  className={[
                    "group cursor-pointer outline-none transition-colors",
                    "hover:bg-gray-50 focus-visible:bg-gray-50",
                    "dark:hover:bg-white/[0.03] dark:focus-visible:bg-white/[0.03]",
                    isSelected
                      ? "bg-brand-50/40 dark:bg-brand-500/[0.05]"
                      : "",
                  ].join(" ")}
                >
                  <TableCell
                    className={[
                      `sticky left-0 z-20 w-[52px] min-w-[52px] max-w-[52px] text-center ${bodyCellClass}`,
                      isSelected
                        ? "bg-brand-50 dark:bg-gray-900"
                        : "bg-white group-hover:bg-gray-50 group-focus-visible:bg-gray-50 dark:bg-gray-900 dark:group-hover:bg-[#161c24] dark:group-focus-visible:bg-[#161c24]",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${lead.name}`}
                      checked={isSelected}
                      onChange={() => onToggleSelected(lead.id)}
                      onClick={stopRowClick}
                      className="size-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </TableCell>

                  <TableCell
                    className={[
                      `sticky left-[52px] z-20 w-[260px] min-w-[260px] ${bodyCellClass}`,
                      isSelected
                        ? "bg-brand-50 dark:bg-gray-900"
                        : "bg-white group-hover:bg-gray-50 group-focus-visible:bg-gray-50 dark:bg-gray-900 dark:group-hover:bg-[#161c24] dark:group-focus-visible:bg-[#161c24]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={lead.avatar}
                        alt={lead.name}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800 dark:text-white/90">
                          {lead.name}
                        </p>

                        <p className="mt-0.5 truncate text-sm font-normal text-gray-500 dark:text-gray-400">
                          {lead.lastActivity}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <LeadBodyCell className="w-[180px]">
                    <p className="truncate">{lead.role}</p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[190px]">
                    <p className="truncate">{lead.company}</p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[240px]">
                    <div className="min-w-0">
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={stopRowClick}
                        className="block truncate font-medium text-gray-800 transition hover:text-brand-500 dark:text-white/90"
                      >
                        {lead.email}
                      </a>

                      <a
                        href={`tel:${normalizePhone(lead.phone)}`}
                        onClick={stopRowClick}
                        className="mt-0.5 block truncate text-sm font-normal text-gray-500 transition hover:text-brand-500 dark:text-gray-400"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[140px]">
                    <p className="truncate">{lead.source}</p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[190px]">
                    <PersonCell
                      avatar={lead.owner.avatar}
                      name={lead.owner.name}
                    />
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[190px]">
                    <PersonCell
                      avatar={lead.assignedTo.avatar}
                      name={lead.assignedTo.name}
                    />
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[140px]">
                    <Badge
                      variant="light"
                      color={statusBadgeColor[lead.status]}
                      size="sm"
                    >
                      {lead.status}
                    </Badge>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[150px]">
                    <Badge
                      variant="light"
                      color={
                        interestBadgeColor[lead.interestLevel]
                      }
                      size="sm"
                    >
                      {lead.interestLevel}
                    </Badge>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[150px]">
                    <p className="whitespace-nowrap">
                      {lead.dateCreated}
                    </p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[280px]">
                    <p
                      className="line-clamp-2"
                      title={lead.address}
                    >
                      {lead.address}
                    </p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[130px]">
                    <div
                      className="flex w-full items-center gap-2"
                      onClick={stopRowClick}
                    >
                      <button
                        type="button"
                        aria-label={`View ${lead.name}`}
                        onClick={() => onSelectLead(lead)}
                        className="text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <EyeIcon className="size-5" />
                      </button>

                      <button
                        type="button"
                        aria-label={`Edit ${lead.name}`}
                        onClick={stopRowClick}
                        className="text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <SquarePenIcon className="size-5" />
                      </button>
                    </div>
                  </LeadBodyCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={13}
                className="border border-gray-100 px-4 py-10 text-center text-sm font-normal text-gray-500 dark:border-white/[0.05] dark:text-gray-400"
              >
                No leads found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TableHeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      isHeader
      className={`${headerCellClass} ${className}`}
    >
      <p className="text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400">
        {children}
      </p>
    </TableCell>
  );
}

function LeadBodyCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      className={`${bodyCellClass} font-normal ${className}`}
    >
      {children}
    </TableCell>
  );
}

function PersonCell({
  avatar,
  name,
}: {
  avatar: string;
  name: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar
        src={avatar}
        alt={name}
        size="small"
      />

      <span className="truncate font-normal text-gray-800 dark:text-gray-400">
        {name}
      </span>
    </div>
  );
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}