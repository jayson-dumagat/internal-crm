import ContactTable from "../../components/contacts/contact-table";
import PageMeta from "../../components/common/PageMeta";

export default function Contacts() {
  return (
    <>
      <PageMeta
        title="CDEX Contacts"
        description="This is React.js E-commerce Products  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <ContactTable />
    </>
  );
}
