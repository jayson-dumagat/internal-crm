import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, useWatch } from "react-hook-form";

import type { CompanyRecord, ContactRecord } from "../../api/crm";
import { contactFormSchema, type ContactFormValues } from "../../validations/crm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useCreateContact, useUpdateContact, useUploadContactAvatar, useUsersQuery } from "../../hooks/crm/useCrmDirectory";
import Sheet from "../ui/sheet/Sheet";
import Avatar from "../ui/avatar/Avatar";
import ArkCombobox, { type ArkComboboxOption } from "../crm/ArkCombobox";
import { CURRENT_USER_AVATAR, formatUserDisplayName } from "../../utils/user";
import { useToast } from "../../hooks/useToast";
import { CrmFormField as FormField, CrmInfoSection as FormSection, crmInputClassName as inputClassName, crmPrimaryButtonClassName as primaryButtonClassName, crmSecondaryButtonClassName as secondaryButtonClassName } from "../crm/FormPrimitives";

const clientTypeOptions = ["Retail Investor", "High Net Worth Individual", "Institutional Investor", "Corporate Client", "Partner / Introducer"] as const;
const riskProfileOptions = ["Conservative", "Balanced", "Aggressive"] as const;
const preferredContactMethodOptions = ["Email", "Phone", "Meeting", "Video Call"] as const;

function normalizeSelectValue<T extends string>(value: string | null | undefined, options: readonly T[]): T | "" {
  return value && options.includes(value as T) ? (value as T) : "";
}

const emptyContactFormValues = (relationshipOwnerId = ""): ContactFormValues => ({
  name: "",
  role: "",
  companyId: "",
  email: "",
  phone: "",
  relationshipLevel: "Medium",
  relationshipOwnerId,
  location: "",
  typeOfClient: "",
  riskProfile: "",
  preferredContactMethod: "",
  status: "Prospect",
  tags: "",
});

