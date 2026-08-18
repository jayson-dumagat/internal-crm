import type { ReactNode } from "react";
import { Field as ArkField, Fieldset as ArkFieldset } from "@ark-ui/react";
import { InfoIcon } from "../../icons";

export const crmInputClassName = "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
export const crmSecondaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";
export const crmPrimaryButtonClassName = "inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";

export function CrmFormField({ label, error, required = false, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return <ArkField.Root invalid={Boolean(error)} required={required} className="block">
    <ArkField.Label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <ArkField.RequiredIndicator className="text-error-500">*</ArkField.RequiredIndicator>}
    </ArkField.Label>
    {children}
    {error && <ArkField.ErrorText className="mt-1 block text-xs text-error-500">{error}</ArkField.ErrorText>}
  </ArkField.Root>;
}

export function CrmInfoSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <ArkFieldset.Root className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 dark:border-white/[0.05]"><ArkFieldset.Legend className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90"><span>{title}</span><span title={description} aria-label={description} className="inline-flex cursor-help text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400"><InfoIcon className="size-4" /></span></ArkFieldset.Legend>{children}</ArkFieldset.Root>;
}

export function CrmFieldsetSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <ArkFieldset.Root className="space-y-4 rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><ArkFieldset.Legend className="block text-sm font-semibold text-gray-800 dark:text-white/90">{title}</ArkFieldset.Legend><ArkFieldset.HelperText className="-mt-3 block text-xs text-gray-500 dark:text-gray-400">{description}</ArkFieldset.HelperText>{children}</ArkFieldset.Root>;
}
