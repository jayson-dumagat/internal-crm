import { Combobox, createListCollection, Portal } from "@ark-ui/react";
import { useMemo, type ReactNode } from "react";

import { CheckLineIcon, ChevronDownIcon, CloseIcon } from "../../icons";
import { crmInputClassName } from "./FormPrimitives";
import { useSheetPortal } from "../ui/sheet/Sheet";

export type ArkComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export default function ArkCombobox({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  clearable = true,
  startAdornment,
}: {
  value: string;
  options: readonly ArkComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  startAdornment?: ReactNode;
}) {
  const sheetPortal = useSheetPortal();
  const collection = useMemo(
    () =>
      createListCollection<ArkComboboxOption>({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [options],
  );

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={({ value: nextValue }) => onChange(nextValue[0] ?? "")}
      openOnClick
      disabled={disabled}
      className="relative w-full"
    >
      <Combobox.Control className="relative">
        <Combobox.Input
          className={`${crmInputClassName} pr-20 ${startAdornment ? "pl-11" : ""}`}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {startAdornment ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center">
            {startAdornment}
          </span>
        ) : null}
        {clearable && value && !disabled ? (
          <Combobox.ClearTrigger
            aria-label="Clear selection"
            className="absolute right-10 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <CloseIcon className="size-3.5" />
          </Combobox.ClearTrigger>
        ) : null}
        <Combobox.Trigger
          aria-label="Open options"
          className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ChevronDownIcon className="size-4.5" />
        </Combobox.Trigger>
      </Combobox.Control>
      <Portal container={sheetPortal ?? undefined}>
        <Combobox.Positioner className="pointer-events-auto z-[100000] w-[var(--reference-width)]">
          <Combobox.Content
            className="mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Combobox.Empty className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No matches found.
            </Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item
                key={item.value}
                item={item}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:text-gray-200 dark:data-[highlighted]:bg-brand-500/10 dark:data-[highlighted]:text-brand-300"
              >
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator className="text-brand-500">
                  <CheckLineIcon className="size-4" />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}