export default function AddContactSheet({
  isOpen,
  onClose,
  companies,
  companiesLoading,
  contact,
}: {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyRecord[];
  companiesLoading: boolean;
  contact?: ContactRecord | null;
}) {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const uploadAvatar = useUploadContactAvatar();
  const usersQuery = useUsersQuery();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyContactFormValues(currentUser?.entraObjectId),
  });

  useEffect(() => {
    if (!isOpen) return;

    const cleanDisplayValue = (value?: string | null) =>
      value && value !== "—" ? value : "";

    form.reset(contact ? {
      name: contact.user.name,
      role: cleanDisplayValue(contact.position),
      companyId: contact.company_id ?? "",
      email: contact.contact.email,
      phone: cleanDisplayValue(contact.contact.phone),
      relationshipLevel: contact.relationship_level,
      relationshipOwnerId: contact.relationship_owner_id ?? (contact.owner.name === "Unassigned" ? "" : `legacy:${contact.owner.name}`),
      location: cleanDisplayValue(contact.location),
      typeOfClient: normalizeSelectValue(contact.type_of_client, clientTypeOptions),
      riskProfile: normalizeSelectValue(contact.risk_profile, riskProfileOptions),
      preferredContactMethod: normalizeSelectValue(contact.preferred_contact_method, preferredContactMethodOptions),
      status: contact.status,
      tags: contact.tags?.join(", ") ?? "",
    } : emptyContactFormValues(currentUser?.entraObjectId));
  }, [contact, currentUser?.entraObjectId, form, isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const ownerOptions = (usersQuery.data ?? []).map((owner) => ({
    ...owner,
    name: formatUserDisplayName(owner.name),
    avatarUrl: owner.avatarUrl ?? (
      owner.id === currentUser?.entraObjectId
        ? currentUser.avatarUrl ?? CURRENT_USER_AVATAR
        : null
    ),
  }));
  if (currentUser && !ownerOptions.some((owner) => owner.id === currentUser.entraObjectId)) {
    ownerOptions.unshift({
      id: currentUser.entraObjectId,
      name: formatUserDisplayName(currentUser.name),
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl ?? CURRENT_USER_AVATAR,
      isCurrentUser: true,
    });
  }
  if (
    contact &&
    contact.owner.name !== "Unassigned" &&
    !ownerOptions.some((owner) => owner.name === contact.owner.name)
  ) {
    ownerOptions.push({
      id: `legacy:${contact.owner.name}`,
      name: formatUserDisplayName(contact.owner.name),
      email: "",
      avatarUrl: null,
      isCurrentUser: false,
    });
  }

  const selectedOwnerId = useWatch({ control: form.control, name: "relationshipOwnerId" });
  const selectedOwner = ownerOptions.find((owner) => owner.id === selectedOwnerId);
  const contactName = useWatch({ control: form.control, name: "name" });
  const displayedAvatar = avatarFile ? avatarPreview : contact?.user.image ?? null;
  const ownerComboboxOptions: ArkComboboxOption[] = [
    { value: "", label: "Unassigned" },
    ...ownerOptions.map((owner) => ({
      value: owner.id,
      label: `${owner.id === currentUser?.entraObjectId ? "Me" : owner.name}${owner.id !== currentUser?.entraObjectId && owner.email ? ` — ${owner.email}` : ""}`,
    })),
  ];
  const relationshipLevelOptions: ArkComboboxOption[] = ["High", "Medium", "Low"].map((value) => ({ value, label: value }));
  const statusOptions: ArkComboboxOption[] = ["Prospect", "Customer", "KYC Pending", "Dormant", "Closed"].map((value) => ({ value, label: value }));
  const clientTypeComboboxOptions: ArkComboboxOption[] = [{ value: "", label: "Select type" }, ...clientTypeOptions.map((value) => ({ value, label: value }))];
  const riskComboboxOptions: ArkComboboxOption[] = [{ value: "", label: "Select profile" }, ...riskProfileOptions.map((value) => ({ value, label: value }))];
  const contactMethodComboboxOptions: ArkComboboxOption[] = [{ value: "", label: "Select method" }, ...preferredContactMethodOptions.map((value) => ({ value, label: value }))];
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: ([file]) => {
      if (!file) return;
      setAvatarFile(file);
      setAvatarPreview((previousPreview) => {
        if (previousPreview?.startsWith("blob:")) {
          URL.revokeObjectURL(previousPreview);
        }
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

  const submit = form.handleSubmit(async (values) => {
    try {
      const selectedOwner = values.relationshipOwnerId ?? "";
      const isLegacyOwner = selectedOwner.startsWith("legacy:");
      const input = {
        ...values,
        companyId: values.companyId || null,
        relationshipOwnerId: isLegacyOwner ? null : selectedOwner || null,
        relationshipOwner: isLegacyOwner
          ? formatUserDisplayName(selectedOwner.slice("legacy:".length))
          : undefined,
        tags: values.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      };
      const savedContact = contact
        ? await updateContact.mutateAsync({ id: contact.id, input })
        : await createContact.mutateAsync(input);

      if (avatarFile) {
        await uploadAvatar.mutateAsync({ id: savedContact.id, file: avatarFile });
      }

      if (contact) {
        toast.success("Contact updated successfully.");
      } else {
        toast.success("Contact added successfully.");
      }
      closeSheet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${contact ? "update" : "add"} contact.`);
    }
  });

  return (
    <Sheet isOpen={isOpen} onClose={closeSheet} title={contact ? "Edit Contact" : "Add Contact"} description={contact ? "Update this client or relationship details." : "Add a client or relationship to your directory."} side="right" className="w-full sm:max-w-2xl xl:max-w-3xl">
      <form onSubmit={submit} noValidate className="space-y-6">
        <FormSection title="Basic information" description="Identify the contact and their organization.">
          <FormField label="Name" required error={form.formState.errors.name?.message}><input {...form.register("name")} minLength={1} maxLength={255} className={inputClassName} placeholder="Full name" autoFocus /></FormField>
          <div {...getRootProps()} className={`flex cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-3 transition ${isDragActive ? "border-brand-500 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10" : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-800 dark:hover:bg-white/[0.03]"}`}>
            <input {...getInputProps()} />
            <Avatar src={displayedAvatar} alt={contactName || "Contact"} colorKey="contact-avatar" size="large" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{isDragActive ? "Drop image here" : "Add profile image"}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP up to 5 MB. If omitted, initials will be shown.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Role / Job Title" error={form.formState.errors.role?.message}><input {...form.register("role")} maxLength={200} className={inputClassName} placeholder="Managing Director" /></FormField>
            <FormField label="Company"><input type="hidden" {...form.register("companyId")} /><ArkCombobox value={form.watch("companyId") ?? ""} options={[{ value: "", label: "Individual / not linked" }, ...companies.map((company) => ({ value: String(company.id), label: company.name }))]} onChange={(value) => form.setValue("companyId", value, { shouldValidate: true, shouldDirty: true })} placeholder={companiesLoading ? "Loading companies..." : "Search companies"} disabled={companiesLoading} /></FormField>
          </div>
        </FormSection>

        <FormSection title="Contact details" description="How the relationship team can reach this contact.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} maxLength={320} className={inputClassName} placeholder="name@company.com" /></FormField>
            <FormField label="Phone" error={form.formState.errors.phone?.message}><input type="tel" {...form.register("phone")} maxLength={50} className={inputClassName} placeholder="+63 917 555 0182" /></FormField>
          </div>
          <FormField label="Location / Address" error={form.formState.errors.location?.message}><input {...form.register("location")} maxLength={255} className={inputClassName} placeholder="Makati, Philippines" /></FormField>
        </FormSection>

        <FormSection title="Relationship management" description="Assign ownership and track the current relationship state.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Relationship Owner" error={form.formState.errors.relationshipOwnerId?.message}>
              <input type="hidden" {...form.register("relationshipOwnerId")} />
              <ArkCombobox value={selectedOwnerId ?? ""} options={ownerComboboxOptions} startAdornment={selectedOwner ? <Avatar src={selectedOwner.avatarUrl} alt={selectedOwner.name} size="xsmall" colorKey={`owner-${selectedOwner.id}`} /> : undefined} onChange={(value) => form.setValue("relationshipOwnerId", value, { shouldValidate: true, shouldDirty: true })} placeholder={usersQuery.isLoading ? "Loading users..." : "Search relationship owners"} disabled={usersQuery.isLoading} />
            </FormField>
            <FormField label="Relationship Level" required error={form.formState.errors.relationshipLevel?.message}><input type="hidden" {...form.register("relationshipLevel")} /><ArkCombobox value={form.watch("relationshipLevel")} options={relationshipLevelOptions} onChange={(value) => form.setValue("relationshipLevel", value as ContactFormValues["relationshipLevel"], { shouldValidate: true, shouldDirty: true })} placeholder="Search relationship level" /></FormField>
          </div>
          <FormField label="Status" required><input type="hidden" {...form.register("status")} /><ArkCombobox value={form.watch("status")} options={statusOptions} onChange={(value) => form.setValue("status", value as ContactFormValues["status"], { shouldValidate: true, shouldDirty: true })} placeholder="Search status" /></FormField>
        </FormSection>

        <FormSection title="Investor profile" description="Capture client classification, suitability, and communication preferences.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Type of Client" error={form.formState.errors.typeOfClient?.message}><input type="hidden" {...form.register("typeOfClient")} /><ArkCombobox value={form.watch("typeOfClient") ?? ""} options={clientTypeComboboxOptions} onChange={(value) => form.setValue("typeOfClient", value as ContactFormValues["typeOfClient"], { shouldValidate: true, shouldDirty: true })} placeholder="Search client type" /></FormField>
            <FormField label="Risk Profile" error={form.formState.errors.riskProfile?.message}><input type="hidden" {...form.register("riskProfile")} /><ArkCombobox value={form.watch("riskProfile") ?? ""} options={riskComboboxOptions} onChange={(value) => form.setValue("riskProfile", value as ContactFormValues["riskProfile"], { shouldValidate: true, shouldDirty: true })} placeholder="Search risk profile" /></FormField>
          </div>
          <FormField label="Preferred Contact Method" error={form.formState.errors.preferredContactMethod?.message}><input type="hidden" {...form.register("preferredContactMethod")} /><ArkCombobox value={form.watch("preferredContactMethod") ?? ""} options={contactMethodComboboxOptions} onChange={(value) => form.setValue("preferredContactMethod", value as ContactFormValues["preferredContactMethod"], { shouldValidate: true, shouldDirty: true })} placeholder="Search contact method" /></FormField>
        </FormSection>

        <FormSection title="Organization" description="Add labels that make this contact easier to find and segment.">
          <FormField label="Tags" error={form.formState.errors.tags?.message}><input {...form.register("tags")} maxLength={500} className={inputClassName} placeholder="VIP, Decision Maker" /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate tags with commas.</p></FormField>
        </FormSection>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" onClick={closeSheet} className={secondaryButtonClassName}>Cancel</button><button type="submit" disabled={createContact.isPending || updateContact.isPending || uploadAvatar.isPending} className={primaryButtonClassName}>{createContact.isPending || updateContact.isPending || uploadAvatar.isPending ? "Saving..." : contact ? "Save Changes" : "Add Contact"}</button></div>
      </form>
    </Sheet>
  );
}
