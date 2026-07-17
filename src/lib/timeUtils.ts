import type { ShopSchedule } from '@/types';

// Sri Lanka Standard Time (GMT+5:30)
const TIMEZONE = 'Asia/Colombo';

export function checkShopStatus(schedules: ShopSchedule[] | undefined): { isOpen: boolean; nextActionTime?: string; reason?: string } {
  if (!schedules || schedules.length === 0) {
    return { isOpen: true }; // Default to open if no schedule is set
  }

  // Get current time in Sri Lankan timezone
  const now = new Date();
  
  // Format current date as YYYY-MM-DD in the target timezone
  const formatterDate = new Intl.DateTimeFormat('en-CA', { 
    timeZone: TIMEZONE, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const currentDateStr = formatterDate.format(now); // e.g. "2024-12-25"
  
  // Format current day of week (0 = Sunday, 1 = Monday)
  const formatterDay = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short'
  });
  const currentDayName = formatterDay.format(now);
  const dayNameMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  const currentDayOfWeek = dayNameMap[currentDayName];

  // Format current time as HH:mm
  const formatterTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const currentTimeStr = formatterTime.format(now); // e.g. "14:30"

  // 1. Check for a special day match
  const specialSchedule = schedules.find(s => s.type === 'special' && s.date === currentDateStr);
  
  if (specialSchedule) {
    if (!specialSchedule.isOpen) {
      return { isOpen: false, reason: specialSchedule.reason };
    }
    
    // Check if current time is within special day hours
    if (currentTimeStr >= specialSchedule.openTime && currentTimeStr <= specialSchedule.closeTime) {
      return { isOpen: true, nextActionTime: specialSchedule.closeTime, reason: specialSchedule.reason };
    } else {
      return { isOpen: false, reason: specialSchedule.reason };
    }
  }

  // 2. Check regular schedule for today
  const regularSchedule = schedules.find(s => s.type === 'regular' && s.dayOfWeek === currentDayOfWeek);
  
  if (regularSchedule) {
    if (!regularSchedule.isOpen) {
      return { isOpen: false };
    }
    
    // Check if current time is within regular hours
    if (currentTimeStr >= regularSchedule.openTime && currentTimeStr <= regularSchedule.closeTime) {
      return { isOpen: true, nextActionTime: regularSchedule.closeTime };
    } else {
      return { isOpen: false };
    }
  }

  // Default to closed if day is not found in schedule at all
  return { isOpen: false };
}
