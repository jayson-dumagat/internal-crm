import { DatePicker, Portal, parseDate, type DateValue } from "@ark-ui/react";

import { ArrowRightAltIcon, CalenderIcon, ChevronLeftIcon } from "../../icons";
import { crmInputClassName } from "./FormPrimitives";
import { useSheetPortal } from "../ui/sheet/Sheet";

function toDateValue(value?: string) {
  if (!value) return undefined;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return undefined;
  }
}

function toIsoDateValue(value?: DateValue) {
  if (!value) return "";

  // Use the calendar parts so form values remain YYYY-MM-DD regardless of
  // browser locale or the DateValue string implementation.
  if (
    typeof value.year === "number" &&
    typeof value.month === "number" &&
    typeof value.day === "number"
  ) {
    return [
      String(value.year).padStart(4, "0"),
      String(value.month).padStart(2, "0"),
      String(value.day).padStart(2, "0"),
    ].join("-");
  }

  return value.toString().slice(0, 10);
}

export default function ArkDatePickerField({
  startValue,
  endValue,
  onChange,
  range = false,
  placeholder = "Select date",
  disabled = false,
  min,
  max,
}: {
  startValue: string;
  endValue?: string;
  onChange: (start: string, end?: string) => void;
  range?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}) {
  const sheetPortal = useSheetPortal();
  const value = [
    toDateValue(startValue),
    range ? toDateValue(endValue) : undefined,
  ].filter((item): item is DateValue => Boolean(item));

  return (
    <DatePicker.Root
      selectionMode={range ? "range" : "single"}
      value={value}
      onValueChange={({ value: nextValue }) => {
        onChange(
          toIsoDateValue(nextValue[0]),
          range ? toIsoDateValue(nextValue[1]) : undefined,
        );
      }}
      openOnClick
      closeOnSelect={!range}
      fixedWeeks
      disabled={disabled}
      min={toDateValue(min)}
      max={toDateValue(max)}
      className="relative w-full"
    >
      <DatePicker.Control className="relative flex items-center gap-2">
        <DatePicker.Input
          index={0}
          className={`${crmInputClassName} pr-10`}
          placeholder={range ? "Start date" : placeholder}
        />
        {range && (
          <DatePicker.Input
            index={1}
            className={`${crmInputClassName} pr-10`}
            placeholder="End date"
          />
        )}
        <DatePicker.Trigger
          aria-label="Open date picker"
          className="absolute right-2 inline-flex size-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <CalenderIcon className="size-4.5" aria-hidden="true" />
        </DatePicker.Trigger>
        <DatePicker.ClearTrigger className="sr-only">
          Clear date
        </DatePicker.ClearTrigger>
      </DatePicker.Control>
      <Portal container={sheetPortal ?? undefined}>
        <DatePicker.Positioner
          className="pointer-events-auto z-[999999]"
          style={{ zIndex: 999999 }}
        >
          <DatePicker.Content
            className="relative z-[999999] mt-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <DatePicker.View view="day">
              <DatePicker.ViewControl className="mb-3 flex items-center justify-between gap-2">
                <DatePicker.PrevTrigger
                  aria-label="Previous month"
                  className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                >
                  <ChevronLeftIcon className="size-4" />
                </DatePicker.PrevTrigger>
                <DatePicker.ViewTrigger className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  <DatePicker.RangeText />
                </DatePicker.ViewTrigger>
                <DatePicker.NextTrigger
                  aria-label="Next month"
                  className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                >
                  <ArrowRightAltIcon className="size-4" />
                </DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table className="w-full border-separate border-spacing-1">
                <DatePicker.TableHead>
                  <DatePicker.TableRow>
                    <DatePicker.Context>
                      {(api) =>
                        api.weekDays.map((day) => (
                          <DatePicker.TableHeader
                            key={day.value.toString()}
                            className="pb-1 text-center text-[11px] font-medium text-gray-400"
                          >
                            {day.narrow}
                          </DatePicker.TableHeader>
                        ))
                      }
                    </DatePicker.Context>
                  </DatePicker.TableRow>
                </DatePicker.TableHead>
                <DatePicker.TableBody>
                  <DatePicker.Context>
                    {(api) =>
                      api.weeks.map((week, weekIndex) => (
                        <DatePicker.TableRow key={weekIndex}>
                          {week.map((day) => (
                            <DatePicker.TableCell
                              key={day.toString()}
                              value={day}
                              visibleRange={api.visibleRange}
                              className="p-0 text-center"
                            >
                              <DatePicker.TableCellTrigger className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-xs text-gray-700 transition hover:bg-brand-50 hover:text-brand-600 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[selected]:bg-brand-500 data-[selected]:text-white data-[today]:font-semibold dark:text-gray-200 dark:hover:bg-brand-500/15 dark:hover:text-brand-300 data-[outside-range]:text-gray-300 dark:data-[outside-range]:text-gray-600">
                                {day.day}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))
                    }
                  </DatePicker.Context>
                </DatePicker.TableBody>
              </DatePicker.Table>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}
