export type SlotBookingPackageId = 'maintenance' | 'deepReset';
export type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';
export type AddOnId = 'paintProtection' | 'petHairRemoval' | 'engineBay' | 'headlightRestoration';

export interface ServiceTimingRule {
  label: string;
  service: 'Maintenance Detail' | 'Deep Reset Detail';
  durationMinutes: number;
  bufferMinutes: number;
  approxLabel: string;
}

export const WORKDAY_START_MINUTES = 8 * 60;
export const WORKDAY_END_MINUTES = 20 * 60;
export const SLOT_INTERVAL_MINUTES = 60;

// Base block durations by vehicle size (service + 1-hour buffer already included)
// These are the premium time blocks the owner has chosen - do not shrink these
export const BASE_BLOCK_DURATIONS: Record<SlotBookingPackageId, Record<VehicleTypeId, number>> = {
  maintenance: {
    sedan: 180,      // 3 hours (2h service + 1h buffer)
    smallSuv: 240,   // 4 hours (3h service + 1h buffer)
    largeSuvTruck: 300, // 5 hours (4h service + 1h buffer)
  },
  deepReset: {
    sedan: 300,      // 5 hours (4h service + 1h buffer)
    smallSuv: 420,   // 7 hours (6h service + 1h buffer)
    largeSuvTruck: 540, // 9 hours (8h service + 1h buffer) - full-day primary job
  },
};

// Add-on durations by vehicle size (in minutes)
// These are added to base duration to calculate total booking time
export const ADD_ON_DURATIONS: Record<AddOnId, Record<VehicleTypeId, number>> = {
  paintProtection: {
    sedan: 120,      // 2.0 hours
    smallSuv: 180,   // 3.0 hours
    largeSuvTruck: 300, // 5.0 hours
  },
  petHairRemoval: {
    sedan: 60,       // 1.0 hour
    smallSuv: 120,   // 2.0 hours
    largeSuvTruck: 180, // 3.0 hours
  },
  engineBay: {
    sedan: 30,       // 0.5 hours (same for all sizes)
    smallSuv: 30,
    largeSuvTruck: 30,
  },
  headlightRestoration: {
    sedan: 60,       // 1.0 hour (same for all sizes)
    smallSuv: 60,
    largeSuvTruck: 60,
  },
};

// Legacy SERVICE_TIMING_RULES for backward compatibility (uses sedan duration as default)
export const SERVICE_TIMING_RULES: Record<SlotBookingPackageId, ServiceTimingRule> = {
  maintenance: {
    label: 'Maintenance Detail',
    service: 'Maintenance Detail',
    durationMinutes: 120,
    bufferMinutes: 60,
    approxLabel: 'Approx. 2–4 hours, depending on vehicle size and condition.',
  },
  deepReset: {
    label: 'Deep Reset Detail',
    service: 'Deep Reset Detail',
    durationMinutes: 360,
    bufferMinutes: 60,
    approxLabel: 'Approx. 5–9+ hours, depending on vehicle size and condition.',
  },
};

// Get block duration (service + buffer already included) based on package and vehicle size
export const getServiceDuration = (packageId: SlotBookingPackageId, vehicleType: VehicleTypeId): number => {
  return BASE_BLOCK_DURATIONS[packageId][vehicleType];
};

// Get total duration (base + add-ons) in minutes
export const getTotalDuration = ({
  packageId,
  vehicleType,
  selectedAddOns = [],
}: {
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}): number => {
  const baseDuration = BASE_BLOCK_DURATIONS[packageId][vehicleType];
  const addOnDuration = selectedAddOns.reduce((total, addOnId) => {
    return total + ADD_ON_DURATIONS[addOnId][vehicleType];
  }, 0);
  return baseDuration + addOnDuration;
};

// Get blocked duration (service + buffer + add-ons)
export const getBlockedDuration = ({
  packageId,
  vehicleType,
  selectedAddOns = [],
}: {
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}): number => {
  return getTotalDuration({ packageId, vehicleType, selectedAddOns });
};

export interface ScheduledInterval {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  blockedUntil: string;
  source?: 'booking' | 'blackout';
  paymentStatus?: string;
  packageId?: SlotBookingPackageId;
  vehicleType?: VehicleTypeId;
  selectedAddOns?: AddOnId[];
  totalDurationMinutes?: number;
}

