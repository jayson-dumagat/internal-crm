import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CreateLeadInput, LeadRecord } from "../../api/crm";
import { useUploadLeadAvatar } from "../../hooks/crm/useCrmDirectory";
import Avatar from "../ui/avatar/Avatar";
import { InfoIcon } from "../../icons";
import Sheet from "../ui/sheet/Sheet";
import type { Lead } from "../../pages/CrmLeads/Leads";

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
  onSubmit: (input: CreateLeadInput, lead?: Lead) => Promise<LeadRecord>;
  isPending: boolean;
}) {
  const uploadAvatar = useUploadLeadAvatar();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      company: "",
      source: "Manual",
      annualRevenue: "",
      status: "New",
      interestLevel: "Low",
      address: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(
      lead
        ? {
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
          }
        : undefined,
    );
  }, [form, isOpen, lead]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: ([file]) => {
      if (!file) return;
      setAvatarFile(file);
      setAvatarPreview((previousPreview) => {
        if (previousPreview?.startsWith("blob:")) URL.revokeObjectURL(previousPreview);
        return URL.createObjectURL(file);
      });
    },
    onDropRejected: () => toast.error("Please choose an image smaller than 5 MB."),
  });

  const closeSheet = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    onClose();
  };

  const contactImage = lead?.avatar ?? null;
  const submit = form.handleSubmit(async (values) => {
    try {
      const savedLead = await onSubmit(
        {
          ...values,
          role: values.role || null,
          phone: values.phone || null,
          company: values.company || null,
          source: values.source || null,
          annualRevenue: values.annualRevenue || null,
          address: values.address || null,
        },
        lead ?? undefined,
      );

      if (avatarFile) {
        await uploadAvatar.mutateAsync({ id: savedLead.id, file: avatarFile });
      }

      toast.success(lead ? "Lead updated successfully." : "Lead added successfully.");
      closeSheet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${lead ? "update" : "add"} lead.`);
    }
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={closeSheet}
      title={lead ? "Edit Lead" : "Add Lead"}
      description={lead ? "Update lead details and qualification." : "Add a prospect to your lead pipeline."}
      side="right"
      className="w-full sm:max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-6">
        <FormSection title="Basic information" description="Identify the lead and their organization.">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <input autoFocus {...form.register("name")} className={inputClassName} placeholder="Full name" />
          </Field>
          <div {...getRootProps()} className={`flex cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-3 transition ${isDragActive ? "border-brand-500 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10" : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-800 dark:hover:bg-white/[0.03]"}`}>
            <input {...getInputProps()} />
            <Avatar src={avatarFile ? avatarPreview : contactImage} alt={lead?.name || "Lead"} colorKey="lead-avatar" size="large" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{isDragActive ? "Drop image here" : "Add lead image"}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP up to 5 MB. If omitted, contact image or initials will be shown.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role / Job Title"><input {...form.register("role")} className={inputClassName} placeholder="Investor" /></Field>
            <Field label="Company"><input {...form.register("company")} className={inputClassName} placeholder="Company or institution" /></Field>
          </div>
        </FormSection>

        <FormSection title="Contact details" description="How the relationship team can reach this lead.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} className={inputClassName} placeholder="name@company.com" /></Field>
            <Field label="Phone"><input {...form.register("phone")} className={inputClassName} placeholder="+63 917 555 0000" /></Field>
          </div>
          <Field label="Address"><input {...form.register("address")} className={inputClassName} placeholder="City, country" /></Field>
        </FormSection>

        <FormSection title="Lead qualification" description="Capture the source, value, interest, and current lead status.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lead Source"><input {...form.register("source")} className={inputClassName} placeholder="Referral, Manual, Event" /></Field>
            <Field label="Annual Revenue"><input {...form.register("annualRevenue")} className={inputClassName} placeholder="PHP 25M" /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Status"><select {...form.register("status")} className={inputClassName}><option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option></select></Field>
            <Field label="Interest Level"><select {...form.register("interestLevel")} className={inputClassName}><option>High</option><option>Medium</option><option>Low</option></select></Field>
          </div>
        </FormSection>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button type="button" onClick={closeSheet} className={secondaryButtonClassName}>Cancel</button>
          <button type="submit" disabled={isPending || uploadAvatar.isPending} className={primaryButtonClassName}>{isPending || uploadAvatar.isPending ? "Saving..." : lead ? "Save Changes" : "Add Lead"}</button>
        </div>
      </form>
    </Sheet>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 dark:border-white/[0.05]"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3><span title={description} aria-label={description} className="inline-flex cursor-help text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400"><InfoIcon className="size-4" /></span></div>{children}</section>;
}

const secondaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";
const primaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
