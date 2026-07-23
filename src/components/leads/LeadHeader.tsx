import { Link } from "react-router";

const leadMetrics = [
  {
    label: "Total Leads",
    value: 120,
  },
  {
    label: "New Leads",
    value: 10,
  },
  {
    label: "Qualified Leads",
    value: 24,
  },
  {
    label: "Lost Leads",
    value: 5,
  },
];

export default function LeadHeader() {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl dark:text-white/90">
            Overview
          </h2>

          <p className="mt-1 hidden text-sm text-gray-500 sm:block dark:text-gray-400">
            Track and manage your leads
          </p>
        </div>

        <Link
          to="/leads/new"
          aria-label="Create new lead"
          className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 focus-visible:ring-brand-500/20 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white transition focus-visible:ring-4 focus-visible:outline-none sm:h-11 sm:w-auto sm:gap-2 sm:px-4"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10.0002H15.0006M10.0002 5V15.0006"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="hidden text-sm font-medium sm:inline">
            New Lead
          </span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 border-t border-gray-200 sm:grid-cols-4 dark:border-gray-800">
        {leadMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className={[
              "min-w-0 p-4 sm:p-5",
              index % 2 === 0
                ? "border-r border-gray-200 dark:border-gray-800"
                : "",
              index < 2
                ? "border-b border-gray-200 sm:border-b-0 dark:border-gray-800"
                : "",
              index > 0
                ? "sm:border-l sm:border-gray-200 sm:dark:border-gray-800"
                : "",
              index === 2
                ? "sm:border-l sm:border-gray-200 sm:dark:border-gray-800"
                : "",
            ].join(" ")}
          >
            <p className="mb-1.5 truncate text-xs text-gray-400 sm:text-sm dark:text-gray-500">
              {metric.label}
            </p>

            <h3 className="text-2xl font-medium tracking-tight text-gray-800 sm:text-3xl dark:text-white/90">
              {metric.value.toLocaleString()}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}