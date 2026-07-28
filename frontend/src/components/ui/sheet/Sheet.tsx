import { useEffect } from "react";
import Overlay from "../overlay/Overlay";

type SheetSide = "left" | "right" | "top" | "bottom";

type SheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: SheetSide;
  className?: string;
  showCloseButton?: boolean;
};

const sideClasses: Record<SheetSide, string> = {
  right:
    "right-0 top-0 h-full w-full max-w-md translate-x-0 rounded-l-2xl sm:max-w-lg",
  left:
    "left-0 top-0 h-full w-full max-w-md translate-x-0 rounded-r-2xl sm:max-w-lg",
  top: "left-0 top-0 w-full translate-y-0 rounded-b-2xl",
  bottom: "bottom-0 left-0 w-full translate-y-0 rounded-t-2xl",
};

export default function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  className = "",
  showCloseButton = true,
}: SheetProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <Overlay isOpen={isOpen} onClose={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={[
          "fixed z-99999 bg-white shadow-theme-xl dark:bg-gray-900",
          "animate-in duration-200",
          sideClasses[side],
          className,
        ].join(" ")}
      >
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sheet"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        <div className="max-h-[calc(100vh-73px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}