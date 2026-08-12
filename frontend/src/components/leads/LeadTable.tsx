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
import { EyeIcon, SquarePenIcon, TrashBinIcon } from "../../icons";
import { formatDisplayDate } from "../../utils/date";
import Checkbox from "../form/input/Checkbox";

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
  selectedIds: string[];
  isCurrentPageSelected: boolean;
  onToggleSelected: (id: string) => void;
  onToggleCurrentPage: () => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  canUpdate: boolean;
  canDelete: boolean;
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
  "border border-gray-100 px-3.5 py-2.5 dark:border-white/[0.05]";

const bodyCellClass =
  "border border-gray-100 px-3.5 py-3 text-theme-sm text-gray-800 dark:border-white/[0.05] dark:text-gray-400";

export default function LeadTable({
  leads,
  selectedIds,
  isCurrentPageSelected,
  onToggleSelected,
  onToggleCurrentPage,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  canUpdate,
  canDelete,
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
    <div className="hidden custom-scrollbar max-w-full overflow-x-auto md:block">
      <Table className="w-[2227px] min-w-[2227px] table-fixed border-separate border-spacing-0">
        <colgroup>
          {[52, 250, 175, 200, 250, 130, 185, 185, 130, 145, 145, 270, 110].map(
            (width, index) => (
              <col key={index} style={{ width }} />
            ),
          )}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableCell
              isHeader
              className={`w-[52px] max-w-[52px] min-w-[52px] bg-white text-center dark:bg-gray-900 ${headerCellClass}`}
            >
              <Checkbox
                aria-label="Select all leads on this page"
                checked={isCurrentPageSelected}
                onChange={onToggleCurrentPage}
              />
            </TableCell>

            <TableHeaderCell className="w-[250px] min-w-[250px] bg-white dark:bg-gray-900">
              Name
            </TableHeaderCell>

            <TableHeaderCell className="w-[200px]">Role</TableHeaderCell>

            <TableHeaderCell className="w-[220px]">Company</TableHeaderCell>

            <TableHeaderCell className="w-[280px]">Contact</TableHeaderCell>

            <TableHeaderCell className="w-[150px]">Source</TableHeaderCell>

            <TableHeaderCell className="w-[210px]">Owner</TableHeaderCell>

            <TableHeaderCell className="w-[210px]">Assigned To</TableHeaderCell>

            <TableHeaderCell className="w-[150px]">Status</TableHeaderCell>

            <TableHeaderCell className="w-[170px]">
              Interest Level
            </TableHeaderCell>

            <TableHeaderCell className="w-[170px]">
              Date Created
            </TableHeaderCell>

            <TableHeaderCell className="w-[300px]">Address</TableHeaderCell>

            <TableHeaderCell className="w-[140px]">Actions</TableHeaderCell>
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
                    "group cursor-pointer transition-colors outline-none",
                    "hover:bg-gray-50 focus-visible:bg-gray-50",
                    "dark:hover:bg-white/[0.03] dark:focus-visible:bg-white/[0.03]",
                    isSelected
                      ? "bg-blue-light-50 dark:bg-blue-light-500/[0.08]"
                      : "",
                  ].join(" ")}
                >
                  <TableCell
                    onClick={stopRowClick}
                    className={[
                      `w-[52px] max-w-[52px] min-w-[52px] text-center ${bodyCellClass}`,
                      isSelected
                        ? "bg-blue-light-50 dark:bg-[#172033]"
                        : "bg-white group-hover:bg-gray-50 group-focus-visible:bg-gray-50 dark:bg-gray-900 dark:group-hover:bg-[#161c24] dark:group-focus-visible:bg-[#161c24]",
                    ].join(" ")}
                  >
                    <Checkbox
                      aria-label={`Select ${lead.name}`}
                      checked={isSelected}
                      onChange={() => onToggleSelected(lead.id)}
                    />
                  </TableCell>

                  <TableCell
                    className={[
                      `w-[250px] min-w-[250px] overflow-hidden ${bodyCellClass}`,
                      isSelected
                        ? "bg-blue-light-50 dark:bg-[#172033]"
                        : "bg-white group-hover:bg-gray-50 group-focus-visible:bg-gray-50 dark:bg-gray-900 dark:group-hover:bg-[#161c24] dark:group-focus-visible:bg-[#161c24]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={lead.avatar} alt={lead.name} />

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800 dark:text-white/90">
                          {lead.name}
                        </p>

                        <p className="mt-0.5 truncate text-sm font-normal text-gray-500 dark:text-gray-400">
                          {formatDisplayDate(lead.lastActivity)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <LeadBodyCell className="w-[200px]">
                    <p className="truncate">{lead.role}</p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[220px]">
                    <div className="flex min-w-0 items-center gap-2"><Avatar src={lead.companyLogo ?? null} alt={lead.company} size="xsmall" colorKey={`lead-company-${lead.company}`} /><p className="truncate">{lead.company}</p></div>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[280px]">
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

                  <LeadBodyCell className="w-[150px]">
                    <p className="truncate">{lead.source}</p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[210px]">
                    <PersonCell
                      avatar={lead.owner.avatar}
                      name={lead.owner.name}
                    />
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[210px]">
                    <PersonCell
                      avatar={lead.assignedTo.avatar}
                      name={lead.assignedTo.name}
                    />
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[150px]">
                    <Badge
                      variant="light"
                      color={statusBadgeColor[lead.status]}
                      size="sm"
                    >
                      {lead.status}
                    </Badge>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[170px]">
                    <Badge
                      variant="light"
                      color={interestBadgeColor[lead.interestLevel]}
                      size="sm"
                    >
                      {lead.interestLevel}
                    </Badge>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[170px]">
                    <p className="whitespace-nowrap">
                      {formatDisplayDate(lead.dateCreated)}
                    </p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[300px]">
                    <p className="line-clamp-2" title={lead.address}>
                      {lead.address}
                    </p>
                  </LeadBodyCell>

                  <LeadBodyCell className="w-[140px]">
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
                        title={
                          canUpdate ? `Edit ${lead.name}` : "Read-only access"
                        }
                        disabled={!canUpdate}
                        onClick={() => onEditLead(lead)}
                        className="text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <SquarePenIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${lead.name}`}
                        title={
                          canDelete ? `Delete ${lead.name}` : "Read-only access"
                        }
                        disabled={!canDelete}
                        onClick={() => onDeleteLead(lead)}
                        className="text-gray-500 transition hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                      >
                        <TrashBinIcon className="size-5" />
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
      className={`${headerCellClass} overflow-hidden ${className}`}
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
      className={`${bodyCellClass} overflow-hidden font-normal ${className}`}
    >
      {children}
    </TableCell>
  );
}

function PersonCell({ avatar, name }: { avatar: string | null; name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar src={avatar} alt={name} size="small" />

      <span className="truncate font-normal text-gray-800 dark:text-gray-400">
        {name}
      </span>
    </div>
  );
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}
