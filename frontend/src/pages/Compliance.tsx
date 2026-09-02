import { useState, type FormEvent } from "react";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import SearchField from "../components/search/SearchField";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import Sheet from "../components/ui/sheet/Sheet";
import { DataLoadingSkeleton } from "../components/common/PageLoadingSkeleton";
import { useComplianceCasesQuery, useCreateComplianceCase, useUpdateComplianceCase } from "../hooks/crm/useBrokerage";
import { usePermission } from "../context/PermissionContext";
import { useToast } from "../hooks/useToast";
import { createComplianceInputSchema } from "../validations/brokerage";

const fieldClass = "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
const labelClass = "mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300";
const caseTypes = ["kyc_renewal", "suspicious_activity", "unusual_transaction", "watchlist", "suitability_exception", "dormant_account", "complaint", "supervisor_approval", "manual_override"];
const statuses = ["open", "in_review", "escalated", "resolved", "closed"];
const priorities = ["low", "medium", "high", "critical"];
const pretty = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (v) => v.toUpperCase());

export default function Compliance() {
  const [open, setOpen] = useState(false);
  const { canCreate } = usePermission();
  const toast = useToast();
  const query = useComplianceCasesQuery();
  const create = useCreateComplianceCase();
  const update = useUpdateComplianceCase();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { const input = createComplianceInputSchema.parse({ type: String(form.get("type")), status: String(form.get("status")), priority: String(form.get("priority")), title: String(form.get("title")), description: String(form.get("description") || "") || null, dueAt: String(form.get("dueAt") || "") || null, contactId: null, companyId: null, accountId: null, assignedToId: null, resolution: null }); await create.mutateAsync(input); toast.success("Compliance case created."); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create compliance case."); }
  };
  const setStatus = async (id: string, status: string) => { try { await update.mutateAsync({ id, input: { status: status as any } }); toast.success("Case status updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update case."); } };
  return <>
    <PageMeta title="Compliance queue | Caballes-Go Securities, Inc." description="Supervisory KYC, AML, suitability, and client risk queue." />
    <AppBreadcrumb pageName="Compliance" />
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Compliance queue</h1><p className="mt-1 text-sm text-gray-500">Review exceptions and supervisory work without changing core brokerage records.</p></div><div className="flex items-center gap-2"><SearchField />{canCreate("compliance") && <Button size="sm" onClick={() => setOpen(true)}>Add case</Button>}</div></div>
      {query.isLoading ? <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"><DataLoadingSkeleton rows={6} /></div> : query.error ? <div className="rounded-xl border border-error-200 bg-error-50 p-5 text-sm text-error-600">{query.error instanceof Error ? query.error.message : "Unable to load compliance queue."}</div> : <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-gray-100 bg-gray-50/80 text-[11px] uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"><tr><th className="px-4 py-3">Case</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{(query.data ?? []).map((item) => <tr key={item.id} className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"><span className="font-medium text-gray-800 dark:text-white">{item.title}</span><span className="mt-0.5 block max-w-[280px] truncate text-xs text-gray-500">{item.description || "No description"}</span></td><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">{pretty(item.type)}</td><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"><Badge color={item.priority === "critical" || item.priority === "high" ? "error" : item.priority === "medium" ? "warning" : "light"} size="sm">{pretty(item.priority)}</Badge></td><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"><select aria-label={`Status for ${item.title}`} value={item.status} onChange={(event) => void setStatus(item.id, event.target.value)} className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs dark:border-gray-700"><option value={item.status}>{pretty(item.status)}</option>{statuses.filter((value) => value !== item.status).map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></td><td className="border-b border-gray-100 px-4 py-3 text-xs dark:border-gray-800">{item.dueAt || "—"}</td><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">{(item.assignedTo as { name?: string } | null)?.name || "Unassigned"}</td><td className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"><Badge color="light" size="sm">Supervisory</Badge></td></tr>)}</tbody></table>{!query.data?.length && <div className="p-10 text-center text-sm text-gray-500">No compliance cases match the current filters.</div>}</div>}
    </div>
    <Sheet isOpen={open} onClose={() => setOpen(false)} title="Add compliance case" className="sm:max-w-2xl"><form onSubmit={submit} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label><span className={labelClass}>Case type *</span><select name="type" required className={fieldClass}>{caseTypes.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label><label><span className={labelClass}>Priority</span><select name="priority" className={fieldClass}>{priorities.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label><label><span className={labelClass}>Initial status</span><select name="status" className={fieldClass}>{statuses.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label><label><span className={labelClass}>Due date</span><input name="dueAt" type="date" className={fieldClass} /></label></div><label><span className={labelClass}>Title *</span><input name="title" required maxLength={255} className={fieldClass} /></label><label><span className={labelClass}>Context</span><textarea name="description" maxLength={10000} rows={6} className={`${fieldClass} h-auto py-2`} /></label><div className="flex justify-end"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Create case"}</Button></div></form></Sheet>
  </>;
}