export const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor(minutes % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${mins}`;
};

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const parseDateString = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatWindowLabel = (startMinutes: number, endMinutes: number) =>
  `${minutesToTime(startMinutes)} to ${minutesToTime(endMinutes)}`;

export const getLatestBookableStart = (
  packageId: SlotBookingPackageId,
  vehicleType: VehicleTypeId = 'sedan'
) => {
  const blockDuration = BASE_BLOCK_DURATIONS[packageId][vehicleType];
  return WORKDAY_END_MINUTES - blockDuration;
};

export const getHourlyStartSlots = (
  packageId: SlotBookingPackageId,
  vehicleType: VehicleTypeId = 'sedan'
) => {
  const latestStart = getLatestBookableStart(packageId, vehicleType);
  const slots: Array<{ value: string; label: string }> = [];

  for (
    let startMinutes = WORKDAY_START_MINUTES;
    startMinutes <= latestStart;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const blockDuration = BASE_BLOCK_DURATIONS[packageId][vehicleType];
    const endMinutes = startMinutes + blockDuration;
    slots.push({
      value: minutesToTime(startMinutes),
      label: formatWindowLabel(startMinutes, endMinutes),
    });
  }

  return slots;
};

export const buildBookingWindow = ({
  date,
  packageId,
  startTime,
  vehicleType = 'sedan',
  selectedAddOns = [],
}: {
  date: string;
  packageId: SlotBookingPackageId;
  startTime: string;
  vehicleType?: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}) => {
  const startMinutes = timeToMinutes(startTime);
  const totalDuration = getTotalDuration({ packageId, vehicleType, selectedAddOns });
  const endMinutes = startMinutes + totalDuration;
  const blockedUntilMinutes = endMinutes; // Buffer already included in base duration

  return {
    date,
    startTime,
    startMinutes,
    endTime: minutesToTime(endMinutes),
    endMinutes,
    blockedUntil: minutesToTime(blockedUntilMinutes),
    blockedUntilMinutes,
    serviceDuration: totalDuration,
    bufferMinutes: 60, // For display purposes only
    addOnMinutes: selectedAddOns.reduce((total, addOnId) => total + ADD_ON_DURATIONS[addOnId][vehicleType], 0),
    vehicleType,
    selectedAddOns,
  };
};

export const intervalsOverlap = (
  aStart: number,
  aEndExclusive: number,
  bStart: number,
  bEndExclusive: number
) => aStart < bEndExclusive && bStart < aEndExclusive;

// Capacity rules for daily bookings
// Business rules:
// - Max 12 hours per day (720 minutes)
// - Full-day threshold: 10 hours (600 minutes) - booking ≥ 10h blocks entire day
// - Max 1 Deep Reset per day
// - Bookings must not overlap
export const checkCapacityRules = ({
  newBookingDuration,
  existingBookings,
}: {
  newBookingDuration: number;
  existingBookings: Array<{ totalDurationMinutes?: number }>;
}): { allowed: boolean; reason?: string; isFullDay?: boolean } => {
  const FULL_DAY_THRESHOLD_MINUTES = 600; // 10 hours
  const DAILY_MAX_MINUTES = 720; // 12 hours

  // Check if new booking is a full-day booking (≥ 10 hours)
  const isFullDayBooking = newBookingDuration >= FULL_DAY_THRESHOLD_MINUTES;

  // If new booking is full-day, no other bookings allowed on that day
  if (isFullDayBooking && existingBookings.length > 0) {
    return { allowed: false, reason: 'This booking is a full-day job and cannot share the day with other bookings', isFullDay: true };
  }

  // Check if any existing booking is a full-day booking
  const hasExistingFullDay = existingBookings.some(b => (b.totalDurationMinutes || 0) >= FULL_DAY_THRESHOLD_MINUTES);
  if (hasExistingFullDay) {
    return { allowed: false, reason: 'A full-day booking already exists on this day' };
  }

  // Calculate total booked hours for the day
  let totalBookedMinutes = newBookingDuration;
  existingBookings.forEach(booking => {
    totalBookedMinutes += booking.totalDurationMinutes || 0;
  });

  // Rule: Max 12 hours per day
  if (totalBookedMinutes > DAILY_MAX_MINUTES) {
    return { allowed: false, reason: 'Day would exceed 12-hour limit' };
  }

  return { allowed: true, isFullDay: isFullDayBooking };
};

export const isDateUnavailable = ({
  date,
  packageId,
  intervals,
  now = new Date(),
  vehicleType = 'sedan',
  selectedAddOns = [],
}: {
  date: string;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  now?: Date;
  vehicleType?: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}) => {
  const validSlots = getHourlyStartSlots(packageId, vehicleType);

  // Requirement: Sundays are unavailable
  const day = parseDateString(date).getDay();
  if (day === 0) return true;

  const pacificDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const todayStr = pacificDate;

  const pacificTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  const [h, m] = pacificTime.split(':').map(Number);
  const currentMinutes = h * 60 + m;

  // Calculate new booking total duration
  const newBookingDuration = getTotalDuration({ packageId, vehicleType, selectedAddOns });

  // Extract existing bookings for this date to check capacity rules
  const existingBookings = intervals
    .filter(interval => interval.date === date)
    .map(interval => ({
      totalDurationMinutes: interval.totalDurationMinutes || getTotalDuration({
        packageId: interval.packageId as SlotBookingPackageId,
        vehicleType: interval.vehicleType as VehicleTypeId,
        selectedAddOns: interval.selectedAddOns || [],
      }),
    }));

  return !validSlots.some((slot) => {
    // Filter out past slots for today
    if (date === todayStr) {
      if (timeToMinutes(slot.value) <= currentMinutes) return false;
    }

    // Check capacity rules first
    const capacityCheck = checkCapacityRules({
      newBookingDuration,
      existingBookings,
    });
    if (!capacityCheck.allowed) {
      return false; // Slot not available due to capacity rules
    }

    const slotWindow = buildBookingWindow({ date, packageId, startTime: slot.value, vehicleType, selectedAddOns });
    return !intervals.some((interval) => {
      if (interval.date !== date) return false;
      return intervalsOverlap(
        slotWindow.startMinutes,
        slotWindow.blockedUntilMinutes,
        timeToMinutes(interval.startTime),
        timeToMinutes(interval.blockedUntil)
      );
    });
  });
};

export const hasAvailableSlot = (args: {
  date: string;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  now?: Date;
  vehicleType?: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}) => !isDateUnavailable(args);

export const getNextAvailableOpening = ({
  fromDate,
  packageId,
  intervals,
  daysToScan = 30,
  vehicleType = 'sedan',
  selectedAddOns = [],
}: {
  fromDate: Date;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  daysToScan?: number;
  vehicleType?: VehicleTypeId;
  selectedAddOns?: AddOnId[];
}) => {
  const scanDate = new Date(fromDate);
  scanDate.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < daysToScan; dayOffset += 1) {
    const current = new Date(scanDate);
    current.setDate(scanDate.getDate() + dayOffset);
    const weekday = current.getDay();
    if (weekday === 0) continue;

    const date = current.toISOString().slice(0, 10);
    const slots = getHourlyStartSlots(packageId, vehicleType);

    for (const slot of slots) {
      // Filter out past slots for today
      const pacificTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(fromDate);
      const [h, m] = pacificTime.split(':').map(Number);
      const currentMinutes = h * 60 + m;

      if (dayOffset === 0 && timeToMinutes(slot.value) <= currentMinutes) {
        continue;
      }

      const window = buildBookingWindow({ date, packageId, startTime: slot.value, vehicleType, selectedAddOns });
      const overlaps = intervals.some((interval) => {
        if (interval.date !== date) return false;
        return intervalsOverlap(
          window.startMinutes,
          window.blockedUntilMinutes,
          timeToMinutes(interval.startTime),
          timeToMinutes(interval.blockedUntil)
        );
      });

      if (!overlaps) {
        return {
          date,
          startTime: slot.value,
          label: slot.label,
          serviceLabel: SERVICE_TIMING_RULES[packageId].label,
        };
      }
    }
  }

  return null;
};

// Check if booking is eligible for multi-day handling
// Only Deep Reset + Large SUV/Truck with total duration > 12 hours
export const isEligibleForMultiDay = ({
  packageId,
  vehicleType,
  totalDurationMinutes,
}: {
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
  totalDurationMinutes: number;
}): boolean => {
  const DAILY_MAX_MINUTES = 720; // 12 hours
  return (
    packageId === 'deepReset' &&
    vehicleType === 'largeSuvTruck' &&
    totalDurationMinutes > DAILY_MAX_MINUTES
  );
};

// Check if two consecutive days can accommodate a multi-day booking
export const canFitMultiDayBooking = ({
  startDate,
  totalDurationMinutes,
  intervalsByDate,
}: {
  startDate: string;
  totalDurationMinutes: number;
  intervalsByDate: Record<string, ScheduledInterval[]>;
}): { canFit: boolean; day1Date: string; day2Date: string; day1Minutes: number; day2Minutes: number } => {
  const DAILY_MAX_MINUTES = 720; // 12 hours

  const day1Date = startDate;
  const day2Date = new Date(startDate);
  day2Date.setDate(day2Date.getDate() + 1);
  const day2DateStr = day2Date.toISOString().slice(0, 10);

  // Check if day 2 is Sunday
  const day2Weekday = day2Date.getDay();
  if (day2Weekday === 0) {
    return { canFit: false, day1Date, day2Date: day2DateStr, day1Minutes: 0, day2Minutes: 0 };
  }

  // Calculate existing booked minutes for day 1
  const day1Intervals = intervalsByDate[day1Date] || [];
  const day1BookedMinutes = day1Intervals.reduce((total, interval) => {
    return total + (interval.totalDurationMinutes || 0);
  }, 0);

  // Calculate existing booked minutes for day 2
  const day2Intervals = intervalsByDate[day2DateStr] || [];
  const day2BookedMinutes = day2Intervals.reduce((total, interval) => {
    return total + (interval.totalDurationMinutes || 0);
  }, 0);

  // Calculate available minutes
  const day1Available = DAILY_MAX_MINUTES - day1BookedMinutes;
  const day2Available = DAILY_MAX_MINUTES - day2BookedMinutes;

  // Check if booking can fit across two days
  if (day1Available + day2Available >= totalDurationMinutes) {
    // Allocate up to 12 hours on day 1, rest on day 2
    const day1Minutes = Math.min(day1Available, DAILY_MAX_MINUTES);
    const day2Minutes = totalDurationMinutes - day1Minutes;

    // Check if day 2 can accommodate the remaining hours
    if (day2Minutes <= day2Available) {
      return { canFit: true, day1Date, day2Date: day2DateStr, day1Minutes, day2Minutes };
    }
  }

  return { canFit: false, day1Date, day2Date: day2DateStr, day1Minutes: 0, day2Minutes: 0 };
};
