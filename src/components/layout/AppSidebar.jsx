import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  BoxIconLine,
  HorizontaLDots,
} from "../../icons";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { getRoleBasedNavigation } from "../../utils/navigation";

const AppSidebar = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = user ? getRoleBasedNavigation(user.role) : [];

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1e40af",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Sign Out",
      background: document.documentElement.className.includes("dark")
        ? "#111827"
        : "#fff",
      color: document.documentElement.className.includes("dark")
        ? "#fff"
        : "#000",
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        title: "Signed Out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.className.includes("dark")
          ? "#111827"
          : "#fff",
        color: document.documentElement.className.includes("dark")
          ? "#fff"
          : "#000",
      });
    }
  };

  return (
    <aside
      className={`fixed mt-20 flex flex-col lg:mt-0 top-0 left-0 bg-[#F8FAFC] dark:bg-gray-900 text-slate-600 dark:text-gray-400 h-screen transition-all duration-300 ease-in-out z-50 border-r border-slate-200 dark:border-gray-800 shadow-sm
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`items-center h-20 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm ${
          isMobileOpen
            ? "hidden"
            : !isExpanded && !isHovered
              ? "flex justify-center"
              : "flex justify-between px-8"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:rotate-6 transition-all duration-300">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-0.5">
                ERP{" "}
                <span className="text-brand-600 dark:text-brand-400">
                  Panel
                </span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-[1px]">
                  System Active
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-grow px-4">
        <nav className="py-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-5 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-gray-600 flex leading-none ${
                  !isExpanded && !isHovered && !isMobileOpen
                    ? "lg:justify-center"
                    : "justify-start px-4"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "General"
                ) : (
                  <HorizontaLDots className="size-5" />
                )}
              </h2>

              <ul className="flex flex-col gap-2">
                {navItems.map((nav, index) => (
                  <li key={nav.name}>
                    {nav.subItems ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleSubmenuToggle(index, "main")}
                          className={`flex items-center w-full gap-3 px-4 py-3.5 font-bold rounded transition-all duration-200 group text-sm ${
                            openSubmenu?.index === index
                              ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-md border border-slate-100 dark:border-gray-700"
                              : "text-slate-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:text-slate-900 dark:hover:text-white"
                          } ${!isExpanded && !isHovered && !isMobileOpen ? "justify-center px-0" : ""}`}
                        >
                          <span
                            className={`transition-colors duration-200 ${openSubmenu?.index === index ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-300"}`}
                          >
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="flex-grow text-left">
                              {nav.name}
                            </span>
                          )}
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <ChevronDownIcon
                              className={`w-4 h-4 transition-transform duration-300 ${
                                openSubmenu?.index === index
                                  ? "rotate-180 text-brand-600 dark:text-brand-400"
                                  : "text-slate-400 dark:text-gray-600"
                              }`}
                            />
                          )}
                        </button>

                        {openSubmenu?.index === index &&
                          (isExpanded || isHovered || isMobileOpen) && (
                            <ul className="mt-2 ml-6 flex flex-col gap-1 border-l-2 border-slate-100 dark:border-gray-800 pl-4 py-1">
                              {nav.subItems.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    to={subItem.path}
                                    className={`block py-2 text-sm font-semibold transition-colors ${
                                      isActive(subItem.path)
                                        ? "text-brand-600 dark:text-brand-400"
                                        : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ) : (
                      <Link
                        to={nav.path}
                        onClick={() => isMobileOpen && toggleMobileSidebar()}
                        className={`flex items-center w-full gap-3 px-4 py-3.5 font-bold rounded transition-all duration-200 group text-sm ${
                          isActive(nav.path)
                            ? "bg-brand-600 dark:bg-brand-500 text-white shadow-lg shadow-brand-600/30 border border-brand-500"
                            : "text-slate-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:text-slate-900 dark:hover:text-white"
                        } ${!isExpanded && !isHovered && !isMobileOpen ? "justify-center px-0" : ""}`}
                      >
                        <span
                          className={`transition-colors duration-200 ${isActive(nav.path) ? "text-white" : "text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-300"}`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span>{nav.name}</span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div
        className={`mt-auto px-4 pb-3 ${
          !isExpanded && !isHovered && !isMobileOpen
            ? "flex justify-center"
            : ""
        }`}
      >
        <button
          onClick={handleLogout}
          className={`group relative flex items-center transition-all duration-300 ease-in-out
            ${
              !isExpanded && !isHovered && !isMobileOpen
                ? "w-8 h-8 justify-center rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-900/40 shadow-sm"
                : "w-full gap-4 px-4 py-3.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400 shadow-sm hover:shadow-md"
            }`}
        >
          <div
            className={`flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110
            ${
              !isExpanded && !isHovered && !isMobileOpen
                ? ""
                : "w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/40"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>

          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-bold tracking-tight">Logout</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-red-400/80 transition-colors">
                End Session
              </span>
            </div>
          )}

          {/* Hover Glow Effect */}
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
