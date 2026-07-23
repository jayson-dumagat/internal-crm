import type { ComponentPropsWithoutRef } from "react";

import { SearchAltIcon } from "../../../icons";

type SearchFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  containerClassName?: string;
};

export default function SearchField({
  value,
  onValueChange,
  placeholder = "Search...",
  className = "",
  containerClassName = "",
  ...props
}: SearchFieldProps) {
  return (
    <div className={`relative w-full ${containerClassName}`}>
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <SearchAltIcon />
      </span>

      <input
        {...props}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={[
          "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300",
          "bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800",
          "shadow-theme-xs placeholder:text-gray-400",
          "focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10",
          "focus:outline-hidden",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90",
          "dark:placeholder:text-white/30 dark:focus:border-brand-800",
          className,
        ].join(" ")}
      />
    </div>
  );
}