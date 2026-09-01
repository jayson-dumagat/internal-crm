import dayjs from "dayjs";
import type { ActivityRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import { formatRelativeActivityTime } from "../../utils/activity";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";
import { DataLoadingSkeleton } from "../common/PageLoadingSkeleton";

const outcomeColor = {
  Success: "success",
  Warning: "warning",
  Denied: "error",
} as const;

type ActivityTimelineProps = {
  groups: Array<[string, ActivityRecord[]]>;
  expandedId: string | null;
  onToggleDetails: (id: string) => void;
  isLoading: boolean;
};

export default function ActivityTimeline({
  groups,
  expandedId,
  onToggleDetails,
  isLoading,
}: ActivityTimelineProps) {
  if (!groups.length) {
    if (isLoading) return <DataLoadingSkeleton rows={5} />;
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-500">
        No activities found.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 bottom-4 left-4 w-px bg-gray-200 dark:bg-gray-800" />
      {groups.map(([dateKey, dayEvents]) => (
        <div key={dateKey} className="mb-6 last:mb-0">
          <div className="mb-2.5 flex items-center gap-3 pl-1">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-white/[0.06] dark:text-gray-400">
              {dayjs(dateKey).isSame(dayjs(), "day")
                ? "Today"
                : dayjs(dateKey).format("DD MMMM YYYY")}
            </span>
            <span className="h-px flex-1 bg-gray-100 dark:bg-white/[0.05]" />
          </div>
          {dayEvents.map((event) => {
            const expanded = expandedId === event.id;
            return (
              <article
                key={event.id}
                className="relative mb-3 flex gap-3 last:mb-0"
              >
                <div className="z-10 shrink-0">
                  <Avatar src={event.avatar} alt={event.actor} size="small" />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-theme-xs transition hover:border-gray-200 hover:shadow-theme-sm dark:border-white/[0.05] dark:bg-gray-900 dark:hover:border-white/[0.1]">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge color="light" size="sm">
                      {event.category}
                    </Badge>
                    <Badge color={outcomeColor[event.outcome]} size="sm">
                      {event.outcome}
                    </Badge>
                    <span className="text-xs text-gray-400 lg:ml-auto">
                      {formatRelativeActivityTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {event.actor}
                    </span>
                    <span>
                      {event.action}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {event.target}
                    </span>
                  </p>
                  {event.details && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {event.details}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                      {formatDisplayDate(event.timestamp)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onToggleDetails(event.id)}
                      className="text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      {expanded ? "Hide context" : "View context"}
                    </button>
                  </div>
                  {expanded && (
                    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs sm:flex-row sm:justify-between dark:border-white/[0.05] dark:bg-white/[0.03]">
                      <div className="min-w-0">
                        <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">
                          Context
                        </p>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                          {event.details || "No additional context was provided."}
                        </p>
                      </div>
                      <p className="shrink-0 self-end text-gray-500 sm:self-center">
                        {event.ipAddress}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </div>
  );
}
