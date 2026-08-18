import { Checkbox as ArkCheckbox } from "@ark-ui/react";
import type React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, id, onChange, className = "", disabled = false, ...ariaProps }) => (
  <ArkCheckbox.Root
    checked={checked}
    disabled={disabled}
    onCheckedChange={({ checked: nextChecked }) => onChange(nextChecked === true)}
    className={`inline-flex items-center justify-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    {...ariaProps}
  >
    <ArkCheckbox.HiddenInput id={id} />
    <ArkCheckbox.Control className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-white transition-colors outline-none data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500 focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:focus-visible:ring-gray-700">
      <ArkCheckbox.Indicator className="text-white">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    {label ? <ArkCheckbox.Label className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</ArkCheckbox.Label> : null}
  </ArkCheckbox.Root>
);

export default Checkbox;
