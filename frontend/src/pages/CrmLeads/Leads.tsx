import { useEffect, useMemo, useState } from "react";

import PageMeta from "../../components/common/PageMeta";
import LeadCards from "../../components/leads/LeadCards";
import LeadFooter from "../../components/leads/LeadFooter";
import LeadHeader from "../../components/leads/LeadHeader";
import LeadTable from "../../components/leads/LeadTable";
import SearchField from "../../components/ui/search/Search";

import { ExportIcon, FilterIcon } from "../../icons";
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

const ITEMS_PER_PAGE = 10;

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return leads;
    }

    return leads.filter((lead) => {
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
  }, [searchTerm]);

  const totalItems = filteredLeads.length;

  const totalPages = Math.max(
    Math.ceil(totalItems / ITEMS_PER_PAGE),
    1,
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    totalItems,
  );

  const startEntry = totalItems === 0 ? 0 : startIndex + 1;

  const currentData = filteredLeads.slice(startIndex, endIndex);

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

      <LeadHeader />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <SearchField
                name="leadSearch"
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder="Search leads..."
                containerClassName="min-w-0 flex-1 sm:w-72 sm:flex-none"
                autoComplete="off"
              />

              <div className="flex shrink-0 items-center gap-2 md:hidden">
                <button
                  type="button"
                  aria-label="Filter leads"
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                >
                  <FilterIcon />
                </button>

                <button
                  type="button"
                  aria-label="Export leads"
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                >
                  <ExportIcon />
                </button>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              >
                <FilterIcon />
                Filter
              </button>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              >
                <ExportIcon />
                Export
              </button>
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
          startEntry={startEntry}
          endIndex={endIndex}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      <LeadPreview
        lead={selectedLead}
        onClose={handleCloseLeadSheet}
      />
    </>
  );
}