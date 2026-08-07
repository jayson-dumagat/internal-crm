import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";

import type { CreateLeadInput, LeadRecord } from "../../api/crm";
import { useCreateLead, useDeleteLead, useLeadsQuery, useUpdateLead } from "../../hooks/crm/useCrmDirectory";
import { ExportIcon, FilterIcon, PlusIcon } from "../../icons";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import LeadCards from "../../components/leads/LeadCards";
import LeadFooter from "../../components/leads/LeadFooter";
import LeadFormSheet from "../../components/leads/LeadFormSheet";
import LeadPreview from "../../components/leads/LeadPreview";
import LeadTable from "../../components/leads/LeadTable";
import PageMeta from "../../components/common/PageMeta";
import SearchField from "../../components/ui/search/Search";

export type LeadStatus = LeadRecord["status"];
export type InterestLevel = LeadRecord["interestLevel"];
export type Lead = LeadRecord;

const leadColumn = createColumnHelper<Lead>();
const leadColumns = [
  leadColumn.accessor("name", { id: "name" }),
  leadColumn.accessor("company", { id: "company" }),
  leadColumn.accessor("status", { id: "status" }),
];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const leadsQuery = useLeadsQuery();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const leadData = leadsQuery.data ?? [];

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return leadData.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (!normalizedSearch) return true;
      return [lead.name, lead.role, lead.email, lead.phone, lead.company, lead.source, lead.owner.name, lead.assignedTo.name, lead.status, lead.interestLevel, lead.address].join(" ").toLowerCase().includes(normalizedSearch);
    });
  }, [leadData, searchTerm, statusFilter]);

  const leadTable = useReactTable({ data: filteredLeads, columns: leadColumns, getCoreRowModel: getCoreRowModel() });
  const totalPages = Math.max(Math.ceil(filteredLeads.length / itemsPerPage), 1);
  const safePage = Math.min(currentPage, totalPages);
  const currentData = leadTable.getRowModel().rows.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage).map((row) => row.original);
  const isCurrentPageSelected = currentData.length > 0 && currentData.every((lead) => selectedIds.includes(String(lead.id)));

  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleCurrentPage = () => {
    const ids = currentData.map((lead) => String(lead.id));
    setSelectedIds((current) => isCurrentPageSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  };

  const openAddLead = () => { setEditingLead(null); setSelectedLead(null); setIsLeadFormOpen(true); };
  const openEditLead = (lead: Lead) => { setEditingLead(lead); setSelectedLead(null); setIsLeadFormOpen(true); };

  const saveLead = async (input: CreateLeadInput, editing?: Lead) => {
    try {
      if (editing) {
        await updateLead.mutateAsync({ id: editing.id, input });
        toast.success("Lead updated successfully.");
      } else {
        await createLead.mutateAsync(input);
        toast.success("Lead added successfully.");
      }
      setIsLeadFormOpen(false);
      setEditingLead(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save lead.");
    }
  };

  const removeLead = async (lead: Lead) => {
    if (!window.confirm(`Delete ${lead.name}?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      setSelectedIds((current) => current.filter((id) => id !== String(lead.id)));
      toast.success("Lead deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete lead.");
    }
  };

  const exportLeads = () => {
    const rows = [["Name", "Email", "Company", "Status", "Interest", "Created"], ...filteredLeads.map((lead) => [lead.name, lead.email, lead.company, lead.status, lead.interestLevel, lead.dateCreated])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "cdex-leads.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <>
    <PageMeta title="CDEX Leads | Caballes-Go Securities, Inc." description="Manage and track CRM leads for Caballes-Go Securities, Inc." />
    <AppBreadcrumb pageName="Leads" />
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchField name="leadSearch" value={searchTerm} onValueChange={setSearchTerm} placeholder="Search leads..." containerClassName="min-w-0 flex-1 md:w-[280px] md:flex-none" className="!h-9 !py-2 !pr-3.5 !pl-10" autoComplete="off" />
          <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
            <button type="button" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"><FilterIcon /> Filter</button>
            <button type="button" onClick={exportLeads} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"><ExportIcon /> Export</button>
            <button type="button" onClick={openAddLead} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"><PlusIcon /> Add Lead</button>
          </div>
        </div>
        {showFilters && <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/[0.05]"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "All")} className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="All">All statuses</option><option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option></select></div>}
      </div>
      {leadsQuery.isLoading && <p className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-white/[0.05]">Loading leads...</p>}
      {leadsQuery.isError && <p className="border-b border-gray-100 px-4 py-3 text-sm text-error-500 dark:border-white/[0.05]">{leadsQuery.error.message}</p>}
      <LeadTable leads={currentData} selectedIds={selectedIds} isCurrentPageSelected={isCurrentPageSelected} onToggleSelected={toggleSelected} onToggleCurrentPage={toggleCurrentPage} onSelectLead={setSelectedLead} onEditLead={openEditLead} onDeleteLead={removeLead} />
      <LeadCards leads={currentData} onSelectLead={setSelectedLead} />
      <LeadFooter totalPages={totalPages} currentPage={safePage} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
    </div>
    <LeadPreview lead={selectedLead} onClose={() => setSelectedLead(null)} onEdit={openEditLead} />
    <LeadFormSheet isOpen={isLeadFormOpen} lead={editingLead} onClose={() => { setIsLeadFormOpen(false); setEditingLead(null); }} onSubmit={saveLead} isPending={createLead.isPending || updateLead.isPending} />
  </>;
}
