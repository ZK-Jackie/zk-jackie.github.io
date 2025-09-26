/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @param locale The locale to use (default: "zh-CN")
 * @param timeZone The time zone to use (default: "Asia/Shanghai")
 * @returns Formatted date string (e.g., "February 26, 2025", "2025年2月26日")
 */
export function formatDate(
  date: Date | string,
  locale: Intl.UnicodeBCP47LocaleIdentifier = "zh-CN",
  timeZone: string = 'Asia/Shanghai'
): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timeZone
  }).format(date);
}

/**
 * Format a date to a short human-readable string
 * @param date The date to format
 * @param locale The locale to use (default: "zh-CN")
 * @param timeZone The time zone to use (default: "Asia/Shanghai")
 * @returns Formatted date string (e.g., "02/26/2025", "2025/02/26")
 */
export function formatDateShort(
  date: Date | string,
  locale: Intl.UnicodeBCP47LocaleIdentifier = "zh-CN",
  timeZone: string = 'Asia/Shanghai'
): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timeZone
  }).format(date);
}


/**
 * Format a time to a human-readable string
 * @param date The date to format
 * @param locale The locale to use (default: "zh-CN")
 * @param timeZone The time zone to use (default: "Asia/Shanghai")
 * @returns Formatted time string (e.g., ""February 26, 2025 14:30:00", "2025年2月26日 14:30:00")
 */
export function formatDatetime(
  date: Date | string,
  locale: Intl.UnicodeBCP47LocaleIdentifier = "zh-CN",
  timeZone: string = 'Asia/Shanghai'
): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timeZone
  }).format(date);
}

/**
 * Format a time to a human-readable string
 * @param date The date to format
 * @param locale The locale to use (default: "zh-CN")
 * @param timeZone The time zone to use (default: "Asia/Shanghai")
 * @param timeZoneName The time zone name format (default: "short")
 * @returns Formatted time string (e.g., ""February 26, 2025 14:30:00 GMT+8", "2025年2月26日 14:30:00 GMT+8")
 */
export function formatDatetimez(
  date: Date | string,
  locale: Intl.UnicodeBCP47LocaleIdentifier = "zh-CN",
  timeZone: string = 'Asia/Shanghai',
  timeZoneName: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" = "short"
): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: timeZoneName,
    timeZone: timeZone
  }).format(date);
}
