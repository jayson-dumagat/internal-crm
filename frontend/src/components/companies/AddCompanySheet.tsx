import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CompanyRecord } from "../../api/crm";
import Sheet from "../ui/sheet/Sheet";
import { useCreateCompany, useUpdateCompany, useUploadCompanyLogo } from "../../hooks/crm/useCrmDirectory";
import Avatar from "../ui/avatar/Avatar";
import { InfoIcon } from "../../icons";

const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(255),
  industry: z.string().max(200).optional(),
  location: z.string().max(255).optional(),
  employees: z.string().max(50).optional(),
  revenue: z.string().max(100).optional(),
  website: z.string().max(500).optional(),
  customerSince: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["Active", "Prospect", "Dormant"]),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const inputClassName =
  "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AddCompanySheet({
  isOpen,
  onClose,
  company,
}: {
  isOpen: boolean;
  onClose: () => void;
  company?: CompanyRecord | null;
}) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const uploadLogo = useUploadCompanyLogo();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      industry: "",
      location: "",
      employees: "",
      revenue: "",
      website: "",
      customerSince: "",
      tags: "",
      status: "Prospect",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(company ? {
      name: company.name,
      industry: company.industry === "—" ? "" : company.industry,
      location: company.location === "—" ? "" : company.location,
      employees: company.employees === "—" ? "" : company.employees,
      revenue: company.revenue === "—" ? "" : company.revenue,
      website: company.website === "—" ? "" : company.website,
      customerSince: company.customerSince && company.customerSince !== "—" ? company.customerSince : "",
      tags: company.tags.join(", "),
      status: company.status,
    } : undefined);
  }, [company, form, isOpen]);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: ([file]) => {
      if (!file) return;
      setLogoFile(file);
      setLogoPreview((previousPreview) => {
        if (previousPreview?.startsWith("blob:")) URL.revokeObjectURL(previousPreview);
        return URL.createObjectURL(file);
      });
    },
    onDropRejected: () => toast.error("Please choose an image smaller than 5 MB."),
  });

  const displayedLogo = logoFile ? logoPreview : company?.logoUrl ?? null;
  const closeSheet = () => {
    setLogoFile(null);
    setLogoPreview(null);
    onClose();
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      const input = {
        ...values,
        tags: values.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) ?? [],
      };
      const savedCompany = company
        ? await updateCompany.mutateAsync({ id: company.id, input })
        : await createCompany.mutateAsync(input);

      if (logoFile) {
        await uploadLogo.mutateAsync({ id: savedCompany.id, file: logoFile });
      }

      if (company) {
        toast.success("Company updated successfully.");
      } else {
        toast.success("Company added successfully.");
      }
      closeSheet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${company ? "update" : "add"} company.`);
    }
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={closeSheet}
      title={company ? "Edit Company" : "Add Company"}
      description={company ? "Update this company’s relationship details." : "Add a company to your relationship directory."}
      side="right"
      className="w-full sm:max-w-lg"
    >
      <form onSubmit={submit} className="space-y-6">
        <FormSection title="Company identity" description="Identify the organization and its relationship status.">
          <FormField label="Company Name" error={form.formState.errors.name?.message}>
            <input {...form.register("name")} className={inputClassName} placeholder="e.g. Northbridge Capital" autoFocus />
          </FormField>
          <div {...getRootProps()} className={`flex cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-3 transition ${isDragActive ? "border-brand-500 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10" : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-800 dark:hover:bg-white/[0.03]"}`}>
            <input {...getInputProps()} />
            <Avatar src={displayedLogo} alt={company?.name || "Company"} colorKey="company-logo" size="large" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{isDragActive ? "Drop logo here" : "Add company logo"}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP up to 5 MB. If omitted, initials will be shown.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Industry"><input {...form.register("industry")} className={inputClassName} placeholder="Investment Management" /></FormField>
            <FormField label="Status"><select {...form.register("status")} className={inputClassName}><option>Prospect</option><option>Active</option><option>Dormant</option></select></FormField>
          </div>
        </FormSection>

        <FormSection title="Business profile" description="Capture the organization’s location, size, value, and relationship timeline.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Location"><input {...form.register("location")} className={inputClassName} placeholder="Makati City, Philippines" /></FormField>
            <FormField label="Employees"><input {...form.register("employees")} className={inputClassName} placeholder="51-200" /></FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Revenue"><input {...form.register("revenue")} className={inputClassName} placeholder="PHP 850M" /></FormField>
            <FormField label="Customer Since"><input type="date" {...form.register("customerSince")} className={inputClassName} /></FormField>
          </div>
        </FormSection>

        <FormSection title="Digital presence and tags" description="Add online details and labels for searching and segmentation.">
          <FormField label="Website"><input {...form.register("website")} className={inputClassName} placeholder="northbridgecapital.com" /></FormField>
          <FormField label="Tags"><input {...form.register("tags")} className={inputClassName} placeholder="VIP, Institutional" /><p className="mt-1 text-xs text-gray-500">Separate tags with commas.</p></FormField>
        </FormSection>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button type="button" onClick={closeSheet} className={secondaryButtonClassName}>Cancel</button>
          <button type="submit" disabled={createCompany.isPending || updateCompany.isPending || uploadLogo.isPending} className={primaryButtonClassName}>{createCompany.isPending || updateCompany.isPending || uploadLogo.isPending ? "Saving..." : company ? "Save Changes" : "Add Company"}</button>
        </div>
      </form>
    </Sheet>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 dark:border-white/[0.05]"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3><span title={description} aria-label={description} className="inline-flex cursor-help text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400"><InfoIcon className="size-4" /></span></div>{children}</section>;
}

const secondaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";
const primaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
