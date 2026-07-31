import { useMemo, useState } from "react";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import SearchField from "../../components/ui/search/Search";
import { ExportIcon, FilterIcon } from "../../icons";

type AuditOutcome = "Success" | "Warning" | "Denied";
type AuditCategory =
  | "Authentication"
  | "Client"
  | "KYC"
  | "Pipeline"
  | "Task"
  | "System";

type AuditEvent = {
  id: string;
  actor: string;
  avatar: string;
  action: string;
  target: string;
  category: AuditCategory;
  outcome: AuditOutcome;
  timestamp: string;
  relativeTime: string;
  ipAddress: string;
  details: string;
};

const auditEvents: AuditEvent[] = [
  {
    id: "AUD-2026-00841",
    actor: "Sarah Lim",
    avatar: "/images/user/user-21.jpg",
    action: "approved KYC review",
    target: "Sophia Martinez",
    category: "KYC",
    outcome: "Success",
    timestamp: "31 Jul 2026, 10:42:18 AM",
    relativeTime: "Just now",
    ipAddress: "172.17.32.24",
    details: "KYC status changed from Under Review to Approved.",
  },
  {
    id: "AUD-2026-00840",
    actor: "Mark Santos",
    avatar: "/images/user/user-24.jpg",
    action: "updated contact record",
    target: "Charlotte Anderson",
    category: "Client",
    outcome: "Success",
    timestamp: "31 Jul 2026, 10:31:05 AM",
    relativeTime: "11 minutes ago",
    ipAddress: "172.17.32.18",
    details: "Preferred contact method changed from Phone to Email.",
  },
  {
    id: "AUD-2026-00839",
    actor: "Mia Cruz",
    avatar: "/images/user/user-25.jpg",
    action: "moved pipeline card",
    target: "Anderson Holdings",
    category: "Pipeline",
    outcome: "Success",
    timestamp: "31 Jul 2026, 10:14:44 AM",
    relativeTime: "27 minutes ago",
    ipAddress: "172.17.32.31",
    details: "Lead moved from Contacted to Qualified in the Deals pipeline.",
  },
  {
    id: "AUD-2026-00838",
    actor: "John Reyes",
    avatar: "/images/user/user-22.jpg",
    action: "attempted restricted export",
    target: "Client contact list",
    category: "System",
    outcome: "Denied",
    timestamp: "31 Jul 2026, 9:58:12 AM",
    relativeTime: "44 minutes ago",
    ipAddress: "172.17.32.42",
    details: "Export was blocked because the user lacks the Data Export permission.",
  },
  {
    id: "AUD-2026-00837",
    actor: "Ana Dela Cruz",
    avatar: "/images/user/user-27.jpg",
    action: "created follow-up task",
    target: "Ethan Brown",
    category: "Task",
    outcome: "Success",
    timestamp: "31 Jul 2026, 9:41:30 AM",
    relativeTime: "1 hour ago",
    ipAddress: "172.17.32.15",
    details: "Task created for risk-profile and suitability follow-up.",
  },
  {
    id: "AUD-2026-00836",
    actor: "Abram Schleifer",
    avatar: "/images/user/user-20.jpg",
    action: "signed in with Microsoft",
    target: "CDEX",
    category: "Authentication",
    outcome: "Success",
    timestamp: "31 Jul 2026, 9:22:07 AM",
    relativeTime: "1 hour ago",
    ipAddress: "172.17.32.11",
    details: "Interactive sign-in completed using Microsoft Entra ID.",
  },
  {
    id: "AUD-2026-00835",
    actor: "System",
    avatar: "/images/user/user-01.jpg",
    action: "flagged expiring document",
    target: "Northbridge Capital",
    category: "KYC",
    outcome: "Warning",
    timestamp: "31 Jul 2026, 8:00:00 AM",
    relativeTime: "3 hours ago",
    ipAddress: "Internal",
    details: "Proof of address will expire within 30 days.",
  },
];

const outcomeColor = {
  Success: "success",
  Warning: "warning",
  Denied: "error",
} as const;

const pageSize = 5;

export default function Activities() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditCategory | "All">("All");
  const [outcome, setOutcome] = useState<AuditOutcome | "All">("All");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return auditEvents.filter(
      (event) =>
        (category === "All" || event.category === category) &&
        (outcome === "All" || event.outcome === outcome) &&
        (!term ||
          [
            event.id,
            event.actor,
            event.action,
            event.target,
            event.category,
            event.ipAddress,
          ]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
  }, [category, outcome, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const visibleEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const exportAuditLog = () => {
    const header = ["ID", "Timestamp", "Actor", "Action", "Target", "Category", "Outcome", "IP Address"];
    const csv = [
      header,
      ...filteredEvents.map((event) => [
        event.id,
        event.timestamp,
        event.actor,
        event.action,
        event.target,
        event.category,
        event.outcome,
        event.ipAddress,
      ]),
    ]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cdex-audit-log.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageMeta
        title="CDEX Activities"
        description="Review security and CRM audit activity for CDEX."
      />
      <AppBreadcrumb pageName="Activities" />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 p-4 sm:p-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FilterIcon /> Filters
              </span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as AuditCategory | "All");
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="All">All categories</option>
                {["Authentication", "Client", "KYC", "Pipeline", "Task", "System"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                value={outcome}
                onChange={(event) => {
                  setOutcome(event.target.value as AuditOutcome | "All");
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="All">All outcomes</option>
                <option>Success</option>
                <option>Warning</option>
                <option>Denied</option>
              </select>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <SearchField
                value={search}
                onValueChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Search activity..."
                containerClassName="w-full sm:w-72"
              />
              <button
                type="button"
                onClick={exportAuditLog}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ExportIcon /> Export
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative">
            <div className="absolute top-6 bottom-6 left-5 w-px bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-6">
              {visibleEvents.map((event) => (
                <article key={event.id} className="relative flex gap-4">
                  <img
                    src={event.avatar}
                    alt={event.actor}
                    className="z-10 size-10 shrink-0 rounded-full object-cover ring-4 ring-white dark:ring-gray-900"
                  />
                  <div className="min-w-0 flex-1 rounded-xl border border-gray-100 p-4 dark:border-white/[0.05] dark:bg-gray-900/50">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge color={outcomeColor[event.outcome]} size="sm">
                            {event.outcome}
                          </Badge>
                          <Badge color="light" size="sm">{event.category}</Badge>
                          <span className="text-xs text-gray-400">{event.id}</span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-gray-800 dark:text-white/90">
                            {event.actor}
                          </span>{" "}
                          {event.action}{" "}
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {event.target}
                          </span>
                        </p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {event.relativeTime}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">{event.timestamp}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      className="mt-3 text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      {expandedId === event.id ? "Hide details" : "View details"}
                    </button>
                    {expandedId === event.id && (
                      <div className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-3 text-xs sm:grid-cols-[1fr_auto] dark:bg-white/[0.03]">
                        <p className="text-gray-600 dark:text-gray-300">{event.details}</p>
                        <p className="text-gray-500 dark:text-gray-400">IP: {event.ipAddress}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {visibleEvents.length} of {filteredEvents.length} events
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
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
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
