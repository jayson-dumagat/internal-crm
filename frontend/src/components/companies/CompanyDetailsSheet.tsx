import type { Company } from "../../types/Companies";
import type { CompanyRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";
import Sheet from "../ui/sheet/Sheet";

type CompanyDetailsSheetProps = { company: Company | null; canUpdate: boolean; onClose: () => void; onEdit: (company: CompanyRecord) => void };

export default function CompanyDetailsSheet({ company, canUpdate, onClose, onEdit }: CompanyDetailsSheetProps) {
  return <Sheet isOpen={Boolean(company)} onClose={onClose} title={company?.name ?? "Company details"} description="Review company relationship information." side="right" className="w-full sm:max-w-2xl xl:max-w-3xl">
    {company && <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Avatar src={company.logoUrl} alt={company.name} size="large" colorKey={`company-${company.id}`} />
        <div className="min-w-0"><h3 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">{company.name}</h3><p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{company.industry || "—"} · {company.location || "—"}</p></div>
        <Badge color={company.status === "Active" ? "success" : company.status === "Dormant" ? "light" : "warning"} size="sm">{company.status}</Badge>
      </div>
      <section className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">Company profile</h4><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{[["Location", company.location], ["Employees", company.employees], ["Revenue", company.revenue], ["Customer since", formatDisplayDate(company.customerSince)], ["Last activity", formatDisplayDate(company.lastActivity)], ["Website", company.website]].map(([label, value]) => <InfoItem key={label} label={label} value={String(value || "—")} />)}</div></section>
      <section className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Associated contacts <span className="ml-1 text-xs font-normal text-gray-400">{company.contacts.length}</span></h4>{company.contacts.length ? <div className="flex flex-wrap gap-3">{company.contacts.map((contact) => <div key={contact.name} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-white/[0.03]"><Avatar src={contact.avatar} alt={contact.name} size="xsmall" /><span className="max-w-40 truncate text-sm text-gray-700 dark:text-gray-300">{contact.name}</span></div>)}</div> : <p className="text-sm text-gray-500 dark:text-gray-400">No contacts linked yet.</p>}</section>
      <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" disabled={!canUpdate} onClick={() => onEdit(company as unknown as CompanyRecord)} className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40">Edit company</button></div>
    </div>}
  </Sheet>;
}

function InfoItem({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium text-gray-400">{label}</p><p className="mt-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p></div>; }
