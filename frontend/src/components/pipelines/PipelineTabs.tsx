import type { MouseEvent, ReactNode } from "react";

import type { PipelineView } from "./types";

interface PipelineTabsProps {
  views: PipelineView[];
  activeViewId: string;
  onChange: (viewId: string) => void;
  onCreateView: () => void;
  onCloseView: (viewId: string) => void;
  canCreateView?: boolean;
  actions?: ReactNode;
}

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  canClose: boolean;
  onClick: () => void;
  onClose: () => void;
}

function TabButton({
  label,
  isActive,
  canClose,
  onClick,
  onClose,
}: TabButtonProps) {
  const handleClose = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <div
      className={[
        "group inline-flex shrink-0 items-center border-b-2 transition-colors duration-200 ease-in-out",
        isActive
          ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center py-3 pl-2.5 text-sm font-medium"
      >
        {label}
      </button>

      {canClose && (
        <button
          type="button"
          aria-label={`Close ${label} view`}
          title={`Close ${label} view`}
          onClick={handleClose}
          className={[
            "ml-1 mr-1.5 inline-flex size-6 items-center justify-center rounded-md transition",
            isActive
              ? "text-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:text-brand-400 dark:hover:bg-brand-500/10"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/[0.05] dark:hover:text-gray-300",
          ].join(" ")}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

export default function PipelineTabs({
  views,
  activeViewId,
  onChange,
  onCreateView,
  onCloseView,
  canCreateView = true,
  actions,
}: PipelineTabsProps) {
  return (
    <div className="flex min-w-0 flex-col border-b border-gray-100 sm:flex-row sm:items-center dark:border-white/[0.05]">
      <nav className="-mb-px flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-4 custom-scrollbar sm:px-5">
        {views.map((view) => (
          <TabButton
            key={view.id}
            id={view.id}
            label={view.name}
            isActive={activeViewId === view.id}
            canClose={views.length > 1}
            onClick={() => onChange(view.id)}
            onClose={() => onCloseView(view.id)}
          />
        ))}

        <button
          type="button"
          aria-label="Add pipeline view"
          title={canCreateView
            ? "Add pipeline view"
            : views.length >= 6
              ? "Maximum of 6 pipeline views reached"
              : "Read-only access"}
          onClick={onCreateView}
          disabled={!canCreateView}
          className="inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-2.5 py-3 text-sm font-medium text-gray-500 transition hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <PlusIcon />

          <span>Add view</span>
        </button>

        <span
          aria-label={`${views.length} of 6 pipeline views used`}
          title={`${views.length} of 6 pipeline views used`}
          className={[
            "mr-2 inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
            views.length >= 6
              ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"
              : views.length >= 5
                ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400"
                : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
          ].join(" ")}
        >
          {views.length}/6 views
        </span>
      </nav>
      {actions && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-4 py-2.5 sm:border-t-0 sm:pl-2 sm:pr-5 dark:border-white/[0.05]">
          {actions}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-3.5"
    >
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
