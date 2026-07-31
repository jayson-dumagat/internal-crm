import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router";

import PageMeta from "../../components/common/PageMeta";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import LeadCards from "../../components/leads/LeadCards";
import LeadFooter from "../../components/leads/LeadFooter";
import LeadTable from "../../components/leads/LeadTable";
import SearchField from "../../components/ui/search/Search";

import { ExportIcon, FilterIcon, PlusIcon } from "../../icons";
import LeadPreview from "../../components/leads/LeadPreview";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Converted"
  | "Lost";

export type InterestLevel = "High" | "Medium" | "Low";

export type Lead = {
  id: number;
  name: string;
  avatar: string;
  role: string;
  lastActivity: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  annualRevenue?: string;
  owner: {
    name: string;
    avatar: string;
  };
  status: LeadStatus;
  interestLevel: InterestLevel;
  dateCreated: string;
  address: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
};

const leads: Lead[] = [
  {
    id: 1,
    name: "Abram Schleifer",
    avatar: "/images/user/user-20.jpg",
    role: "Finance Manager",
    lastActivity: "1h ago",
    email: "abram@techinnov.com",
    phone: "+63 917 555 0123",
    company: "Tech Innov Inc.",
    source: "Manual",
    annualRevenue: "₱25M",
    owner: {
      name: "Sarah Lim",
      avatar: "/images/user/user-21.jpg",
    },
    status: "New",
    interestLevel: "Low",
    dateCreated: "25 Apr, 2027",
    address:
      "18F Corporate Center, Ortigas Center, Pasig City, Metro Manila",
    assignedTo: {
      name: "John Reyes",
      avatar: "/images/user/user-22.jpg",
    },
  },
  {
    id: 2,
    name: "Charlotte Anderson",
    avatar: "/images/user/user-23.jpg",
    role: "Business Owner",
    lastActivity: "1d ago",
    email: "charlotte@andersonholdings.com",
    phone: "+63 917 555 0182",
    company: "Anderson Holdings",
    source: "Organic",
    annualRevenue: "₱36M",
    owner: {
      name: "Mark Santos",
      avatar: "/images/user/user-24.jpg",
    },
    status: "Qualified",
    interestLevel: "Medium",
    dateCreated: "12 Mar, 2025",
    address: "Makati Avenue, Makati City, Metro Manila",
    assignedTo: {
      name: "Mia Cruz",
      avatar: "/images/user/user-25.jpg",
    },
  },
  {
    id: 3,
    name: "Ethan Brown",
    avatar: "/images/user/user-26.jpg",
    role: "Investor",
    lastActivity: "18 Jul, 2026",
    email: "ethan@email.com",
    phone: "+63 917 555 0111",
    company: "Individual",
    source: "Outbound",
    annualRevenue: "₱50M",
    owner: {
      name: "Ana Dela Cruz",
      avatar: "/images/user/user-27.jpg",
    },
    status: "Contacted",
    interestLevel: "High",
    dateCreated: "01 Jan, 2024",
    address: "Quezon City, Metro Manila",
    assignedTo: {
      name: "Sarah Lim",
      avatar: "/images/user/user-21.jpg",
    },
  },
];

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const leadsQuery = useQuery({
    queryKey: ["crm", "leads"],
    queryFn: async () => leads,
    initialData: leads,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const leadData = leadsQuery.data;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return leads;
    }

    return leadData.filter((lead) => {
      const searchableValues = [
        lead.name,
        lead.role,
        lead.lastActivity,
        lead.email,
        lead.phone,
        lead.company,
        lead.source,
        lead.owner.name,
        lead.assignedTo.name,
        lead.status,
        lead.interestLevel,
        lead.dateCreated,
        lead.address,
      ];

      return searchableValues
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [leadData, searchTerm]);

  const leadTable = useReactTable({
    data: filteredLeads,
    columns: leadColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalItems = filteredLeads.length;

  const totalPages = Math.max(
    Math.ceil(totalItems / itemsPerPage),
    1,
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems,
  );

  const currentData = leadTable
    .getRowModel()
    .rows.slice(startIndex, endIndex)
    .map((row) => row.original);

  const isCurrentPageSelected =
    currentData.length > 0 &&
    currentData.every((lead) => selectedIds.includes(lead.id));

  const toggleSelected = (id: number) => {
    setSelectedIds((currentSelectedIds) => {
      if (currentSelectedIds.includes(id)) {
        return currentSelectedIds.filter(
          (selectedId) => selectedId !== id,
        );
      }

      return [...currentSelectedIds, id];
    });
  };

  const toggleCurrentPage = () => {
    const currentPageIds = currentData.map((lead) => lead.id);

    setSelectedIds((currentSelectedIds) => {
      if (isCurrentPageSelected) {
        return currentSelectedIds.filter(
          (id) => !currentPageIds.includes(id),
        );
      }

      return Array.from(
        new Set([...currentSelectedIds, ...currentPageIds]),
      );
    });
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseLeadSheet = () => {
    setSelectedLead(null);
  };

  return (
    <>
      <PageMeta
        title="CDEX Leads | Caballes-Go Securities, Inc."
        description="Manage and track CRM leads for Caballes-Go Securities, Inc."
      />

      <AppBreadcrumb pageName="Leads" />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SearchField
              name="leadSearch"
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Search leads..."
              containerClassName="min-w-0 flex-1 md:w-[280px] md:flex-none"
              className="!h-9 !py-2 !pr-3.5 !pl-10"
              autoComplete="off"
            />

            <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <FilterIcon />
                Filter
              </button>

              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <ExportIcon />
                Export
              </button>

              <Link
                to="/leads/new"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <PlusIcon />
                Add Lead
              </Link>
            </div>
          </div>
        </div>

        <LeadTable
          leads={currentData}
          selectedIds={selectedIds}
          isCurrentPageSelected={isCurrentPageSelected}
          onToggleSelected={toggleSelected}
          onToggleCurrentPage={toggleCurrentPage}
          onSelectLead={handleSelectLead}
        />

        <LeadCards
          leads={currentData}
          onSelectLead={handleSelectLead}
        />

        <LeadFooter
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      <LeadPreview
        lead={selectedLead}
        onClose={handleCloseLeadSheet}
      />
    </>
  );
}
