import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CreateLeadInput } from "../../api/crm";
import type { Lead } from "../../pages/CrmLeads/Leads";
import Sheet from "../ui/sheet/Sheet";

const leadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  role: z.string().optional(),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  annualRevenue: z.string().optional(),
  status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"]),
  interestLevel: z.enum(["High", "Medium", "Low"]),
  address: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;
const inputClassName = "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function LeadFormSheet({
  isOpen,
  lead,
  onClose,
  onSubmit,
  isPending,
}: {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSubmit: (input: CreateLeadInput, lead?: Lead) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: "", role: "", email: "", phone: "", company: "", source: "Manual", annualRevenue: "", status: "New", interestLevel: "Low", address: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(lead ? {
      name: lead.name,
      role: lead.role === "—" ? "" : lead.role,
      email: lead.email,
      phone: lead.phone === "—" ? "" : lead.phone,
      company: lead.company === "Individual" ? "" : lead.company,
      source: lead.source,
      annualRevenue: lead.annualRevenue ?? "",
      status: lead.status,
      interestLevel: lead.interestLevel,
      address: lead.address === "—" ? "" : lead.address,
    } : undefined);
  }, [form, isOpen, lead]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({ ...values, role: values.role || null, phone: values.phone || null, company: values.company || null, source: values.source || null, annualRevenue: values.annualRevenue || null, address: values.address || null }, lead ?? undefined);
  });

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={lead ? "Edit Lead" : "Add Lead"} description={lead ? "Update lead details and qualification." : "Add a prospect to your lead pipeline."} side="right" className="w-full sm:max-w-2xl">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" error={form.formState.errors.name?.message}><input autoFocus {...form.register("name")} className={inputClassName} placeholder="Full name" /></Field>
          <Field label="Role / Job Title"><input {...form.register("role")} className={inputClassName} placeholder="Investor" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} className={inputClassName} placeholder="name@company.com" /></Field>
          <Field label="Phone"><input {...form.register("phone")} className={inputClassName} placeholder="+63 917 555 0000" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company"><input {...form.register("company")} className={inputClassName} placeholder="Company or institution" /></Field>
          <Field label="Lead Source"><input {...form.register("source")} className={inputClassName} placeholder="Referral, Manual, Event" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status"><select {...form.register("status")} className={inputClassName}><option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option></select></Field>
          <Field label="Interest Level"><select {...form.register("interestLevel")} className={inputClassName}><option>High</option><option>Medium</option><option>Low</option></select></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Annual Revenue"><input {...form.register("annualRevenue")} className={inputClassName} placeholder="PHP 25M" /></Field>
          <Field label="Address"><input {...form.register("address")} className={inputClassName} placeholder="City, country" /></Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">Cancel</button><button type="submit" disabled={isPending} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50">{isPending ? "Saving..." : lead ? "Save Changes" : "Add Lead"}</button></div>
      </form>
    </Sheet>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>;
}
