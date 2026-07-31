import CompanyTable from "../../components/companies/CompanyTable";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";

export default function Companies() {
  return (
    <>
      <AppBreadcrumb pageName="Companies" />
      <CompanyTable />
    </>
  );
}
