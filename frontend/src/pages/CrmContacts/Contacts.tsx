import ContactTable from "../../components/contacts/contact-table";
import PageMeta from "../../components/common/PageMeta";

export default function Contacts() {

  return (
    <>
      <PageMeta
        title="CDEX Contacts | Caballes-Go Securities, Inc."
        description="Manage investor contacts, relationship scoring, preferences, and activities."
      />
      <ContactTable />
    </>
  );
}
