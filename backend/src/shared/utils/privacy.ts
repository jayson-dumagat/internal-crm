/**
 * Privacy-preserving display value used when a field is readable only in part.
 * The API owns this transformation so clients never receive the original value.
 */
export function maskSensitive(value: unknown, fallback = "—"): string {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  if (text.length <= 6) return `${text.slice(0, 2)}…${text.slice(-2)}`;
  return `${text.slice(0, 3)}..${text.slice(-3)}`;
}
