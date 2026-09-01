import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useSearch } from "../hooks/useSearch";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "dayjs";

import { useActivitiesQuery } from "../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import ActivityPagination from "../components/activities/ActivityPagination";
import ActivityTimeline from "../components/activities/ActivityTimeline";
import ActivityToolbar from "../components/activities/ActivityToolbar";
import {
  activityCategories,
  type ActivityCategoryFilter,
  type ActivityOutcomeFilter,
} from "../types/Activities";
import { downloadCsv } from "../utils/csv";
import { groupByActivityDate } from "../utils/activity";
import { useCan } from "../hooks/auth/useCan";
import CrmFilterControls, { toFilterOptions } from "../components/crm/CrmFilterControls";

export default function Activities() {
  const { search } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  const activitiesQuery = useActivitiesQuery();
  const canExport = useCan("activities.export");
  const events = activitiesQuery.data ?? [];

  const [category, setCategory] = useState<ActivityCategoryFilter>((searchParams.get("category") as ActivityCategoryFilter) || "All");
  const [outcome, setOutcome] = useState<ActivityOutcomeFilter>((searchParams.get("outcome") as ActivityOutcomeFilter) || "All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
    setPage(1);
    if (key === "category") setCategory((value || "All") as ActivityCategoryFilter);
    if (key === "outcome") setOutcome((value || "All") as ActivityOutcomeFilter);
  };

  const filteredEvents = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const targetFilter = (searchParams.get("target") ?? "")
      .trim()
      .toLowerCase();
    const actorFilter = (searchParams.get("actor") ?? "").trim().toLowerCase();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    return events.filter(
      (event) =>
        (category === "All" || event.category === category) &&
        (outcome === "All" || event.outcome === outcome) &&
        (!targetFilter || event.target.toLowerCase().includes(targetFilter)) &&
        (!actorFilter || event.actor.toLowerCase().includes(actorFilter)) &&
        (!dateFrom || !dayjs(event.timestamp).isBefore(dayjs(dateFrom), "day")) &&
        (!dateTo || !dayjs(event.timestamp).isAfter(dayjs(dateTo), "day")) &&
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
  }, [category, events, outcome, debouncedSearch, searchParams]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / itemsPerPage),
  );
  const safePage = Math.min(page, totalPages);
  const visibleEvents = filteredEvents.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );
  const groupedEvents = useMemo(
    () => groupByActivityDate(visibleEvents),
    [visibleEvents],
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
    downloadCsv("cdex-audit-log.csv", rows[0], rows.slice(1));
  };

  return (
    <>
      <PageMeta
        title="CDEX Activities"
        description="Review relationship work, outcomes, and recent CRM activity."
      />
      <AppBreadcrumb pageName="Activities" />
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ActivityToolbar
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          filters={
            <CrmFilterControls
              filters={[
                { key: "category", label: "Category", value: searchParams.get("category") ?? "", options: toFilterOptions(activityCategories) },
                { key: "outcome", label: "Outcome", value: searchParams.get("outcome") ?? "", options: toFilterOptions(["Success", "Warning", "Denied"]) },
                { key: "actor", label: "Actor", value: searchParams.get("actor") ?? "", options: toFilterOptions(events.map((event) => event.actor)) },
                { key: "action", label: "Action", value: searchParams.get("action") ?? "", options: toFilterOptions(events.map((event) => event.action)) },
                { key: "target", label: "Target", value: searchParams.get("target") ?? "", options: toFilterOptions(events.map((event) => event.target)) },
              ]}
              dateFrom={searchParams.get("dateFrom") ?? ""}
              dateTo={searchParams.get("dateTo") ?? ""}
              onChange={updateFilter}
              onDateChange={(from, to) => {
                const next = new URLSearchParams(searchParams);
                if (from) next.set("dateFrom", from); else next.delete("dateFrom");
                if (to) next.set("dateTo", to); else next.delete("dateTo");
                next.delete("page");
                setSearchParams(next);
                setPage(1);
              }}
            />
          }
          onExport={exportAuditLog}
          canExport={canExport}
        />
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
          <ActivityTimeline
            groups={groupedEvents}
            expandedId={expandedId}
            onToggleDetails={(id) =>
              setExpandedId(expandedId === id ? null : id)
            }
            isLoading={activitiesQuery.isLoading}
          />
        </div>
        <ActivityPagination
          page={safePage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setPage(1);
          }}
        />
      </section>
    </>
  );
}
