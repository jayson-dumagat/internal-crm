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

export default function Activities() {
  const { search } = useSearch();
  const [searchParams] = useSearchParams();

  const activitiesQuery = useActivitiesQuery();
  const events = activitiesQuery.data ?? [];

  const [category, setCategory] = useState<ActivityCategoryFilter>("All");
  const [outcome, setOutcome] = useState<ActivityOutcomeFilter>("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const filteredEvents = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const targetFilter = (searchParams.get("target") ?? "")
      .trim()
      .toLowerCase();
    const actorFilter = (searchParams.get("actor") ?? "").trim().toLowerCase();
    const dateFilter = searchParams.get("date");
    return events.filter(
      (event) =>
        (category === "All" || event.category === category) &&
        (outcome === "All" || event.outcome === outcome) &&
        (!targetFilter || event.target.toLowerCase().includes(targetFilter)) &&
        (!actorFilter || event.actor.toLowerCase().includes(actorFilter)) &&
        (!dateFilter ||
          dayjs(event.timestamp).isSame(dayjs(dateFilter), "day")) &&
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
        description="Review security and CRM audit activity for CDEX."
      />
      <AppBreadcrumb pageName="Activities" />
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ActivityToolbar
          category={category}
          outcome={outcome}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCategoryChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          onOutcomeChange={(value) => {
            setOutcome(value);
            setPage(1);
          }}
          onExport={exportAuditLog}
          categories={activityCategories}
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
