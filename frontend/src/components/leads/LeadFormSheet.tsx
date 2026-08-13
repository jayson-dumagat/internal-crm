import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { LeadRecord } from "../../api/crm";
import type { CreateLeadInput } from "../../types/Crm";
import { leadFormSchema, type LeadFormValues } from "../../validations/crm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useCompaniesQuery, useUploadLeadAvatar, useUsersQuery } from "../../hooks/crm/useCrmDirectory";
import { CURRENT_USER_AVATAR, formatUserDisplayName } from "../../utils/user";
import Avatar from "../ui/avatar/Avatar";
import Sheet from "../ui/sheet/Sheet";
import type { Lead } from "../../types/Leads";
import { CrmFormField as Field, CrmInfoSection as FormSection, crmInputClassName as inputClassName, crmPrimaryButtonClassName as primaryButtonClassName, crmSecondaryButtonClassName as secondaryButtonClassName } from "../crm/FormPrimitives";

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
  const { user: currentUser } = useAuth();
  const uploadAvatar = useUploadLeadAvatar();
  const usersQuery = useUsersQuery();
  const companiesQuery = useCompaniesQuery();
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
      assignedToId: currentUser?.entraObjectId ?? "",
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
            assignedToId: lead.assignedToId ?? lead.assignedTo.id ?? "",
            address: lead.address === "—" ? "" : lead.address,
          }
        : {
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
            assignedToId: currentUser?.entraObjectId ?? "",
          },
    );
  }, [currentUser?.entraObjectId, form, isOpen, lead]);

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
  const assigneeOptions = (usersQuery.data ?? []).map((assignee) => ({
    ...assignee,
    name: formatUserDisplayName(assignee.name),
    avatarUrl: assignee.avatarUrl ?? (
      assignee.id === currentUser?.entraObjectId
        ? currentUser.avatarUrl ?? CURRENT_USER_AVATAR
        : null
    ),
  }));
  if (currentUser && !assigneeOptions.some((assignee) => assignee.id === currentUser.entraObjectId)) {
    assigneeOptions.unshift({
      id: currentUser.entraObjectId,
      name: formatUserDisplayName(currentUser.name),
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl ?? CURRENT_USER_AVATAR,
      isCurrentUser: true,
    });
  }
  const selectedAssigneeId = useWatch({ control: form.control, name: "assignedToId" });
  const selectedAssignee = assigneeOptions.find((assignee) => assignee.id === selectedAssigneeId);
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
          assignedToId: values.assignedToId || null,
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
      className="w-full sm:max-w-2xl xl:max-w-3xl"
    >
      <form onSubmit={submit} noValidate className="space-y-6">
        <FormSection title="Basic information" description="Identify the lead and their organization.">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <input autoFocus {...form.register("name")} maxLength={300} className={inputClassName} placeholder="Full name" />
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
            <Field label="Role / Job Title" error={form.formState.errors.role?.message}><input {...form.register("role")} maxLength={200} className={inputClassName} placeholder="Investor" /></Field>
            <Field label="Company" error={form.formState.errors.company?.message}><select {...form.register("company")} className={inputClassName}><option value="">Individual / no company</option>{companiesQuery.isLoading ? <option disabled>Loading companies...</option> : (companiesQuery.data ?? []).map((company) => <option key={company.id} value={company.name}>{company.name}</option>)}</select></Field>
          </div>
        </FormSection>

        <FormSection title="Contact details" description="How the relationship team can reach this lead.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} maxLength={320} className={inputClassName} placeholder="name@company.com" /></Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}><input type="tel" {...form.register("phone")} maxLength={50} className={inputClassName} placeholder="+63 917 555 0000" /></Field>
          </div>
          <Field label="Address" error={form.formState.errors.address?.message}><input {...form.register("address")} maxLength={1000} className={inputClassName} placeholder="City, country" /></Field>
        </FormSection>

        <FormSection title="Lead assignment" description="Choose the relationship manager responsible for this lead.">
          <Field label="Assigned To" error={form.formState.errors.assignedToId?.message}>
            <div className="relative">
              {selectedAssignee && (
                <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center">
                  <Avatar
                    src={selectedAssignee.avatarUrl}
                    alt={selectedAssignee.name}
                    size="xsmall"
                    colorKey={`lead-assignee-${selectedAssignee.id}`}
                  />
                </span>
              )}
              <select
                {...form.register("assignedToId")}
                disabled={usersQuery.isLoading}
                className={`${inputClassName} ${selectedAssignee ? "pl-11" : ""}`}
              >
                <option value="">Unassigned</option>
                {usersQuery.isLoading ? (
                  <option disabled>Loading users...</option>
                ) : (
                  assigneeOptions.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.id === currentUser?.entraObjectId ? "Me" : assignee.name}
                      {assignee.id !== currentUser?.entraObjectId && assignee.email ? ` — ${assignee.email}` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </Field>
        </FormSection>

        <FormSection title="Lead qualification" description="Capture the source, value, interest, and current lead status.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lead Source" error={form.formState.errors.source?.message}><input {...form.register("source")} maxLength={150} className={inputClassName} placeholder="Referral, Manual, Event" /></Field>
            <Field label="Annual Revenue" error={form.formState.errors.annualRevenue?.message}><input {...form.register("annualRevenue")} maxLength={100} className={inputClassName} placeholder="PHP 25M" /></Field>
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
