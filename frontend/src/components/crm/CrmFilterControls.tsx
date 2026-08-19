import { useMemo } from "react";

import ArkCombobox, { type ArkComboboxOption } from "./ArkCombobox";
import ArkDatePickerField from "./ArkDatePickerField";

export type CrmFilterDefinition = {
  key: string;
  label: string;
  value: string;
  options: readonly ArkComboboxOption[];
  placeholder?: string;
};

type CrmFilterControlsProps = {
  filters: readonly CrmFilterDefinition[];
  dateFrom?: string;
  dateTo?: string;
  onChange: (key: string, value: string) => void;
  onDateChange?: (from: string, to?: string) => void;
  dateLabel?: string;
};

export default function CrmFilterControls({
  filters,
  dateFrom = "",
  dateTo = "",
  onChange,
  onDateChange,
  dateLabel = "Date range",
}: CrmFilterControlsProps) {
  const visibleFilters = useMemo(
    () => filters.filter((filter) => filter.options.length > 0),
    [filters],
  );

  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-3 dark:border-white/[0.05]">
      {visibleFilters.map((filter) => (
        <div key={filter.key} className="w-full min-w-[170px] sm:w-[190px]">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {filter.label}
          </label>
          <ArkCombobox
            value={filter.value}
            options={filter.options}
            onChange={(value) => onChange(filter.key, value)}
            placeholder={filter.placeholder ?? `Search ${filter.label.toLowerCase()}`}
          />
        </div>
      ))}
      {onDateChange ? (
        <div className="w-full min-w-[250px] sm:w-[320px]">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {dateLabel}
          </label>
          <ArkDatePickerField
            startValue={dateFrom}
            endValue={dateTo}
            range
            min="2000-01-01"
            max="2100-12-31"
            onChange={onDateChange}
            placeholder="Start date"
          />
        </div>
      ) : null}
    </div>
  );
}

export function toFilterOptions(
  values: readonly string[],
  emptyLabel = "All",
): ArkComboboxOption[] {
  const unique = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
  return [
    { value: "", label: emptyLabel },
    ...unique.map((value) => ({
      value,
      label: value
        .replace(/[\-_]/g, " ")
        .replace(/\b\w/g, (character: string) => character.toUpperCase()),
    })),
  ];
}

export function toIdFilterOptions(
  values: readonly { id: string | number; name: string }[],
  emptyLabel = "All",
): ArkComboboxOption[] {
  const unique = Array.from(
    new Map(values.map((item) => [String(item.id), { value: String(item.id), label: item.name }])).values(),
  ).sort((left, right) => left.label.localeCompare(right.label));
  return [{ value: "", label: emptyLabel }, ...unique];
}
