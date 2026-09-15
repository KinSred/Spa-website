/**
 * Date utilities for localized Vietnamese date handling and ISO domain persistence.
 *
 * NOTE: Never compute current local day via new Date().toISOString().split("T")[0]
 * because toISOString() derives date parts in UTC, which causes a 1-day drift around
 * Vietnamese local midnight (UTC+7). Always derive local parts using getFullYear(),
 * getMonth(), and getDate().
 */

/**
 * Format a Date instance to ISO YYYY-MM-DD using local calendar date parts.
 */
export function formatLocalDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in ISO YYYY-MM-DD format based on local client time.
 */
export function getLocalTodayDateString(): string {
  return formatLocalDateToISO(new Date());
}

/**
 * Parse an ISO YYYY-MM-DD date string into a local Date object.
 */
export function parseISODate(isoString: string): Date {
  const parts = isoString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return new Date();
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

/**
 * Formats an ISO YYYY-MM-DD date string to Vietnamese visible format: dd/mm/yyyy.
 */
export function formatVietnameseDate(isoString: string): string {
  if (!isoString) return "";
  const parts = isoString.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  return isoString;
}

/**
 * Formats an ISO YYYY-MM-DD date string into a readable Vietnamese label:
 * e.g., "Thứ Hai, 16/09/2026" or "Hôm nay, 15/09/2026".
 */
export function formatVietnameseDateLong(isoString: string): string {
  if (!isoString) return "";
  const date = parseISODate(isoString);
  const todayISO = getLocalTodayDateString();
  const dayOfWeekNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayOfWeek = dayOfWeekNames[date.getDay()];
  const formatted = formatVietnameseDate(isoString);
  if (isoString === todayISO) {
    return `Hôm nay (${formatted})`;
  }
  return `${dayOfWeek}, ${formatted}`;
}

export type UpcomingDateOption = {
  iso: string;
  display: string;
  weekday: string;
  isToday: boolean;
};

/**
 * Returns an array of upcoming selectable dates starting from local today.
 */
export function getUpcomingDates(daysCount = 14): UpcomingDateOption[] {
  const options: UpcomingDateOption[] = [];
  const now = new Date();
  const todayISO = getLocalTodayDateString();

  const dayOfWeekShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  for (let i = 0; i < daysCount; i++) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const iso = formatLocalDateToISO(target);
    const day = String(target.getDate()).padStart(2, "0");
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const display = `${day}/${month}`;
    const weekday = i === 0 ? "Hôm nay" : dayOfWeekShort[target.getDay()];

    options.push({
      iso,
      display,
      weekday,
      isToday: iso === todayISO,
    });
  }

  return options;
}
