import { calculateBookingFinancials, isBookingPackageId, isVehicleTypeId, isLocationType, bookingPackages, vehicleTypeLabels } from '../../../website/src/data/bookingPricing.ts';
import { ADD_ON_DURATIONS, buildBookingWindow, isFutureSlot, type AddOnId } from '../../../website/src/config/scheduler.ts';
import { BookingError, ErrorCodes } from './errorResponse.ts';

export const parseAddOns = (value: unknown): AddOnId[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !Object.hasOwn(ADD_ON_DURATIONS, id)) || new Set(value).size !== value.length) {
    throw new BookingError('Invalid or duplicate add-on selection.');
  }
  return value as AddOnId[];
};

export const textField = (value: unknown, label: string, max: number, required = true) => {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) throw new BookingError(`Invalid ${label}.`);
  return value.trim();
};

export function validateBooking(payload: Record<string, unknown>, now = new Date(), owner = false) {
  const packageId = textField(payload.package_id ?? payload.packageId, 'package', 30);
  const vehicleType = textField(payload.vehicle_type ?? payload.vehicleType, 'vehicle type', 30);
  const locationType = textField(payload.location_type ?? payload.locationType, 'location', 30);
  if (!isBookingPackageId(packageId) || !isVehicleTypeId(vehicleType) || !isLocationType(locationType)) throw new BookingError('Invalid booking selection.');
  const selectedAddOns = parseAddOns(payload.selected_addons ?? payload.selectedAddOns);
  const date = textField(payload.service_date ?? payload.serviceDate ?? payload.date, 'service date', 10);
  const startTime = textField(payload.start_time ?? payload.startTime, 'start time', 5);
  const window = buildBookingWindow({ date, startTime, packageId, vehicleType, selectedAddOns });
  if (!window.segments.length || (!owner && !isFutureSlot(date, startTime, now))) throw new BookingError('Choose a future service date and an available hourly start time.');
  const pricing = calculateBookingFinancials({ packageId, vehicleType, locationType, selectedAddOns });
  const name = textField(payload.full_name ?? payload.fullName, 'full name', 120);
  const email = textField(payload.email, 'email', 254);
  const phone = textField(payload.phone, 'phone', 40);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length !== 10) throw new BookingError('Enter a valid email and 10-digit phone number.');
  const membership = payload.membership_intent ?? payload.membershipIntent ?? 'none';
  if (!['none', 'monthly', 'quarterly'].includes(String(membership))) throw new BookingError('Invalid membership selection.');
  const expected: Record<string, number | string> = {
    base_price: pricing.basePrice, addons_price: pricing.addOnsPrice, calculated_price: pricing.subtotal,
    deposit_amount: pricing.depositAmount, tax_amount: pricing.taxAmount, total_today: pricing.totalToday,
    remaining_balance: pricing.remainingBalance, total_amount_cents: Math.round(pricing.totalToday * 100),
    service_duration_minutes: window.serviceDuration, buffer_minutes: window.bufferMinutes,
    end_time: window.endTime, blocked_until: window.blockedUntil, helcim_deposit_url: pricing.helcimLink.url,
  };
  if (!owner) {
    for (const [key, value] of Object.entries(expected)) {
      if (payload[key] !== undefined && payload[key] !== value) throw new BookingError('Booking details have changed. Please refresh and try again.', ErrorCodes.PRICING_MISMATCH);
    }
    for (const [key, value] of Object.entries({ serviceDurationMinutes: window.serviceDuration, bufferMinutes: window.bufferMinutes, totalAmountCents: Math.round(pricing.totalToday * 100) })) {
      if (payload[key] !== undefined && payload[key] !== value) throw new BookingError('Booking timing or amount mismatch.');
    }
    if ((payload.payment_status !== undefined && payload.payment_status !== 'pending_payment') || (payload.booking_source !== undefined && payload.booking_source !== 'web') || (payload.test_mode !== undefined && payload.test_mode !== false)) throw new BookingError('Invalid booking status.');
  }
  return {
    window, pricing,
    record: {
      full_name: name, email, phone,
      address: textField(payload.address, 'address', 500, locationType === 'mobile'),
      notes: textField(payload.notes, 'notes', 4000, false),
      package: bookingPackages[packageId].label, package_id: packageId,
      vehicle_info: vehicleTypeLabels[vehicleType], vehicle_type: vehicleType, location_type: locationType,
      service_date: date, start_time: startTime, service_time: startTime,
      ...expected, selected_addons: selectedAddOns, mobile_fee_applied: locationType === 'mobile',
      membership_intent: membership, total_amount: pricing.subtotal,
      booking_source: 'web', payment_status: 'pending_payment', status: 'pending', test_mode: false,
    },
  };
}
