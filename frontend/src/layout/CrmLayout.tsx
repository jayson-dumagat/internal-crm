import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import PageMeta from "../components/common/PageMeta";
import Backdrop from "./Backdrop";
import { Outlet } from "react-router";
import CrmSidebar from "./CrmSidebar";
import CrmHeader from "./CrmHeader";

const CrmLayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      <CrmSidebar />
      <Backdrop />
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "xl:ml-[290px]" : "xl:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <CrmHeader />
        <main className="mx-auto w-full min-w-0 max-w-screen-2xl flex-1 overflow-x-hidden p-4 pb-20 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function CrmLayout() {
  return (
    <>
      <PageMeta
        title="React.js Layout Two Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Layout Two Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <SidebarProvider>
        <CrmLayoutContent />
      </SidebarProvider>
    </>
  );
}
