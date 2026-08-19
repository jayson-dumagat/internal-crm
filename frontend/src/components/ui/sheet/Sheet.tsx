import { Drawer as ArkDrawer } from "@ark-ui/react";
import { createContext, useContext, useRef, type RefObject } from "react";

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
  left: "left-0 top-0 h-full w-full max-w-md translate-x-0 rounded-r-2xl sm:max-w-lg",
  top: "left-0 top-0 w-full translate-y-0 rounded-b-2xl",
  bottom: "bottom-0 left-0 w-full translate-y-0 rounded-t-2xl",
};

const swipeDirections: Record<SheetSide, "start" | "end" | "up" | "down"> = {
  right: "end",
  left: "start",
  top: "up",
  bottom: "down",
};

// Floating Ark controls need to remain inside the modal content tree. A body
// portal becomes inert when this drawer is modal, which makes combobox and
// date-picker popovers invisible/non-interactive. The target below preserves
// the drawer's focus and accessibility behavior while allowing overlays to
// escape the scrollable form body.
const SheetPortalContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function useSheetPortal() {
  return useContext(SheetPortalContext);
}

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
  const floatingContainer = useRef<HTMLDivElement | null>(null);

  return (
    <SheetPortalContext.Provider value={floatingContainer}>
      <ArkDrawer.Root
        open={isOpen}
        onOpenChange={({ open }) => {
          if (!open) onClose();
        }}
        swipeDirection={swipeDirections[side]}
        closeOnInteractOutside
        closeOnEscape
        modal
        restoreFocus
        preventScroll
      >
        <ArkDrawer.Backdrop className="pointer-events-none fixed inset-0 z-99998 bg-black/50 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:pointer-events-auto data-[state=open]:opacity-100" />
        <ArkDrawer.Positioner className="pointer-events-none fixed inset-0 z-99999 data-[state=open]:pointer-events-auto">
          <ArkDrawer.Content
            aria-label={title ?? "Dialog"}
            data-side={side}
            className={[
              "fixed bg-white shadow-theme-xl outline-none dark:bg-gray-900",
              "will-change-transform",
              "data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0",
              sideClasses[side],
              className,
            ].join(" ")}
          >
            {(title || description || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
                <div className="min-w-0">
                  {title && (
                    <ArkDrawer.Title className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {title}
                    </ArkDrawer.Title>
                  )}

                  {description && (
                    <ArkDrawer.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </ArkDrawer.Description>
                  )}
                </div>

                {showCloseButton && (
                  <ArkDrawer.CloseTrigger
                    type="button"
                    aria-label="Close sheet"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <CloseIcon />
                  </ArkDrawer.CloseTrigger>
                )}
              </div>
            )}

            <div className="max-h-[calc(100vh-73px)] overflow-y-auto p-5">
              {children}
            </div>
            <div
              ref={floatingContainer}
              className="pointer-events-none absolute inset-0 z-[100001] overflow-visible"
            />
          </ArkDrawer.Content>
        </ArkDrawer.Positioner>
      </ArkDrawer.Root>
    </SheetPortalContext.Provider>
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
