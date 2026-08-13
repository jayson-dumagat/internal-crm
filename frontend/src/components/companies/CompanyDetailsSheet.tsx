import type { Company } from "../../types/Companies";
import type { CompanyRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import Avatar from "../ui/avatar/Avatar";
import Sheet from "../ui/sheet/Sheet";

type CompanyDetailsSheetProps = {
  company: Company | null;
  canUpdate: boolean;
  onClose: () => void;
  onEdit: (company: CompanyRecord) => void;
};

export default function CompanyDetailsSheet({ company, canUpdate, onClose, onEdit }: CompanyDetailsSheetProps) {
  return (
    <Sheet isOpen={Boolean(company)} onClose={onClose} title={company?.name ?? "Company details"} description="Review company relationship information." side="right" className="w-full sm:max-w-2xl">
      {company && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar src={company.logoUrl} alt={company.name} size="large" colorKey={`company-${company.id}`} />
            <div><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{company.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Location", company.location], ["Employees", company.employees], ["Revenue", company.revenue], ["Website", company.website], ["Customer since", formatDisplayDate(company.customerSince)], ["Status", company.status], ["Last activity", formatDisplayDate(company.lastActivity)], ["Contacts", String(company.contacts.length)]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p></div>)}
          </div>
          <button type="button" disabled={!canUpdate} onClick={() => onEdit(company as unknown as CompanyRecord)} className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white disabled:opacity-40">Edit company</button>
        </div>
      )}
    </Sheet>
  );
}
