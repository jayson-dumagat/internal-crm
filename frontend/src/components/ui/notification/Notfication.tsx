import { useState } from "react";
import {
  AlertHexaIcon,
  CheckCircleIcon,
  CloseIcon,
  ErrorHexaIcon,
  InfoIcon,
} from "../../../icons";

interface NotificationProps {
  variant: "success" | "info" | "warning" | "error"; // Notification type
  title: string; // Title text
  description?: string; // Optional description
  hideDuration?: number; // Time in milliseconds to hide the notification (default: 5000ms)
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  variant,
  title,
  description,
  hideDuration = 3000, // Default hide duration: 5 seconds
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Styling configuration for each alert type
  const variantStyles = {
    success: {
      borderColor: "border-success-500",
      iconBg: "bg-success-50 text-success-500",
      icon: <CheckCircleIcon />,
    },
    info: {
      borderColor: "border-blue-light-500",
      iconBg: "bg-blue-light-50 text-blue-light-500",
      icon: <InfoIcon />,
    },
    warning: {
      borderColor: "border-warning-500",
      iconBg: "bg-warning-50 text-warning-500",
      icon: <AlertHexaIcon />,
    },
    error: {
      borderColor: "border-error-500",
      iconBg: "bg-error-50 text-error-500",
      icon: <ErrorHexaIcon className="size-5" />,
    },
  };

  const { borderColor, iconBg, icon } = variantStyles[variant];

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    // Hide the notification
    setIsVisible(false);

    // Show it again after the specified time
    setTimeout(() => {
      setIsVisible(true);
    }, hideDuration);
  };

  if (!isVisible) return null; // Don't render anything if not visible

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded-md border-b-4 bg-white p-3 shadow-theme-sm sm:max-w-[340px] dark:bg-[#1E2634] ${borderColor}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>

        {/* Title and Description */}
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-gray-800 sm:text-base dark:text-white/90">
            {title}
          </h4>
          {description && (
            <p className="mt-1 break-words text-xs leading-5 text-gray-600 sm:text-sm dark:text-white/70">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={handleClose}
        className="shrink-0 text-gray-400 transition hover:text-gray-800 dark:hover:text-white/90"
      >
        <CloseIcon className="size-5" />
      </button>
    </div>
  );
};

export default Notification;
