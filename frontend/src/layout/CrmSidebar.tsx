import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/auth/useAuth";
import { hasPermission, type AccessPermission } from "../config/rbac";
import {
  DashboardAltIcon,
  CalenderIcon,
  ChartAltIcon,
  HeadphoneAltIcon,
  HorizontaLDots,
  ChevronDownIcon,
  IdCardIcon,
  ListTodoIcon,
  //InboxIcon,
  Building2Icon,
  NoteIcon,
  UsersRoundIcon,
  TrophyIcon,
  NetworkIcon,
} from "../icons";

type SubItem = {
  id: string;
  label: string;
  path: string;
  enabled?: boolean;
  permission?: AccessPermission;
  badges?: NavBadge[];
};

type NavItem = {
  id: string;
  label: string;
  path: string;
  enabled?: boolean;
  permission?: AccessPermission;
  icon?: React.ReactNode;
  children?: SubItem[];
  badges?: NavBadge[];
};

type NavGroup = {
  group: string;
  enabled?: boolean;
  items: NavItem[];
};

type NavBadgeVariant = "brand" | "success" | "warning" | "gray";

type NavBadge = {
  label: string;
  enabled?: boolean;
  variant?: NavBadgeVariant;
};

const badgeVariantClasses: Record<NavBadgeVariant, string> = {
  brand:
    "bg-brand-50 text-brand-600 ring-brand-500/10 dark:bg-brand-500/15 dark:text-brand-300",
  success:
    "bg-success-50 text-success-700 ring-success-600/10 dark:bg-success-500/15 dark:text-success-400",
  warning:
    "bg-warning-50 text-warning-700 ring-warning-600/10 dark:bg-warning-500/15 dark:text-warning-400",
  gray: "bg-gray-100 text-gray-600 ring-gray-500/10 dark:bg-white/[0.06] dark:text-gray-300",
};

function NavBadges({ badges }: { badges?: NavBadge[] }) {
  const visibleBadges = badges?.filter((badge) => badge.enabled !== false);

  if (!visibleBadges?.length) return null;

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1">
      {visibleBadges.map((badge) => (
        <span
          key={`${badge.label}-${badge.variant ?? "brand"}`}
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 ring-1 ring-inset ${
            badgeVariantClasses[badge.variant ?? "brand"]
          }`}
        >
          {badge.label}
        </span>
      ))}
    </span>
  );
}

const navGroups: NavGroup[] = [
  {
    group: "General",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        permission: "dashboard.read",
        icon: <DashboardAltIcon />,
      },
      {
        id: "calendar",
        label: "Calendar",
        path: "/calendar",
        permission: "calendar.read",
        icon: <CalenderIcon />,
      },
      {
        id: "tasks",
        label: "Tasks",
        path: "/tasks",
        permission: "tasks.read",
        icon: <ListTodoIcon />,
        //badges: [{ label: "New", enabled: true, variant: "brand" }],
      },
      {
        id: "notes",
        label: "Notes",
        path: "/notes",
        permission: "notes.read",
        icon: <NoteIcon />,
      },
      //{
        //id: "inbox",
        //label: "Inbox",
        //path: "/inbox",
        //icon: <InboxIcon />,
        //badges: [{ label: "3", enabled: true, variant: "warning" }],
      //},
      {
        id: "activities",
        label: "Activities",
        path: "/activities",
        permission: "activities.read",
        icon: <ListTodoIcon />,
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
        permission: "leads.read",
        icon: <TrophyIcon />,
      },
      {
        id: "pipelines",
        label: "Pipelines",
        path: "/pipelines",
        permission: "pipelines.read",
        icon: <NetworkIcon />,
        badges: [{ label: "New", enabled: false, variant: "success" }],
      },
      {
        id: "contacts",
        label: "Contacts",
        path: "/contacts",
        permission: "contacts.read",
        icon: <UsersRoundIcon />,
      },
      {
        id: "companies",
        label: "Companies",
        path: "/companies",
        permission: "companies.read",
        icon: <Building2Icon />,
      },
    ],
  },
  {
    group: "Analytics",
    enabled: false,
    items: [
      {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: <ChartAltIcon />,
      },
      {
        id: "metrics",
        label: "Metrics",
        path: "/metrics",
        icon: <ChartAltIcon />,
      },
    ],
  },
  {
    group: "Storage",
    enabled: false,
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
        enabled: true,
        icon: <IdCardIcon />,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        path: "/opportunities",
        enabled: true,
        icon: <IdCardIcon />,
      },
    ],
  },
  {
    group: "Others",
    enabled: false,
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
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState<string | null>("Dashboard");

  const showContent = isExpanded || isHovered || isMobileOpen;
  const visibleNavGroups = useMemo(
    () =>
      navGroups
        .filter((group) => group.enabled !== false)
        .map((group) => ({
          ...group,
          items: group.items
            .filter(
              (item) =>
                item.enabled !== false &&
                (!item.permission || hasPermission(user, item.permission)),
            )
            .map((item) => ({
              ...item,
              children: item.children?.filter(
                (child) =>
                  child.enabled !== false &&
                  (!child.permission || hasPermission(user, child.permission)),
              ),
            })),
        }))
        .filter((group) => group.items.length > 0),
    [user],
  );

  useEffect(() => {
    if (!showContent) {
      setOpenDropdown(null);
      return;
    }

    const parentWithActiveChild = visibleNavGroups
      .flatMap((group) => group.items)
      .find((item) =>
        item.children?.some((child) => child.path === location.pathname),
      );

    if (parentWithActiveChild) {
      setOpenDropdown(parentWithActiveChild.id);
    }
  }, [showContent, location.pathname, visibleNavGroups]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <aside
      className={`fixed top-0 left-0 z-9999 flex h-dvh max-h-dvh flex-col overflow-hidden border-r border-gray-200 bg-gray-50 px-5 transition-all duration-300 ease-in-out overscroll-contain xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
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
        className={`sidebar-header flex h-20 shrink-0 items-center gap-2 xl:h-auto xl:pt-8 xl:pb-7 ${
  !showContent ? "xl:justify-center" : "justify-between"
}`}
      >
        <Link
          to="/"
          className={`hidden items-center xl:inline-flex ${
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

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-6 pt-2 duration-300 ease-linear">
        <nav>
          {visibleNavGroups.map((group) => (
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
                            ? "bg-brand-50 dark:bg-brand-500/10"
                            : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span
                          className={`shrink-0 [&_svg]:size-5 ${
                            isActive
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-white/90"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {showContent && (
                          <span
                            className={`menu-item-text min-w-0 flex-1 truncate text-left ${
                              isActive
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-white/90"
                            }`}
                          >
                            {item.label}
                          </span>
                        )}

                        {showContent && <NavBadges badges={item.badges} />}

                        {hasChildren && showContent && (
                          <ChevronDownIcon
                            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                              isOpen
                                ? "rotate-180 text-brand-600 dark:text-brand-400"
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
                                      className={`flex items-center gap-2 text-sm hover:text-gray-800 dark:hover:text-white/90 ${
                                        isChildActive
                                          ? "text-brand-800 dark:text-brand-400"
                                          : "text-gray-500 dark:text-gray-400"
                                      }`}
                                    >
                                      <span className="min-w-0 flex-1 truncate">
                                        {child.label}
                                      </span>
                                      <NavBadges badges={child.badges} />
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
