import { describe, expect, it } from 'vitest';
import { calculateBookingFinancials } from './bookingPricing';

describe('calculateBookingFinancials', () => {
  it('calculates base garage pricing and deposit totals', () => {
    expect(calculateBookingFinancials({
      packageId: 'maintenance',
      vehicleType: 'sedan',
      locationType: 'garage',
    })).toMatchObject({
      packagePrice: 225,
      mobileFee: 0,
      basePrice: 225,
      addOnsPrice: 0,
      subtotal: 225,
      depositAmount: 45,
      taxAmount: 4.09,
      totalToday: 49.09,
      remainingBalance: 180,
    });
  });

  it('adds mobile fee and add-ons without inflating deposit', () => {
    expect(calculateBookingFinancials({
      packageId: 'deepReset',
      vehicleType: 'largeSuvTruck',
      locationType: 'mobile',
      selectedAddOns: ['paintProtection', 'petHairRemoval', 'engineBay'],
    })).toMatchObject({
      packagePrice: 500,
      mobileFee: 30,
      basePrice: 530,
      addOnsPrice: 510,
      subtotal: 530,
      depositAmount: 106,
      taxAmount: 9.65,
      totalToday: 115.65,
      remainingBalance: 934,
    });
  });
});
