import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { LeadRecord } from "../api/crm";
import type { CreateLeadInput } from "../types/Crm";
import type { Lead, LeadStatus } from "../types/Leads";
import {
  useContactsQuery,
  useCompaniesQuery,
  useUsersQuery,
  useCreateLead,
  useDeleteLead,
  useLeadsQuery,
  useConvertLeadToClient,
  useUpdateLead,
} from "../hooks/crm/useCrmDirectory";
import { ExportIcon, FilterIcon, PlusIcon } from "../icons";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import LeadCards from "../components/leads/LeadCards";
import LeadFooter from "../components/leads/LeadFooter";
import LeadFormSheet from "../components/leads/LeadFormSheet";
import LeadPreview from "../components/leads/LeadPreview";
import LeadTable from "../components/leads/LeadTable";
import PageMeta from "../components/common/PageMeta";
import SearchField from "../components/search/SearchField";
import { useCan } from "../hooks/auth/useCan";
import { downloadCsv } from "../utils/csv";
import { useSearch } from "../hooks/useSearch";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { useSearchParams } from "react-router";
import { DataLoadingSkeleton } from "../components/common/PageLoadingSkeleton";
import CrmFilterControls, {
  toFilterOptions,
  toIdFilterOptions,
} from "../components/crm/CrmFilterControls";

const leadColumn = createColumnHelper<Lead>();
const leadColumns = [
  leadColumn.accessor("name", { id: "name" }),
  leadColumn.accessor("company", { id: "company" }),
  leadColumn.accessor("status", { id: "status" }),
];

