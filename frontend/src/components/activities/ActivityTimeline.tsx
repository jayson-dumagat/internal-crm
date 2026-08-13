import dayjs from "dayjs";
import type { ActivityRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import { formatRelativeActivityTime } from "../../utils/activity";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";

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
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-500">
        {isLoading ? "Loading activities..." : "No activities found."}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-5 bottom-5 left-5 w-px bg-gray-200 dark:bg-gray-800" />
      {groups.map(([dateKey, dayEvents]) => (
        <div key={dateKey} className="mb-6 last:mb-0">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {dayjs(dateKey).isSame(dayjs(), "day") ? "Today" : dayjs(dateKey).format("DD MMMM YYYY")}
            </span>
            <span className="h-px flex-1 bg-gray-100 dark:bg-white/[0.05]" />
          </div>
          {dayEvents.map((event) => {
            const expanded = expandedId === event.id;
            return (
              <article key={event.id} className="relative mb-5 flex gap-4 last:mb-0">
                <div className="z-10 shrink-0"><Avatar src={event.avatar} alt={event.actor} size="medium" /></div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">{event.category}</span>
                    <Badge color={outcomeColor[event.outcome]} size="sm">{event.outcome}</Badge>
                    <span className="text-xs text-gray-400 lg:ml-auto">{formatRelativeActivityTime(event.timestamp)}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{event.actor}</h3>
                    <span className="text-theme-sm text-gray-500 dark:text-gray-400">{event.action}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2">
                    <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">{event.target}</span>
                    <span className="text-xs text-gray-400">ID {event.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatDisplayDate(event.timestamp)}</p>
                  <button type="button" onClick={() => onToggleDetails(event.id)} className="mt-2 text-xs font-medium text-brand-500 hover:text-brand-600">
                    {expanded ? "Hide details" : "View details"}
                  </button>
                  {expanded && (
                    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs sm:flex-row sm:justify-between dark:border-white/[0.05] dark:bg-white/[0.03]">
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">{event.details}</p>
                      <p className="shrink-0 text-gray-500">IP: {event.ipAddress}</p>
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
