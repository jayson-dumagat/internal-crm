import PageMeta from "../../components/common/PageMeta";
import CompanyTable from "../../components/companies/CompanyTable";

export default function Companies() {
  return (
    <>
      <PageMeta
        title="CDEX Organizations"
        description="This is React.js E-commerce Products  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <CompanyTable />
    </>
  );
}
