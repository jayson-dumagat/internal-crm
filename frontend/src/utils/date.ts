import dayjs from "dayjs";

/**
 * Formats an ISO 8601 date or timestamp for the CRM UI.
 * API values remain ISO; only the presentation layer applies this format.
 */
export function formatDisplayDate(
  value: string | null | undefined,
  fallback = "—",
): string {
  if (!value) return fallback;

  const date = dayjs(value);
  return date.isValid() ? date.format("DD MMMM, YYYY") : fallback;
}
