// Shared utility functions for both client and server

/**
 * Maps JavaScript day number to Uzbek day name
 * 0 = Sunday (Yakshanba), 1 = Monday (Dushanba), etc.
 */
const DAY_NAMES_UZ = [
  'Yakshanba',  // Sunday
  'Dushanba',   // Monday
  'Seshanba',   // Tuesday
  'Chorshanba', // Wednesday
  'Payshanba',  // Thursday
  'Juma',       // Friday
  'Shanba'      // Saturday
];

/**
 * Checks if a given date is a scheduled class day based on the group's schedule
 * @param schedule - Array of schedule strings like ['Dushanba 14:00', 'Chorshanba 14:00']
 * @param date - Date to check (defaults to today)
 * @returns true if the date is a class day, false otherwise
 */
export function isScheduledClassDay(schedule: string[] | null | undefined, date: Date = new Date()): boolean {
  // If no schedule exists, assume no classes
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return false;
  }

  // Get the day name in Uzbek
  const dayIndex = date.getDay(); // 0-6 (Sunday-Saturday)
  const dayNameUz = DAY_NAMES_UZ[dayIndex];

  // Check if any schedule item contains this day name
  return schedule.some(scheduleItem => 
    typeof scheduleItem === 'string' && scheduleItem.includes(dayNameUz)
  );
}

/**
 * Gets the Uzbek name for a given date's day of week
 * @param date - Date to get day name for
 * @returns Uzbek day name
 */
export function getUzbekDayName(date: Date = new Date()): string {
  const dayIndex = date.getDay();
  return DAY_NAMES_UZ[dayIndex];
}
