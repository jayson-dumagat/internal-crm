import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router";
import { cn } from "../../utils";
import { formatDisplayDate } from "../../utils/date";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  createdAt: string | null;
};

function normalizeNotification(payload: unknown): NotificationItem | null {
  if (!payload || typeof payload !== "object") return null;

  const value = payload as Record<string, unknown>;
  const title = typeof value.title === "string" ? value.title : "Activity update";
  const message = typeof value.message === "string" ? value.message : title;
  const category = typeof value.category === "string" ? value.category : "Activity";
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : null;
  const id = typeof value.id === "string" ? value.id : `${title}-${message}-${createdAt ?? Date.now()}`;

  return { id, title, message, category, createdAt };
}

function formatNotificationTime(value: string | null): string {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} min ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} hr ago`;
  return formatDisplayDate(value);
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const socketUrl = configuredApiUrl?.startsWith("http")
      ? new URL(configuredApiUrl).origin
      : window.location.origin;
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleNotification = (payload: unknown) => {
      const notification = normalizeNotification(payload);
      if (!notification) return;

      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 25));
      setNotifying(true);
    };

    socket.on("notification.created", handleNotification);
    return () => {
      socket.off("notification.created", handleNotification);
      socket.disconnect();
    };
  }, []);

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    setIsOpen((open) => !open);
    setNotifying(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={cn(
            "absolute top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-orange-400",
            !notifying ? "hidden" : "flex",
          )}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -left-13.5 mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg sm:w-[361px] xl:right-0 xl:left-auto dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Live activity updates
            </p>
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={closeDropdown}
            className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="flex flex-1 items-center justify-center px-4 py-16 text-center">
              <div>
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  <svg className="size-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 1.667a6.667 6.667 0 0 0-6.667 6.666v3.333l-1.25 1.667h15.834l-1.25-1.667V8.333A6.667 6.667 0 0 0 10 1.667Zm-2.083 13.75a2.083 2.083 0 0 0 4.166 0H7.917Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  No new notifications
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Updates will appear here in real time.
                </p>
              </div>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 text-left hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold uppercase text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    {notification.category.slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 block truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {notification.title}
                    </span>
                    <span className="line-clamp-2 block text-theme-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                      <span>{notification.category}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      <time dateTime={notification.createdAt ?? undefined}>
                        {formatNotificationTime(notification.createdAt)}
                      </time>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        <Link
          to="/activities"
          onClick={closeDropdown}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View Activity Log
        </Link>
      </Dropdown>
    </div>
  );
}
