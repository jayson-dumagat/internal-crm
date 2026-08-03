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

export default function Activities() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditCategory | "All">("All");
  const [outcome, setOutcome] = useState<AuditOutcome | "All">("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / itemsPerPage),
  );
  const visibleEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SearchField
              name="activitySearch"
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search activities..."
              containerClassName="min-w-0 flex-1 md:w-[280px] md:flex-none"
              className="!h-9 !py-2 !pr-3.5 !pl-10"
              autoComplete="off"
            />

            <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
              <button
                type="button"
                aria-expanded={showFilters}
                onClick={() => setShowFilters((current) => !current)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <FilterIcon />
                Filter
              </button>
              <button
                type="button"
                onClick={exportAuditLog}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <ExportIcon />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/[0.05]">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as AuditCategory | "All");
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="All">All outcomes</option>
                <option>Success</option>
                <option>Warning</option>
                <option>Denied</option>
              </select>
              {(category !== "All" || outcome !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setOutcome("All");
                    setPage(1);
                  }}
                  className="h-9 rounded-lg px-3 text-sm font-medium text-brand-500 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {visibleEvents.length ? (
            visibleEvents.map((event) => (
              <article
                key={event.id}
                className="group px-4 py-3 transition-colors hover:bg-gray-50 sm:px-5 dark:hover:bg-white/[0.03]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={event.avatar}
                      alt={event.actor}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-theme-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-800 dark:text-white/90">
                          {event.actor}
                        </span>{" "}
                        {event.action}{" "}
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {event.target}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">{event.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-12 lg:justify-end lg:pl-0">
                    <Badge color="light" size="sm">{event.category}</Badge>
                    <Badge color={outcomeColor[event.outcome]} size="sm">{event.outcome}</Badge>
                    <div className="min-w-[145px] text-left lg:text-right">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {event.relativeTime}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{event.timestamp}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      className="text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      {expandedId === event.id ? "Hide details" : "View details"}
                    </button>
                  </div>
                </div>

                {expandedId === event.id && (
                  <div className="mt-3 ml-12 flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between dark:bg-white/[0.03]">
                    <p className="text-gray-600 dark:text-gray-300">{event.details}</p>
                    <p className="text-gray-500 dark:text-gray-400">IP: {event.ipAddress}</p>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-500 sm:px-5 dark:text-gray-400">
              No activities found.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Show
            <select
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:bg-gray-900"
            >
              {[5, 8, 10].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            entries
          </label>
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
