import type { Contact } from "../../types/Contacts";
import type { ContactRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import Avatar from "../ui/avatar/Avatar";
import Sheet from "../ui/sheet/Sheet";

type ContactDetailsSheetProps = {
  contact: Contact | null;
  canUpdate: boolean;
  onClose: () => void;
  onEdit: (contact: ContactRecord) => void;
};

export default function ContactDetailsSheet({ contact, canUpdate, onClose, onEdit }: ContactDetailsSheetProps) {
  return (
    <Sheet isOpen={Boolean(contact)} onClose={onClose} title={contact?.user.name ?? "Contact details"} description="Review contact relationship information." side="right" className="w-full sm:max-w-2xl">
      {contact && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar src={contact.user.image} alt={contact.user.name} size="large" />
            <div><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{contact.user.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{contact.position}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Company", contact.company.name], ["Email", contact.contact.email], ["Phone", contact.contact.phone], ["Relationship owner", contact.owner.name], ["Location", contact.location], ["Status", contact.status], ["Last activity", formatDisplayDate(contact.last_activity)], ["Risk profile", contact.risk_profile || "Not provided"]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p></div>)}
          </div>
          <button type="button" disabled={!canUpdate} onClick={() => onEdit(contact as unknown as ContactRecord)} className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white disabled:opacity-40">Edit contact</button>
        </div>
      )}
    </Sheet>
  );
}
