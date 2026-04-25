export type SlotBookingPackageId = 'maintenance' | 'deepReset';

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

export const SERVICE_TIMING_RULES: Record<SlotBookingPackageId, ServiceTimingRule> = {
  maintenance: {
    label: 'Maintenance Detail',
    service: 'Maintenance Detail',
    durationMinutes: 120,
    bufferMinutes: 60,
    approxLabel: 'Approx. 2 hours',
  },
  deepReset: {
    label: 'Deep Reset Detail',
    service: 'Deep Reset Detail',
    durationMinutes: 360,
    bufferMinutes: 60,
    approxLabel: 'Approx. 6 hours',
  },
};

export interface ScheduledInterval {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  blockedUntil: string;
  source?: 'booking' | 'blackout';
  paymentStatus?: string;
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

export const getLatestBookableStart = (packageId: SlotBookingPackageId) =>
  WORKDAY_END_MINUTES -
  SERVICE_TIMING_RULES[packageId].durationMinutes -
  SERVICE_TIMING_RULES[packageId].bufferMinutes;

export const buildBookingWindow = ({
  date,
  packageId,
  startTime,
}: {
  date: string;
  packageId: SlotBookingPackageId;
  startTime: string;
}) => {
  const startMinutes = timeToMinutes(startTime);
  const rule = SERVICE_TIMING_RULES[packageId];
  const endMinutes = startMinutes + rule.durationMinutes;
  const blockedUntilMinutes = endMinutes + rule.bufferMinutes;

  return {
    date,
    startTime,
    startMinutes,
    endTime: minutesToTime(endMinutes),
    endMinutes,
    blockedUntil: minutesToTime(blockedUntilMinutes),
    blockedUntilMinutes,
    rule,
  };
};

export const getHourlyStartSlots = (packageId: SlotBookingPackageId) => {
  const latestStart = getLatestBookableStart(packageId);
  const slots: Array<{ value: string; label: string }> = [];

  for (
    let startMinutes = WORKDAY_START_MINUTES;
    startMinutes <= latestStart;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = startMinutes + SERVICE_TIMING_RULES[packageId].durationMinutes;
    slots.push({
      value: minutesToTime(startMinutes),
      label: formatWindowLabel(startMinutes, endMinutes),
    });
  }

  return slots;
};

export const intervalsOverlap = (
  aStart: number,
  aEndExclusive: number,
  bStart: number,
  bEndExclusive: number
) => aStart < bEndExclusive && bStart < aEndExclusive;

export const isDateUnavailable = ({
  date,
  packageId,
  intervals,
  now = new Date(),
}: {
  date: string;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  now?: Date;
}) => {
  const validSlots = getHourlyStartSlots(packageId);

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

    const slotWindow = buildBookingWindow({ date, packageId, startTime: slot.value });
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
}) => !isDateUnavailable(args);

export const getNextAvailableOpening = ({
  fromDate,
  packageId,
  intervals,
  daysToScan = 30,
}: {
  fromDate: Date;
  packageId: SlotBookingPackageId;
  intervals: ScheduledInterval[];
  daysToScan?: number;
}) => {
  const scanDate = new Date(fromDate);
  scanDate.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < daysToScan; dayOffset += 1) {
    const current = new Date(scanDate);
    current.setDate(scanDate.getDate() + dayOffset);
    const weekday = current.getDay();
    if (weekday === 0) continue;

    const date = current.toISOString().slice(0, 10);
    const slots = getHourlyStartSlots(packageId);

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

      const window = buildBookingWindow({ date, packageId, startTime: slot.value });
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
