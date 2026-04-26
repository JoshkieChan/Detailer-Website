export type SlotBookingPackageId = 'maintenance' | 'deepReset';
export type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';

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

// Get blocked duration (service + buffer already included in BASE_BLOCK_DURATIONS)
// Add-ons are handled manually by owner - no automatic duration extensions
export const getBlockedDuration = ({
  packageId,
  vehicleType,
}: {
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
}): number => {
  return BASE_BLOCK_DURATIONS[packageId][vehicleType];
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
}: {
  date: string;
  packageId: SlotBookingPackageId;
  startTime: string;
  vehicleType?: VehicleTypeId;
}) => {
  const startMinutes = timeToMinutes(startTime);
  const blockDuration = BASE_BLOCK_DURATIONS[packageId][vehicleType];
  const endMinutes = startMinutes + blockDuration;
  const blockedUntilMinutes = endMinutes; // Buffer already included in block duration

  return {
    date,
    startTime,
    startMinutes,
    endTime: minutesToTime(endMinutes),
    endMinutes,
    blockedUntil: minutesToTime(blockedUntilMinutes),
    blockedUntilMinutes,
    serviceDuration: blockDuration,
    bufferMinutes: 60, // For display purposes only
    addOnMinutes: 0,
    vehicleType,
    hasHeavyAddOns: false,
  };
};

export const intervalsOverlap = (
  aStart: number,
  aEndExclusive: number,
  bStart: number,
  bEndExclusive: number
) => aStart < bEndExclusive && bStart < aEndExclusive;

// Capacity rules for daily bookings
// Business rule: Max 12 hours per day, max 1 Deep Reset per day
// Large Deep (9h) blocks entire day
// Small Deep (7h) allows max 1 Maintenance
// Sedan Deep (5h) allows max 2 Maintenance if total ≤ 12h
export const checkCapacityRules = ({
  packageId,
  vehicleType,
  existingBookings,
}: {
  packageId: SlotBookingPackageId;
  vehicleType: VehicleTypeId;
  existingBookings: Array<{ packageId: SlotBookingPackageId; vehicleType: VehicleTypeId }>;
}): { allowed: boolean; reason?: string } => {
  const newBookingDuration = BASE_BLOCK_DURATIONS[packageId][vehicleType];
  const isDeepReset = packageId === 'deepReset';
  const isLargeDeep = isDeepReset && vehicleType === 'largeSuvTruck';
  const isSmallDeep = isDeepReset && vehicleType === 'smallSuv';
  const isSedanDeep = isDeepReset && vehicleType === 'sedan';

  // Count existing Deep Resets on this day
  const existingDeepResets = existingBookings.filter(b => b.packageId === 'deepReset');
  const existingMaintenance = existingBookings.filter(b => b.packageId === 'maintenance');

  // Rule: Max 1 Deep Reset per day
  if (isDeepReset && existingDeepResets.length > 0) {
    return { allowed: false, reason: 'Only one Deep Reset allowed per day' };
  }

  // Rule: Large Deep (9h) blocks entire day - no other bookings allowed
  if (isLargeDeep && existingBookings.length > 0) {
    return { allowed: false, reason: 'Large Deep Reset blocks entire day' };
  }

  // If there's an existing Large Deep, no new bookings allowed
  const hasExistingLargeDeep = existingDeepResets.some(b => b.vehicleType === 'largeSuvTruck');
  if (hasExistingLargeDeep) {
    return { allowed: false, reason: 'Existing Large Deep Reset blocks entire day' };
  }

  // Rule: Small Deep (7h) allows max 1 Maintenance
  if (isSmallDeep && existingMaintenance.length > 0) {
    return { allowed: false, reason: 'Small Deep Reset allows only one Maintenance job' };
  }
  if (isDeepReset === false && existingDeepResets.some(b => b.vehicleType === 'smallSuv')) {
    return { allowed: false, reason: 'Existing Small Deep Reset allows only one Maintenance job' };
  }

  // Rule: Sedan Deep (5h) allows max 2 Maintenance if total ≤ 12h
  if (isSedanDeep && existingMaintenance.length >= 2) {
    return { allowed: false, reason: 'Sedan Deep Reset allows at most two Maintenance jobs' };
  }

  // Calculate total booked hours for the day
  let totalBookedMinutes = newBookingDuration;
  existingBookings.forEach(booking => {
    totalBookedMinutes += BASE_BLOCK_DURATIONS[booking.packageId][booking.vehicleType];
  });

  // Rule: Max 12 hours per day (720 minutes)
  if (totalBookedMinutes > 720) {
    return { allowed: false, reason: 'Day would exceed 12-hour limit' };
  }

  return { allowed: true };
};

export const isDateUnavailable = ({
  date,
  packageId,
  intervals,
  now = new Date(),
  vehicleType = 'sedan',
}: {
  date: string;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  now?: Date;
  vehicleType?: VehicleTypeId;
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

  // Extract existing bookings for this date to check capacity rules
  const existingBookings = intervals
    .filter(interval => interval.date === date)
    .map(interval => ({
      packageId: interval.packageId as SlotBookingPackageId,
      vehicleType: interval.vehicleType as VehicleTypeId,
    }));

  return !validSlots.some((slot) => {
    // Filter out past slots for today
    if (date === todayStr) {
      if (timeToMinutes(slot.value) <= currentMinutes) return false;
    }

    // Check capacity rules first
    const capacityCheck = checkCapacityRules({
      packageId,
      vehicleType,
      existingBookings,
    });
    if (!capacityCheck.allowed) {
      return false; // Slot not available due to capacity rules
    }

    const slotWindow = buildBookingWindow({ date, packageId, startTime: slot.value, vehicleType });
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
}) => !isDateUnavailable(args);

export const getNextAvailableOpening = ({
  fromDate,
  packageId,
  intervals,
  daysToScan = 30,
  vehicleType = 'sedan',
}: {
  fromDate: Date;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  daysToScan?: number;
  vehicleType?: VehicleTypeId;
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

      const window = buildBookingWindow({ date, packageId, startTime: slot.value, vehicleType });
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
