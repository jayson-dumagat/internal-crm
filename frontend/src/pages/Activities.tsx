import { useMemo, useState } from "react";
import { useSearch } from "../context/SearchContext";
import {useDebounce } from "../hooks/useDebounce";
import dayjs from "dayjs";

import type { ActivityRecord } from "../api/crm";
import { useActivitiesQuery } from "../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import Avatar from "../components/ui/avatar/Avatar";
import Badge from "../components/ui/badge/Badge";
import SearchField from "../components/search/SearchField";
import { ExportIcon, FilterIcon } from "../icons";
import { formatDisplayDate } from "../utils/date";

const outcomeColor = {
  Success: "success",
  Warning: "warning",
  Denied: "error",
} as const;
const categories: ActivityRecord["category"][] = [
  "Authentication",
  "Client",
  "KYC",
  "Pipeline",
  "Task",
  "System",
];

export default function Activities() {
  const { search } = useSearch();

  const activitiesQuery = useActivitiesQuery();
  const events = activitiesQuery.data ?? [];

  const [category, setCategory] = useState<ActivityRecord["category"] | "All">(
    "All",
  );
  const [outcome, setOutcome] = useState<ActivityRecord["outcome"] | "All">(
    "All",
  );
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const filteredEvents = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return events.filter(
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
  }, [category, events, outcome, debouncedSearch]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / itemsPerPage),
  );
  const safePage = Math.min(page, totalPages);
  const visibleEvents = filteredEvents.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );
  const exportAuditLog = () => {
    const rows = [
      [
        "ID",
        "Timestamp",
        "Actor",
        "Action",
        "Target",
        "Category",
        "Outcome",
        "IP Address",
      ],
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
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cdex-audit-log.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const relativeTime = (timestamp: string) => {
    const date = dayjs(timestamp);
    if (!date.isValid()) return "—";
    const minutes = dayjs().diff(date, "minute");
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = dayjs().diff(date, "hour");
    if (hours < 24) return `${hours} hours ago`;
    return formatDisplayDate(timestamp);
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
            <SearchField/>
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
                onClick={exportAuditLog}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <ExportIcon /> Export
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-white/[0.05]">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target.value as ActivityRecord["category"] | "All",
                  );
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="All">All categories</option>
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                value={outcome}
                onChange={(event) => {
                  setOutcome(
                    event.target.value as ActivityRecord["outcome"] | "All",
                  );
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="All">All outcomes</option>
                <option>Success</option>
                <option>Warning</option>
                <option>Denied</option>
              </select>
            </div>
          )}
        </div>
        {activitiesQuery.isLoading && (
          <p className="px-5 py-3 text-sm text-gray-500">
            Loading activities...
          </p>
        )}
        {activitiesQuery.isError && (
          <p className="px-5 py-3 text-sm text-error-500">
            {activitiesQuery.error.message}
          </p>
        )}
        <div className="p-4 sm:p-5">
          {visibleEvents.length ? (
            <div className="relative">
              <div className="absolute top-5 bottom-5 left-5 w-px bg-gray-200 dark:bg-gray-800" />
              {visibleEvents.map((event) => (
                <article
                  key={event.id}
                  className="relative mb-5 flex gap-4 last:mb-0"
                >
                  <div className="z-10 shrink-0">
                    <Avatar
                      src={event.avatar}
                      alt={event.actor}
                      size="medium"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
                        {event.category}
                      </span>
                      <Badge color={outcomeColor[event.outcome]} size="sm">
                        {event.outcome}
                      </Badge>
                      <span className="text-xs text-gray-400 lg:ml-auto">
                        {relativeTime(event.timestamp)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {event.actor}
                      </h3>
                      <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                        {event.action}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2">
                      <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                        {event.target}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID {event.id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDisplayDate(event.timestamp)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expandedId === event.id ? null : event.id)
                      }
                      className="mt-2 text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      {expandedId === event.id
                        ? "Hide details"
                        : "View details"}
                    </button>
                    {expandedId === event.id && (
                      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs sm:flex-row sm:justify-between dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                          {event.details}
                        </p>
                        <p className="shrink-0 text-gray-500">
                          IP: {event.ipAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              {activitiesQuery.isLoading
                ? "Loading activities..."
                : "No activities found."}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Show{" "}
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
            </select>{" "}
            entries
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
              {safePage}
            </span>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
