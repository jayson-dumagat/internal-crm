import type { Contact } from "../../types/Contacts";
import type { ContactRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";
import Sheet from "../ui/sheet/Sheet";

type ContactDetailsSheetProps = { contact: Contact | null; canUpdate: boolean; onClose: () => void; onEdit: (contact: ContactRecord) => void };

export default function ContactDetailsSheet({ contact, canUpdate, onClose, onEdit }: ContactDetailsSheetProps) {
  return <Sheet isOpen={Boolean(contact)} onClose={onClose} title={contact?.user.name ?? "Contact details"} description="Review contact relationship information." side="right" className="w-full sm:max-w-2xl xl:max-w-3xl">
    {contact && <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]"><Avatar src={contact.user.image} alt={contact.user.name} size="large" colorKey={`contact-${contact.id}`} /><div className="min-w-0"><h3 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">{contact.user.name}</h3><p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{contact.position || "—"} · {contact.company.name || "Individual"}</p></div><Badge color={contact.status === "Customer" ? "success" : contact.status === "Closed" ? "light" : "warning"} size="sm">{contact.status}</Badge></div>
      <section className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">Contact details</h4><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{[["Company", contact.company.name], ["Email", contact.contact.email], ["Phone", contact.contact.phone], ["Location", contact.location], ["Relationship owner", contact.owner.name], ["Last activity", formatDisplayDate(contact.last_activity)], ["Risk profile", contact.risk_profile || "—"], ["Preferred contact", contact.preferred_contact_method || "—"]].map(([label, value]) => <InfoItem key={label} label={label} value={String(value || "—")} />)}</div></section>
      <section className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Relationship</h4><div className="flex flex-wrap items-center gap-2"><Badge color="primary" size="sm">{contact.relationship_level} relationship</Badge>{contact.type_of_client && <Badge color="light" size="sm">{contact.type_of_client}</Badge>}{(contact.tags ?? []).map((tag) => <Badge key={tag} color="light" size="sm">{tag}</Badge>)}</div></section>
      <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" disabled={!canUpdate} onClick={() => onEdit(contact as unknown as ContactRecord)} className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40">Edit contact</button></div>
    </div>}
  </Sheet>;
}

function InfoItem({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium text-gray-400">{label}</p><p className="mt-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p></div>; }
