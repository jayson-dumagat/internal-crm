import type React from "react";

export interface TabButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
}

export default function TabButton({
  label,
  icon,
  isActive,
  className = "",
  type = "button",
  ...props
}: TabButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      } ${className}`}
      {...props}
    >
      {icon}
      {label}
    </button>
  );
}