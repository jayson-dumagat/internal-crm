import type { MouseEvent } from "react";

import type { PipelineView } from "./types";

interface PipelineTabsProps {
  views: PipelineView[];
  activeViewId: string;
  onChange: (viewId: string) => void;
  onCreateView: () => void;
  onCloseView: (viewId: string) => void;
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
}: PipelineTabsProps) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.05]">
      <nav className="-mb-px flex items-center gap-2 overflow-x-auto px-4 custom-scrollbar sm:px-5">
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
          title="Add pipeline view"
          onClick={onCreateView}
          className="inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-2.5 py-3 text-sm font-medium text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <PlusIcon />

          <span>Add view</span>
        </button>
      </nav>
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