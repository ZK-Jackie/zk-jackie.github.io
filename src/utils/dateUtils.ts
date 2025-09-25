/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @param locale The locale to use (default: "zh-CN")
 * @returns Formatted date string (e.g., "February 26, 2025")
 */
export function formatDate(
  date: Date | string,
  locale: Intl.UnicodeBCP47LocaleIdentifier = "zh-CN"
): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
