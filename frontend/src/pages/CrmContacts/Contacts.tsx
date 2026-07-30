import ContactTable from "../../components/contacts/contact-table";
import PageMeta from "../../components/common/PageMeta";

export default function Contacts() {
  const metrics = [
    { label: "Total Contacts", value: 6 },
    { label: "Prospects", value: 1 },
    { label: "Active Clients", value: 3 },
    { label: "KYC Pending", value: 1 },
  ];

  return (
    <>
      <PageMeta
        title="CDEX Contacts | Caballes-Go Securities, Inc."
        description="Manage investor contacts, relationship scoring, preferences, and activities."
      />
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 sm:text-xl dark:text-white/90">
              Overview
            </h2>
            <p className="mt-1 hidden text-sm text-gray-500 sm:block dark:text-gray-400">
              Track and manage your contacts
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-xs transition hover:bg-brand-600 sm:h-11 sm:w-auto sm:gap-2 sm:px-4"
          >
            <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10M10 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="hidden text-sm font-medium sm:inline">New Contact</span>
          </button>
        </div>
        <div className="grid grid-cols-2 border-t border-gray-200 sm:grid-cols-4 dark:border-gray-800">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`min-w-0 p-4 sm:p-5 ${index % 2 === 0 ? "border-r border-gray-200 dark:border-gray-800" : ""} ${index < 2 ? "border-b border-gray-200 sm:border-b-0 dark:border-gray-800" : ""} ${index > 0 ? "sm:border-l sm:border-gray-200 sm:dark:border-gray-800" : ""}`}
            >
              <p className="mb-1.5 truncate text-xs text-gray-400 sm:text-sm dark:text-gray-500">{metric.label}</p>
              <h3 className="text-2xl font-medium tracking-tight text-gray-800 sm:text-3xl dark:text-white/90">{metric.value}</h3>
            </div>
          ))}
        </div>
      </section>
      <ContactTable />
    </>
  );
}
