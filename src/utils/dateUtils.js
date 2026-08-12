/**
 * Utility functions for parsing and checking holiday dates and ranges.
 */

// Helper to parse a single date string into a Date object at midnight (00:00:00) local time
export const parseHolidaySingleDate = (str) => {
  if (!str) return null;
  const s = str.trim();
  let day, month, year;

  if (s.includes('/')) {
    const parts = s.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else if (s.includes('-')) {
    const parts = s.split('-');
    if (parts[0].length === 4) { // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else { // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  }

  if (year && month !== undefined && !isNaN(month) && day && !isNaN(day)) {
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  return null;
};

// Helper to parse date range strings like "13/08/2026 to 15/08/2026" or single dates like "13/08/2026"
export const parseHolidayRange = (holidayDateStr) => {
  if (!holidayDateStr) return { start: null, end: null };
  const str = holidayDateStr.trim();
  const parts = str.split(/\s+(?:to|-|until|till)\s+/i);
  let startDate = null;
  let endDate = null;

  if (parts.length > 1) {
    startDate = parseHolidaySingleDate(parts[0]);
    endDate = parseHolidaySingleDate(parts[parts.length - 1]);
  } else {
    startDate = parseHolidaySingleDate(str);
    endDate = startDate;
  }

  if (!startDate && endDate) startDate = endDate;
  if (!endDate && startDate) endDate = startDate;

  return { start: startDate, end: endDate };
};

// Check if holiday has expired (today > holiday end date 23:59:59)
export const isHolidayExpired = (holidayDateStr) => {
  if (!holidayDateStr) return false;
  const { end } = parseHolidayRange(holidayDateStr);
  if (!end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);

  return today > endOfDay;
};

// Check if a specific date (checkDateInput e.g. "2026-08-12" or a Date object) falls ON the holiday range
export const isDateOnHoliday = (checkDateInput, holidayDateStr) => {
  if (!checkDateInput || !holidayDateStr) return false;

  const { start, end } = parseHolidayRange(holidayDateStr);
  if (!start || !end) return false;

  if (isHolidayExpired(holidayDateStr)) return false;

  let checkDate = null;
  if (typeof checkDateInput === 'string') {
    checkDate = parseHolidaySingleDate(checkDateInput);
  } else if (checkDateInput instanceof Date) {
    checkDate = new Date(checkDateInput);
    checkDate.setHours(0, 0, 0, 0);
  }

  if (!checkDate) return false;

  const startTime = new Date(start).setHours(0, 0, 0, 0);
  const endTime = new Date(end).setHours(23, 59, 59, 999);
  const targetTime = checkDate.getTime();

  return targetTime >= startTime && targetTime <= endTime;
};
