import ClientTable from "../../components/clients/client-table";
import PageMeta from "../../components/common/PageMeta";

export default function Clients() {
  return (
    <>
      <PageMeta
        title="CCRMS Clients"
        description="This is React.js E-commerce Products  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <ClientTable />
    </>
  );
}
