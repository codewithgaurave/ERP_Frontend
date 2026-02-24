import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent = () => {
  const {
    isExpanded,
    isHovered,
    isMobileOpen,
    isRightSidebarOpen,
    rightSidebarContent,
  } = useSidebar();

  return (
    <div className="min-h-screen xl:flex overflow-hidden">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto no-scrollbar pt-20 ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""} ${
          isRightSidebarOpen ? "lg:mr-[400px]" : "mr-0"
        }`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-full md:p-6 w-full min-h-[calc(100vh-80px)]">
          <Outlet />
        </div>
      </div>

      {/* Right Sidebar - Layout Integrated */}
      <div
        className={`fixed top-20 right-0 z-[995] h-[calc(100vh-80px)] bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-gray-800 shadow-xl transition-all duration-300 ease-in-out ${
          isRightSidebarOpen
            ? "w-full lg:w-[400px] translate-x-0"
            : "w-0 translate-x-full"
        } overflow-hidden`}
      >
        <div className="w-full lg:w-[400px] h-full overflow-y-auto no-scrollbar">
          {rightSidebarContent}
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
