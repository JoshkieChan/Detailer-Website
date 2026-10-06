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
export const FULL_DAY_THRESHOLD_MINUTES = 600;
export const DAILY_MAX_MINUTES = 720;

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

export interface CapacitySegment {
  date: string;
  startTime: string;
  endTime: string;
  blockedUntil: string;
  durationMinutes: number;
  segmentIndex: number;
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

export const isServiceDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date && parsed.getUTCDay() !== 0;
};

export const pacificNow = (now = new Date()) => ({
  date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now),
  time: new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now),
});

export const isFutureSlot = (date: string, time: string, now = new Date()) => {
  const current = pacificNow(now);
  return date > current.date || (date === current.date && time > current.time);
};

export const formatWindowLabel = (startMinutes: number, endMinutes: number) =>
  `${minutesToTime(startMinutes)} to ${minutesToTime(endMinutes)}`;

export const getNextServiceDate = (date: string) => {
  const next = parseDateString(date);
  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDay() === 0);

  return [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getLatestBookableStart = (
  packageId: SlotBookingPackageId,
  vehicleType: VehicleTypeId = 'sedan',
  selectedAddOns: AddOnId[] = []
) => {
  const totalDuration = getTotalDuration({ packageId, vehicleType, selectedAddOns });

  if (isEligibleForMultiDay({ packageId, vehicleType, totalDurationMinutes: totalDuration })) {
    const minimumDayOneMinutes = Math.max(0, totalDuration - DAILY_MAX_MINUTES);
    return WORKDAY_END_MINUTES - minimumDayOneMinutes;
  }

  return WORKDAY_END_MINUTES - totalDuration;
};

export const getHourlyStartSlots = (
  packageId: SlotBookingPackageId,
  vehicleType: VehicleTypeId = 'sedan',
  selectedAddOns: AddOnId[] = []
) => {
  const latestStart = getLatestBookableStart(packageId, vehicleType, selectedAddOns);
  const totalDuration = getTotalDuration({ packageId, vehicleType, selectedAddOns });
  const isMultiDay = isEligibleForMultiDay({ packageId, vehicleType, totalDurationMinutes: totalDuration });
  const slots: Array<{ value: string; label: string }> = [];

  for (
    let startMinutes = WORKDAY_START_MINUTES;
    startMinutes <= latestStart;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = isMultiDay ? WORKDAY_END_MINUTES : startMinutes + totalDuration;
    slots.push({
      value: minutesToTime(startMinutes),
      label: isMultiDay
        ? `${formatWindowLabel(startMinutes, endMinutes)} + next service day`
        : formatWindowLabel(startMinutes, endMinutes),
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
  const segments = buildCapacitySegments({ date, packageId, vehicleType, selectedAddOns, startTime });
  const isMultiDay = segments.length > 1;
  const endMinutes = startMinutes + totalDuration;
  const blockedUntilMinutes = isMultiDay ? WORKDAY_END_MINUTES : endMinutes; // Buffer already included in base duration

  return {
    date,
    startTime,
    startMinutes,
    endTime: minutesToTime(blockedUntilMinutes),
    endMinutes,
    blockedUntil: minutesToTime(blockedUntilMinutes),
    blockedUntilMinutes,
    serviceDuration: totalDuration,
    isMultiDay,
    segments,
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

export const buildCapacitySegments = ({
  date,
  packageId,
  vehicleType,
  selectedAddOns = [],
  startTime,
}: {
  date: string;
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
  selectedAddOns?: AddOnId[];
  startTime: string;
}): CapacitySegment[] => {
  if (!isServiceDate(date) || !/^(0[8-9]|1\d):00$/.test(startTime)) return [];
  const totalDuration = getTotalDuration({ packageId, vehicleType, selectedAddOns });
  const startMinutes = timeToMinutes(startTime);
  const isMultiDay = isEligibleForMultiDay({ packageId, vehicleType, totalDurationMinutes: totalDuration });

  if (!isMultiDay) {
    const endMinutes = startMinutes + totalDuration;
    if (startMinutes < WORKDAY_START_MINUTES || endMinutes > WORKDAY_END_MINUTES) return [];
    return [{
      date,
      startTime,
      endTime: minutesToTime(endMinutes),
      blockedUntil: minutesToTime(endMinutes),
      durationMinutes: totalDuration,
      segmentIndex: 1,
    }];
  }

  const dayOneMinutes = WORKDAY_END_MINUTES - startMinutes;
  const dayTwoMinutes = totalDuration - dayOneMinutes;

  if (
    startMinutes < WORKDAY_START_MINUTES ||
    dayOneMinutes <= 0 ||
    dayOneMinutes > DAILY_MAX_MINUTES ||
    dayTwoMinutes <= 0 ||
    dayTwoMinutes > DAILY_MAX_MINUTES
  ) {
    return [];
  }

  const dayTwoEnd = WORKDAY_START_MINUTES + dayTwoMinutes;

  return [
    {
      date,
      startTime,
      endTime: minutesToTime(WORKDAY_END_MINUTES),
      blockedUntil: minutesToTime(WORKDAY_END_MINUTES),
      durationMinutes: dayOneMinutes,
      segmentIndex: 1,
    },
    {
      date: getNextServiceDate(date),
      startTime: minutesToTime(WORKDAY_START_MINUTES),
      endTime: minutesToTime(dayTwoEnd),
      blockedUntil: minutesToTime(dayTwoEnd),
      durationMinutes: dayTwoMinutes,
      segmentIndex: 2,
    },
  ];
};

// Capacity rules for daily bookings
// Business rules:
// - Max 12 hours per day (720 minutes)
// - Full-day threshold: 10 hours (600 minutes) - booking ≥ 10h blocks entire day
// - Bookings must not overlap
export const checkCapacityRules = ({
  newBookingDuration,
  existingBookings,
}: {
  newBookingDuration: number;
  existingBookings: Array<{ totalDurationMinutes?: number }>;
}): { allowed: boolean; reason?: string; isFullDay?: boolean } => {
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

export const validateCapacitySegments = ({
  segments,
  intervalsByDate,
}: {
  segments: CapacitySegment[];
  intervalsByDate: Record<string, ScheduledInterval[]>;
}): { allowed: boolean; reason?: string } => {
  if (segments.length === 0) {
    return { allowed: false, reason: 'Booking cannot fit within available service days.' };
  }

  for (const segment of segments) {
    const intervals = intervalsByDate[segment.date] || [];
    const existingBookings = intervals.map((interval) => ({
      totalDurationMinutes: interval.totalDurationMinutes ?? Math.max(0, timeToMinutes(interval.blockedUntil) - timeToMinutes(interval.startTime)),
    }));
    const capacityCheck = checkCapacityRules({
      newBookingDuration: segment.durationMinutes,
      existingBookings,
    });

    if (!capacityCheck.allowed) {
      return { allowed: false, reason: capacityCheck.reason };
    }

    const start = timeToMinutes(segment.startTime);
    const end = timeToMinutes(segment.blockedUntil);
    const overlaps = intervals.some((interval) =>
      intervalsOverlap(
        start,
        end,
        timeToMinutes(interval.startTime),
        timeToMinutes(interval.blockedUntil)
      )
    );

    if (overlaps) {
      return { allowed: false, reason: 'Booking time overlaps with existing booking or blackout.' };
    }
  }

  return { allowed: true };
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
  const validSlots = getHourlyStartSlots(packageId, vehicleType, selectedAddOns);
  if (!isServiceDate(date) || date < pacificNow(now).date) return true;

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

  return !validSlots.some((slot) => {
    // Filter out past slots for today
    if (date === todayStr) {
      if (timeToMinutes(slot.value) <= currentMinutes) return false;
    }

    const segments = buildCapacitySegments({ date, packageId, startTime: slot.value, vehicleType, selectedAddOns });
    const intervalsByDate = intervals.reduce<Record<string, ScheduledInterval[]>>((acc, interval) => {
      acc[interval.date] = acc[interval.date] || [];
      acc[interval.date].push(interval);
      return acc;
    }, {});
    return validateCapacitySegments({ segments, intervalsByDate }).allowed;
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
  const scanDate = new Date(pacificNow(fromDate).date + 'T12:00:00Z');

  for (let dayOffset = 0; dayOffset < daysToScan; dayOffset += 1) {
    const current = new Date(scanDate);
    current.setUTCDate(scanDate.getUTCDate() + dayOffset);
    const weekday = current.getUTCDay();
    if (weekday === 0) continue;

    const date = current.toISOString().slice(0, 10);
    const slots = getHourlyStartSlots(packageId, vehicleType, selectedAddOns);

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

      const segments = buildCapacitySegments({ date, packageId, startTime: slot.value, vehicleType, selectedAddOns });
      const intervalsByDate = intervals.reduce<Record<string, ScheduledInterval[]>>((acc, interval) => {
        acc[interval.date] = acc[interval.date] || [];
        acc[interval.date].push(interval);
        return acc;
      }, {});
      const overlaps = !validateCapacitySegments({ segments, intervalsByDate }).allowed;

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
  const day1Date = startDate;
  const day2DateStr = getNextServiceDate(startDate);

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
