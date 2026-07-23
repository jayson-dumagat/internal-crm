import PageMeta from "../../components/common/PageMeta";
import LeadHeader from "../../components/leads/LeadHeader";
import LeadTable from "../../components/leads/LeadTable";

export default function Leads() {
  return (
    <>
      <PageMeta
        title="CDEX Leads | Caballes-Go Securities, Inc."
        description="This is React.js E-commerce Products  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <LeadHeader />
      <LeadTable />
    </>
  );
}
