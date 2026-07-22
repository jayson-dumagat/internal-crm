import { useEffect, useState } from "react";
import type React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import {
  DashboardAltIcon,
  CalenderIcon,
  ChartAltIcon,
  HeadphoneAltIcon,
  HorizontaLDots,
  ChevronDownIcon,
  IdCardIcon,
  TextIcon,
  ListTodoIcon,
  InboxIcon,
} from "../icons";

type SubItem = {
  id: string;
  label: string;
  path: string;
};

type NavItem = {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: SubItem[];
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    group: "General",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: <DashboardAltIcon />,
      },
      {
        id: "calendar",
        label: "Calendar",
        path: "/calendar",
        icon: <CalenderIcon />,
      },
      {
        id: "tasks",
        label: "Tasks",
        path: "/tasks",
        icon: <ListTodoIcon />,
      },
      {
        id: "notes",
        label: "Notes",
        path: "/notes",
        icon: <TextIcon />,
      },
      {
        id: "inbox",
        label: "Inbox",
        path: "/inbox",
        icon: <InboxIcon />,
      },
    ],
  },
  {
    group: "Clients",
    items: [
      {
        id: "clients",
        label: "Clients",
        path: "/clients",
        icon: <IdCardIcon />,
      },
      {
        id: "client-profiles",
        label: "Profiles",
        path: "/client-profiles",
        icon: <IdCardIcon />,
      },
      {
        id: "accounts",
        label: "Accounts",
        path: "/accounts",
        icon: <IdCardIcon />,
      },
      {
        id: "portfolio-snapshots",
        label: "Portfolio Snapshots",
        path: "/portfolio-snapshots",
        icon: <TextIcon />,
      },
      {
        id: "beneficiaries",
        label: "Beneficiaries",
        path: "/beneficiaries",
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Sales",
    items: [
      {
        id: "leads",
        label: "Leads",
        path: "/leads",
        icon: <IdCardIcon />,
      },
      {
        id: "prospects",
        label: "Prospects",
        path: "/prospects",
        icon: <IdCardIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        icon: <IdCardIcon />,
      },
      {
        id: "referrals",
        label: "Referrals",
        path: "/referrals",
        icon: <IdCardIcon />,
      },
      {
        id: "campaigns",
        label: "Campaigns",
        path: "/campaigns",
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Marketing",
    items: [
      {
        id: "contacts",
        label: "Contacts",
        path: "/contacts",
        icon: <IdCardIcon />,
      },
      {
        id: "leads",
        label: "Leads",
        path: "/leads",
        icon: <IdCardIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Analytics",
    items: [
      {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: <ChartAltIcon />,
      },
      {
        id: "leads",
        label: "Leads",
        path: "/leads",
        icon: <IdCardIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Storage",
    items: [
      {
        id: "documents",
        label: "Documents",
        path: "/documents",
        icon: <IdCardIcon />,
      },
      {
        id: "images",
        label: "Images",
        path: "/images",
        icon: <IdCardIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Others",
    items: [
      {
        id: "integrations",
        label: "Integrations",
        path: "/integrations",
        icon: <IdCardIcon />,
      },
      {
        id: "help-support",
        label: "Help Support",
        path: "/help-support",
        icon: <HeadphoneAltIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        icon: <IdCardIcon />,
      },
    ],
  },
];

export default function CrmSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState<string | null>("Dashboard");

  const showContent = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    if (!showContent) {
      setOpenDropdown(null);
      return;
    }

    const parentWithActiveChild = navGroups
      .flatMap((group) => group.items)
      .find((item) =>
        item.children?.some((child) => child.path === location.pathname),
      );

    if (parentWithActiveChild) {
      setOpenDropdown(parentWithActiveChild.id);
    }
  }, [showContent, location.pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 z-9999 flex h-screen flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 px-5 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`sidebar-header flex items-center gap-2 pt-8 pb-7 ${
          !showContent ? "xl:justify-center" : "justify-between"
        }`}
      >
        <Link
          to="/"
          className={`inline-flex items-center ${
            showContent ? "gap-2.5 sm:gap-3" : "justify-center"
          }`}
        >
          {showContent ? (
            <>
              <img
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                src="/cgsi_logo.png"
                alt="CGSI Logo"
              />

              <div className="flex w-[158px] flex-col leading-none sm:w-[176px] lg:w-auto">
                <span className="font-['Avenir_Next_LT_Pro','Avenir_Next',Arial,sans-serif] text-base font-semibold tracking-[0.18em] whitespace-nowrap text-[#104862] sm:text-lg sm:tracking-[0.15em] lg:tracking-[0.14em] dark:text-white">
                  CABALLES-GO
                </span>

                <span className="my-1 h-[1.5px] w-full bg-[#104862] dark:bg-white" />

                <span className="font-['Avenir_Next_LT_Pro','Avenir_Next',Arial,sans-serif] text-xs font-bold tracking-[0.70em] whitespace-nowrap text-[#104862] sm:text-sm sm:tracking-[0.58em] lg:tracking-[0.52em] dark:text-white">
                  SECURITIES
                </span>
              </div>
            </>
          ) : (
            <img
              className="h-10 w-10 object-contain"
              src="/cgsi_logo.png"
              alt="CGSI Logo"
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav>
          {navGroups.map((group) => (
            <div key={group.group}>
              <h3 className="mb-3 text-xs leading-[20px] text-gray-500 dark:text-gray-400">
                {showContent ? (
                  <span className="ml-3">{group.group}</span>
                ) : (
                  <HorizontaLDots className="mx-auto size-6" />
                )}
              </h3>

              <ul className="mb-7 flex flex-col gap-1">
                {group.items.map((item) => {
                  const hasChildren = Boolean(item.children?.length);
                  const isActive =
                    location.pathname === item.path ||
                    item.children?.some(
                      (child) => child.path === location.pathname,
                    );
                  const isOpen = openDropdown === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            setOpenDropdown(isOpen ? null : item.id);
                            navigate(item.path);
                            return;
                          }

                          navigate(item.path);
                        }}
                        className={`group flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-normal ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span
                          className={`shrink-0 [&_svg]:size-5 ${
                            isActive
                              ? "text-gray-800 dark:text-white/90"
                              : "text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-white/90"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {showContent && (
                          <span
                            className={`menu-item-text ${
                              isActive
                                ? "text-gray-800 dark:text-white/90"
                                : "text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-white/90"
                            }`}
                          >
                            {item.label}
                          </span>
                        )}

                        {hasChildren && showContent && (
                          <ChevronDownIcon
                            className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                              isOpen
                                ? "rotate-180 dark:text-white/90"
                                : "text-gray-500 group-hover:text-gray-800 dark:group-hover:text-white/90"
                            }`}
                          />
                        )}
                      </button>

                      {item.children && (
                        <div
                          className={`menu-accordion ${
                            isOpen && showContent ? "open" : ""
                          } ${!showContent ? "hidden" : ""}`}
                        >
                          <div>
                            <ul className="menu-dropdown mt-3 ml-9 flex flex-col space-y-2 border-l border-gray-200 pl-5 dark:border-gray-800">
                              {item.children.map((child) => {
                                const isChildActive =
                                  location.pathname === child.path;

                                return (
                                  <li key={child.id}>
                                    <Link
                                      to={child.path}
                                      className={`text-sm hover:text-gray-800 dark:hover:text-white/90 ${
                                        isChildActive
                                          ? "text-gray-800 dark:text-white/90"
                                          : "text-gray-500 dark:text-gray-400"
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}