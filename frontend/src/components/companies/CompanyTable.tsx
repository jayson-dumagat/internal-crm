import { useMemo, useState } from "react";
import {
  ExportIcon,
  FilterIcon,
  UploadIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
  Building2Icon,
} from "../../icons";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearch } from "../../hooks/useSearch";
import type { CompanyRecord } from "../../api/crm";
import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
import AddCompanySheet from "./AddCompanySheet";
import {
  useCompaniesQuery,
  useDeleteCompany,
} from "../../hooks/crm/useCrmDirectory";
import { toast } from "sonner";
import { formatDisplayDate } from "../../utils/date";
import SearchField from "../search/SearchField";
import { useCan } from "../../hooks/auth/useCan";
import Checkbox from "../form/input/Checkbox";

type CompanyStatus = "Active" | "Prospect" | "Dormant";
type SortKey =
  | "name"
  | "industry"
  | "location"
  | "employees"
  | "revenue"
  | "website"
  | "customerSince"
  | "status"
  | "lastActivity";

type Company = {
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

const columns: Array<{
  key: SortKey | "contacts" | "tags" | "actions";
  label: string;
  width: number;
}> = [
  { key: "industry", label: "Industry", width: 175 },
  { key: "location", label: "Location", width: 205 },
  { key: "employees", label: "Employees", width: 115 },
  { key: "revenue", label: "Revenue", width: 115 },
  { key: "contacts", label: "Contacts", width: 125 },
  { key: "website", label: "Website", width: 205 },
  { key: "customerSince", label: "Customer Since", width: 145 },
  { key: "tags", label: "Tags", width: 200 },
  { key: "status", label: "Status", width: 110 },
  { key: "lastActivity", label: "Last Activity", width: 145 },
  { key: "actions", label: "Action", width: 100 },
];

const statusColor = {
  Active: "success",
  Prospect: "primary",
  Dormant: "light",
} as const;

export default function CompanyTable() {
  const companiesQuery = useCompaniesQuery();
  const companyData = companiesQuery.data;
  const hasCompanies = (companyData ?? []).length > 0;
  const { search } = useSearch();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Array<Company["id"]>>([]);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(
    null,
  );
  const deleteCompany = useDeleteCompany();
  const canCreate = useCan("companies.create");
  const canUpdate = useCan("companies.update");
  const canDelete = useCan("companies.delete");
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: "name",
    descending: false,
  });

  const debouncedSearch = useDebounce(search, 400);

  const rows = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const filtered = term
      ? (companyData ?? []).filter((company) =>
          [
            company.name,
            company.industry,
            company.location,
            company.website,
            company.status,
            company.tags.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : (companyData ?? []);

    return [...filtered].sort((a, b) => {
      const result = String(a[sort.key]).localeCompare(
        String(b[sort.key]),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );
      return sort.descending ? -result : result;
    });
  }, [companyData, debouncedSearch, sort.descending, sort.key]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selected.includes(row.id));

  const changeSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      descending: current.key === key ? !current.descending : false,
    }));
  };

  const togglePage = () => {
    const ids = visibleRows.map((row) => row.id);
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  };

  return (
    <>
      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-2.5 sm:pr-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
          <SearchField />
          <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
            <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
              <FilterIcon /> Filter
            </button>
            <button
              type="button"
              disabled={!canCreate}
              aria-label="Import companies"
              title={canCreate ? "Import companies" : "Read-only access"}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <UploadIcon />
            </button>
            <button
              type="button"
              aria-label="Export companies"
              title="Export companies"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ExportIcon />
            </button>
            <button
              type="button"
              disabled={!canCreate}
              title={canCreate ? "Add Company" : "Read-only access"}
              onClick={() => {
                setEditingCompany(null);
                setIsAddCompanyOpen(true);
              }}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <PlusIcon /> Add Company
            </button>
          </div>
        </div>

        <div className="custom-scrollbar w-full min-w-0 overflow-x-auto">
          <table className="w-[1932px] min-w-[1932px] table-fixed border-separate border-spacing-0 [&_td]:px-3.5 [&_td]:py-3 [&_th]:px-3.5 [&_th]:py-2.5">
            <colgroup>
              <col style={{ width: 52 }} />
              <col style={{ width: 240 }} />
              {columns.map((column) => (
                <col key={column.key} style={{ width: column.width }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900">
                  <Checkbox
                    checked={allVisibleSelected}
                    onChange={togglePage}
                    aria-label={
                      allVisibleSelected
                        ? "Deselect all visible companies"
                        : "Select all visible companies"
                    }
                  />
                </th>
                <th className="border border-gray-100 bg-white px-4 py-3 text-left dark:border-white/[0.05] dark:bg-gray-900">
                  <button
                    onClick={() => changeSort("name")}
                    className="w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    Name
                  </button>
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="border border-gray-100 px-4 py-3 text-left dark:border-white/[0.05]"
                  >
                    {column.key === "contacts" ||
                    column.key === "tags" ||
                    column.key === "actions" ? (
                      <span className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {column.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => changeSort(column.key as SortKey)}
                        className="w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400"
                      >
                        {column.label}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companiesQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400"
                  >
                    Loading companies...
                  </td>
                </tr>
              ) : companiesQuery.isError ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="border border-gray-100 px-4 py-10 text-center text-sm text-error-500 dark:border-white/[0.05]"
                  >
                    {companiesQuery.error.message}
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="border border-gray-100 px-4 py-10 dark:border-white/[0.05]"
                  >
                    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                      <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                        <Building2Icon className="size-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {hasCompanies
                          ? "No companies match your search"
                          : "No companies yet"}
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        {hasCompanies
                          ? "Try adjusting your search to find a company."
                          : "Add your first company to start building your directory."}
                      </p>
                      {!hasCompanies && (
                        <button
                          type="button"
                          disabled={!canCreate}
                          title={canCreate ? "Add Company" : "Read-only access"}
                          onClick={() => {
                            setEditingCompany(null);
                            setIsAddCompanyOpen(true);
                          }}
                          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PlusIcon className="size-4" /> Add Company
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRows.map((company) => {
                  const isSelected = selected.includes(company.id);
                  return (
                    <tr
                      key={company.id}
                      className={
                        isSelected
                          ? "bg-brand-50/40 dark:bg-brand-500/[0.05]"
                          : ""
                      }
                    >
                      <td
                        className={`border border-gray-100 px-4 py-4 text-center dark:border-white/[0.05] ${isSelected ? "bg-brand-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}
                      >
                        <Checkbox
                        checked={isSelected}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(company.id)
                                ? current.filter((id) => id !== company.id)
                                : [...current, company.id],
                            )
                          }
                          aria-label={
                            isSelected
                              ? `Deselect ${company.name}`
                              : `Select ${company.name}`
                          }
                        />
                      </td>
                      <td
                        className={`border border-gray-100 px-4 py-4 dark:border-white/[0.05] ${isSelected ? "bg-brand-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            src={company.logoUrl}
                            alt={company.name}
                            colorKey={`company-${company.id}`}
                            size="small"
                          />
                          <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white">
                            {company.name}
                          </span>
                        </div>
                      </td>
                      <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {company.industry}
                      </td>
                      <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {company.location}
                      </td>
                      <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {company.employees}
                      </td>
                      <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {company.revenue}
                      </td>
                      <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]">
                        <div className="flex -space-x-2">
                          {company.contacts.map((contact) => (
                            <span
                              key={contact.name}
                              title={contact.name}
                              className="rounded-full border-2 border-white dark:border-gray-900"
                            >
                              <Avatar
                                src={contact.avatar}
                                alt={contact.name}
                                size="small"
                              />
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm dark:border-white/[0.05]">
                        <a
                          href={`https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-500 hover:text-brand-600"
                        >
                          {company.website}
                        </a>
                      </td>
                      <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {formatDisplayDate(company.customerSince)}
                      </td>
                      <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]">
                        <div className="flex gap-1.5 overflow-hidden">
                          {company.tags.map((tag) => (
                            <Badge key={tag} color="light" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]">
                        <Badge color={statusColor[company.status]} size="sm">
                          {company.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">
                        {formatDisplayDate(company.lastActivity)}
                      </td>
                      <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            aria-label={`Delete ${company.name}`}
                            title={
                              canDelete
                                ? `Delete ${company.name}`
                                : "Read-only access"
                            }
                            disabled={!canDelete || deleteCompany.isPending}
                            onClick={async () => {
                              if (!window.confirm(`Delete ${company.name}?`))
                                return;
                              try {
                                await deleteCompany.mutateAsync(company.id);
                                setSelected((ids) =>
                                  ids.filter((id) => id !== company.id),
                                );
                                toast.success("Company deleted successfully.");
                              } catch (error) {
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : "Unable to delete company.",
                                );
                              }
                            }}
                            className="text-gray-500 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <TrashBinIcon className="size-5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${company.name}`}
                            title={
                              canUpdate
                                ? `Edit ${company.name}`
                                : "Read-only access"
                            }
                            disabled={!canUpdate}
                            onClick={() => {
                              setEditingCompany(company);
                              setIsAddCompanyOpen(true);
                            }}
                            className="text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Show
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:bg-gray-900"
            >
              {[5, 8, 10].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
            entries
          </label>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
              {page}
            </span>
            <button
              disabled={page === pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </section>
      <AddCompanySheet
        isOpen={isAddCompanyOpen}
        onClose={() => {
          setIsAddCompanyOpen(false);
          setEditingCompany(null);
        }}
        company={editingCompany}
      />
    </>
  );
}
