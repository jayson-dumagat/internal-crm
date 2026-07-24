import { useEffect } from "react";

type OverlayProps = {
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  blur?: boolean;
};

export default function Overlay({
  isOpen,
  onClose,
  className = "",
  blur = true,
}: OverlayProps) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className={[
        "fixed inset-0 z-99999 bg-gray-900/40",
        blur ? "backdrop-blur-sm" : "",
        className,
      ].join(" ")}
    />
  );
}