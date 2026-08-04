import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CompanyRecord, ContactRecord } from "../../api/crm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useCreateContact, useUpdateContact, useUsersQuery } from "../../hooks/crm/useCrmDirectory";
import Sheet from "../ui/sheet/Sheet";

const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required.").max(255),
  role: z.string().max(200).optional(),
  companyId: z.string().optional(),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().max(50).optional(),
  relationshipLevel: z.enum(["High", "Medium", "Low"]),
  relationshipOwnerId: z.string().max(150).optional(),
  location: z.string().max(255).optional(),
  typeOfClient: z.string().max(80).optional(),
  riskProfile: z.string().max(30).optional(),
  preferredContactMethod: z.string().max(30).optional(),
  status: z.enum(["Customer", "Prospect", "KYC Pending", "Dormant", "Closed"]),
  tags: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
const inputClassName = "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

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
  const { user: currentUser } = useAuth();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const usersQuery = useUsersQuery();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", role: "", companyId: "", email: "", phone: "", relationshipLevel: "Medium", relationshipOwnerId: "", location: "", typeOfClient: "", riskProfile: "", preferredContactMethod: "", status: "Prospect", tags: "" },
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
      typeOfClient: contact.type_of_client ?? "",
      riskProfile: contact.risk_profile ?? "",
      preferredContactMethod: contact.preferred_contact_method ?? "",
      status: contact.status,
      tags: contact.tags?.join(", ") ?? "",
    } : undefined);
  }, [contact, form, isOpen]);

  const ownerOptions = [...(usersQuery.data ?? [])];
  if (currentUser && !ownerOptions.some((owner) => owner.name === currentUser.name)) {
    ownerOptions.unshift({
      id: currentUser.entraObjectId,
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: null,
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
      name: contact.owner.name,
      email: "",
      avatarUrl: null,
      isCurrentUser: false,
    });
  }

  const selectedOwnerId = useWatch({ control: form.control, name: "relationshipOwnerId" });
  const selectedOwner = ownerOptions.find((owner) => owner.id === selectedOwnerId);

  const submit = form.handleSubmit(async (values) => {
    try {
      const selectedOwner = values.relationshipOwnerId ?? "";
      const isLegacyOwner = selectedOwner.startsWith("legacy:");
      const input = {
        ...values,
        companyId: values.companyId || null,
        relationshipOwnerId: isLegacyOwner ? null : selectedOwner || null,
        relationshipOwner: isLegacyOwner ? selectedOwner.slice("legacy:".length) : undefined,
        tags: values.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      };
      if (contact) {
        await updateContact.mutateAsync({ id: contact.id, input });
        toast.success("Contact updated successfully.");
      } else {
        await createContact.mutateAsync(input);
        toast.success("Contact added successfully.");
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${contact ? "update" : "add"} contact.`);
    }
  });

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={contact ? "Edit Contact" : "Add Contact"} description={contact ? "Update this client or relationship details." : "Add a client or relationship to your directory."} side="right" className="w-full sm:max-w-2xl">
      <form onSubmit={submit} className="space-y-6">
        <FormSection title="Basic information" description="Identify the contact and their organization.">
          <FormField label="Name" error={form.formState.errors.name?.message}><input {...form.register("name")} className={inputClassName} placeholder="Full name" autoFocus /></FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Role / Job Title"><input {...form.register("role")} className={inputClassName} placeholder="Managing Director" /></FormField>
            <FormField label="Company"><select {...form.register("companyId")} disabled={companiesLoading} className={inputClassName}><option value="">Individual / not linked</option>{companiesLoading ? <option disabled>Loading companies...</option> : companies.map((company) => <option key={company.id} value={String(company.id)}>{company.name}</option>)}</select></FormField>
          </div>
        </FormSection>

        <FormSection title="Contact details" description="How the relationship team can reach this contact.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} className={inputClassName} placeholder="name@company.com" /></FormField>
            <FormField label="Phone"><input {...form.register("phone")} className={inputClassName} placeholder="+63 917 555 0182" /></FormField>
          </div>
          <FormField label="Location / Address"><input {...form.register("location")} className={inputClassName} placeholder="Makati, Philippines" /></FormField>
        </FormSection>

        <FormSection title="Relationship management" description="Assign ownership and track the current relationship state.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Relationship Owner">
              <select {...form.register("relationshipOwnerId")} disabled={usersQuery.isLoading} className={inputClassName}>
                <option value="">Unassigned</option>
                {usersQuery.isLoading ? <option disabled>Loading users...</option> : ownerOptions.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}{owner.isCurrentUser ? " (Me)" : owner.email ? ` — ${owner.email}` : ""}</option>)}
              </select>
              {selectedOwner && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <img src={selectedOwner.avatarUrl ?? "/images/user/user-01.jpg"} alt="" className="size-6 rounded-full object-cover" />
                  <span>Assigned to <strong className="font-medium text-gray-700 dark:text-gray-300">{selectedOwner.name}</strong></span>
                </div>
              )}
            </FormField>
            <FormField label="Relationship Level"><select {...form.register("relationshipLevel")} className={inputClassName}><option>High</option><option>Medium</option><option>Low</option></select></FormField>
          </div>
          <FormField label="Status"><select {...form.register("status")} className={inputClassName}><option>Prospect</option><option>Customer</option><option>KYC Pending</option><option>Dormant</option><option>Closed</option></select></FormField>
        </FormSection>

        <FormSection title="Investor profile" description="Capture client classification, suitability, and communication preferences.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Type of Client"><select {...form.register("typeOfClient")} className={inputClassName}><option value="">Select type</option><option>Retail Investor</option><option>High Net Worth Individual</option><option>Institutional Investor</option><option>Corporate Client</option><option>Partner / Introducer</option></select></FormField>
            <FormField label="Risk Profile"><select {...form.register("riskProfile")} className={inputClassName}><option value="">Select profile</option><option>Conservative</option><option>Balanced</option><option>Aggressive</option></select></FormField>
          </div>
          <FormField label="Preferred Contact Method"><select {...form.register("preferredContactMethod")} className={inputClassName}><option value="">Select method</option><option>Email</option><option>Phone</option><option>Meeting</option><option>Video Call</option></select></FormField>
        </FormSection>

        <FormSection title="Organization" description="Add labels that make this contact easier to find and segment.">
          <FormField label="Tags"><input {...form.register("tags")} className={inputClassName} placeholder="VIP, Decision Maker" /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate tags with commas.</p></FormField>
        </FormSection>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" onClick={onClose} className={secondaryButtonClassName}>Cancel</button><button type="submit" disabled={createContact.isPending || updateContact.isPending} className={primaryButtonClassName}>{createContact.isPending || updateContact.isPending ? "Saving..." : contact ? "Save Changes" : "Add Contact"}</button></div>
      </form>
    </Sheet>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 dark:border-white/[0.05]"><div><h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p></div>{children}</section>;
}

const secondaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";
const primaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
