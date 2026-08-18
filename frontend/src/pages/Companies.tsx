import CompanyTable from "../components/companies/CompanyTable";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";

export default function Companies() {
  return (
    <>
    <PageMeta
        title="CDEX Companies | Caballes-Go Securities, Inc."
        description="Manage company information, relationship scoring, preferences, and activities."
      />
      <AppBreadcrumb pageName="Companies" />
      <CompanyTable />
    </>
  );
}
