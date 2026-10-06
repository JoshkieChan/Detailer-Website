import { describe, expect, it } from 'vitest';
import {
  buildCapacitySegments,
  checkCapacityRules,
  getHourlyStartSlots,
  getNextServiceDate,
  getTotalDuration,
  intervalsOverlap,
  isDateUnavailable,
  validateCapacitySegments,
  type ScheduledInterval,
} from './scheduler';

describe('scheduler capacity rules', () => {
  it('includes add-ons in duration and slot labels', () => {
    expect(getTotalDuration({
      packageId: 'maintenance',
      vehicleType: 'largeSuvTruck',
      selectedAddOns: ['paintProtection', 'petHairRemoval'],
    })).toBe(780);

    const slots = getHourlyStartSlots('maintenance', 'largeSuvTruck', ['engineBay']);
    expect(slots.at(-1)).toMatchObject({ value: '14:00', label: '14:00 to 19:30' });
  });

  it('allows adjacent intervals but rejects overlaps', () => {
    expect(intervalsOverlap(8 * 60, 11 * 60, 11 * 60, 14 * 60)).toBe(false);
    expect(intervalsOverlap(8 * 60, 11 * 60, 10 * 60, 14 * 60)).toBe(true);
  });

  it('enforces full-day and 12-hour daily limits', () => {
    expect(checkCapacityRules({
      newBookingDuration: 600,
      existingBookings: [{ totalDurationMinutes: 60 }],
    })).toMatchObject({ allowed: false });

    expect(checkCapacityRules({
      newBookingDuration: 300,
      existingBookings: [{ totalDurationMinutes: 300 }, { totalDurationMinutes: 180 }],
    })).toMatchObject({ allowed: false, reason: 'Day would exceed 12-hour limit' });
  });

  it('splits eligible multi-day bookings across the next service day', () => {
    const segments = buildCapacitySegments({
      date: '2026-10-10',
      packageId: 'deepReset',
      vehicleType: 'largeSuvTruck',
      selectedAddOns: ['paintProtection'],
      startTime: '08:00',
    });

    expect(getNextServiceDate('2026-10-10')).toBe('2026-10-12');
    expect(segments).toEqual([
      {
        date: '2026-10-10',
        startTime: '08:00',
        endTime: '20:00',
        blockedUntil: '20:00',
        durationMinutes: 720,
        segmentIndex: 1,
      },
      {
        date: '2026-10-12',
        startTime: '08:00',
        endTime: '10:00',
        blockedUntil: '10:00',
        durationMinutes: 120,
        segmentIndex: 2,
      },
    ]);
  });

  it('keeps eligible empty multi-day dates available', () => {
    expect(isDateUnavailable({
      date: '2026-10-09',
      packageId: 'deepReset',
      vehicleType: 'largeSuvTruck',
      selectedAddOns: ['paintProtection'],
      intervals: [],
      now: new Date('2026-10-05T12:00:00-07:00'),
    })).toBe(false);
  });

  it('validates every segment of a split booking', () => {
    const segments = buildCapacitySegments({
      date: '2026-10-09',
      packageId: 'deepReset',
      vehicleType: 'largeSuvTruck',
      selectedAddOns: ['paintProtection'],
      startTime: '08:00',
    });
    const blockedDayTwo: ScheduledInterval = {
      date: '2026-10-10',
      startTime: '09:00',
      endTime: '11:00',
      blockedUntil: '11:00',
      source: 'booking',
      totalDurationMinutes: 120,
    };

    expect(validateCapacitySegments({
      segments,
      intervalsByDate: { '2026-10-10': [blockedDayTwo] },
    })).toMatchObject({ allowed: false });
  });
});
