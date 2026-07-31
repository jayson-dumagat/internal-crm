import PageMeta from "../../components/common/PageMeta";
import EmailContent from "../../components/email/EmailInbox/EmailContent";
import EmailSidebar from "../../components/email/EmailSidebar/EmailSidebar";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";

export default function Inbox() {
  return (
    <>
      <PageMeta
        title="CDEX Inbox"
        description="This is React.js Inbox Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AppBreadcrumb pageName="Inbox" />
      <div className="sm:h-[calc(100vh-174px)] h-screen xl:h-[calc(100vh-186px)">
        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-12 sm:gap-5">
          <div className="xl:col-span-3 col-span-full">
            <EmailSidebar />
          </div>
          <EmailContent />
        </div>
      </div>
    </>
  );
}