export default function Leads() {
  const toast = useToast();
  const { search } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">(
    (searchParams.get("status") as LeadStatus | "All") || "All",
  );
  const [showFilters, setShowFilters] = useState(false);
  const leadsQuery = useLeadsQuery();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLeadToClient();
  const contactsQuery = useContactsQuery(false);
  const companiesQuery = useCompaniesQuery(false);
  const usersQuery = useUsersQuery();
  const allLeadsQuery = useLeadsQuery(false);
  const canCreate = useCan("leads.create");
  const canUpdate = useCan("leads.update");
  const canDelete = useCan("leads.delete");
  const canExport = useCan("leads.export");
  const leadData = useMemo(() => {
    const contactsByEmail = new Map(
      (contactsQuery.data ?? []).map((contact) => [
        contact.contact.email.trim().toLowerCase(),
        contact.user.image,
      ]),
    );

    const companies = contactsQuery.data ?? [];
    return (leadsQuery.data ?? []).map((lead) => ({
      ...lead,
      avatar:
        lead.avatar ??
        contactsByEmail.get(lead.email.trim().toLowerCase()) ??
        null,
      companyLogo:
        companies.find((contact) => contact.company.name === lead.company)
          ?.company.image ?? null,
    }));
  }, [contactsQuery.data, leadsQuery.data]);

  useEffect(() => setCurrentPage(1), [search, statusFilter]);

  const debouncedSearch = useDebounce(search, 300);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
    if (key === "status")
      setStatusFilter((value || "All") as LeadStatus | "All");
  };

  const filteredLeads = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return leadData.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (!normalizedSearch) return true;
      return [
        lead.name,
        lead.role,
        lead.email,
        lead.phone,
        lead.company,
        lead.source,
        lead.owner.name,
        lead.assignedTo.name,
        lead.status,
        lead.interestLevel,
        lead.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [debouncedSearch, leadData, statusFilter]);

  const leadTable = useReactTable({
    data: filteredLeads,
    columns: leadColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const totalPages = Math.max(
    Math.ceil(filteredLeads.length / itemsPerPage),
    1,
  );
  const safePage = Math.min(currentPage, totalPages);
  const currentData = leadTable
    .getRowModel()
    .rows.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)
    .map((row) => row.original);
  const isCurrentPageSelected =
    currentData.length > 0 &&
    currentData.every((lead) => selectedIds.includes(String(lead.id)));

  const toggleSelected = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  const toggleCurrentPage = () => {
    const ids = currentData.map((lead) => String(lead.id));
    setSelectedIds((current) =>
      isCurrentPageSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  };

  const openAddLead = () => {
    setEditingLead(null);
    setSelectedLead(null);
    setIsLeadFormOpen(true);
  };
  const openEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setSelectedLead(null);
    setIsLeadFormOpen(true);
  };

  const saveLead = async (
    input: CreateLeadInput,
    editing?: Lead,
  ): Promise<LeadRecord> => {
    const savedLead = editing
      ? await updateLead.mutateAsync({ id: editing.id, input })
      : await createLead.mutateAsync(input);
    return savedLead;
  };

  const removeLead = async (lead: Lead) => {
    if (!window.confirm(`Delete ${lead.name}?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      setSelectedIds((current) =>
        current.filter((id) => id !== String(lead.id)),
      );
      toast.success("Lead deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete lead.",
      );
    }
  };

  const convertLeadToClient = async (lead: Lead) => {
    if (lead.status === "Converted") {
      toast.info("This lead is already linked to a client.");
      return;
    }

    if (!window.confirm(`Convert ${lead.name} into a client?`)) return;

    try {
      const result = await convertLead.mutateAsync(lead.id);
      setSelectedLead(result.lead as Lead);
      toast.success(
        result.alreadyConverted
          ? "This lead is already linked to a client."
          : "Lead converted to client successfully.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to convert lead to client.",
      );
    }
  };

  const exportLeads = () => {
    downloadCsv(
      "cdex-leads.csv",
      ["Name", "Email", "Company", "Status", "Interest", "Created"],
      filteredLeads.map((lead) => [
        lead.name,
        lead.email,
        lead.company,
        lead.status,
        lead.interestLevel,
        lead.dateCreated,
      ]),
    );
  };

  return (
    <>
      <PageMeta
        title="CDEX Leads | Caballes-Go Securities, Inc."
        description="Manage and track CRM leads."
      />
      <AppBreadcrumb pageName="Leads" />
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SearchField />
            <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
              <button
                type="button"
                aria-expanded={showFilters}
                onClick={() => setShowFilters((value) => !value)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <FilterIcon /> Filter
              </button>
              <button
                type="button"
                onClick={exportLeads}
                disabled={!canExport}
                title={canExport ? "Export leads" : "Permission required"}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:[&_svg]:opacity-50 disabled:hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:disabled:border-gray-800 dark:disabled:bg-gray-900 dark:disabled:text-gray-600 dark:disabled:hover:bg-gray-900"
              >
                <ExportIcon /> Export
              </button>
              <button
                type="button"
                disabled={!canCreate}
                title={canCreate ? "Add Lead" : "Read-only access"}
                onClick={openAddLead}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <PlusIcon /> Add Lead
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/[0.05]">
              <CrmFilterControls
                filters={[
                  {
                    key: "role",
                    label: "Role / job title",
                    value: searchParams.get("role") ?? "",
                    options: toFilterOptions(
                      (allLeadsQuery.data ?? []).map((lead) => lead.role),
                    ),
                  },
                  {
                    key: "company",
                    label: "Company",
                    value: searchParams.get("company") ?? "",
                    options: toFilterOptions(
                      (companiesQuery.data ?? []).map(
                        (company) => company.name,
                      ),
                    ),
                  },
                  {
                    key: "assignedTo",
                    label: "Assigned to",
                    value: searchParams.get("assignedTo") ?? "",
                    options: toIdFilterOptions(
                      (usersQuery.data ?? []).map((user) => ({
                        id: user.id,
                        name: user.isCurrentUser ? "Me" : user.name,
                      })),
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    value: searchParams.get("status") ?? "",
                    options: toFilterOptions([
                      "New",
                      "Contacted",
                      "Qualified",
                      "Converted",
                      "Lost",
                    ]),
                  },
                  {
                    key: "interestLevel",
                    label: "Interest level",
                    value: searchParams.get("interestLevel") ?? "",
                    options: toFilterOptions(["High", "Medium", "Low"]),
                  },
                ]}
                onChange={updateFilter}
              />
            </div>
          )}
        </div>
        {leadsQuery.isLoading && (
          <div className="border-b border-gray-100 text-sm text-gray-500 dark:border-white/[0.05]">
            <DataLoadingSkeleton rows={5} />
          </div>
        )}
        {leadsQuery.isError && (
          <p className="border-b border-gray-100 px-4 py-3 text-sm text-error-500 dark:border-white/[0.05]">
            {leadsQuery.error.message}
          </p>
        )}
        <LeadTable
          leads={currentData}
          selectedIds={selectedIds}
          isCurrentPageSelected={isCurrentPageSelected}
          onToggleSelected={toggleSelected}
          onToggleCurrentPage={toggleCurrentPage}
          onSelectLead={setSelectedLead}
          onEditLead={openEditLead}
          onDeleteLead={removeLead}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
        <LeadCards leads={currentData} onSelectLead={setSelectedLead} />
        <LeadFooter
          totalPages={totalPages}
          currentPage={safePage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
      <LeadPreview
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onEdit={openEditLead}
        onConvert={convertLeadToClient}
      />
      <LeadFormSheet
        isOpen={isLeadFormOpen}
        lead={editingLead}
        onClose={() => {
          setIsLeadFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={saveLead}
        isPending={createLead.isPending || updateLead.isPending}
      />
    </>
  );
}
