import {
  getHelcimLink,
  type Location,
  type Service,
  type VehicleSize,
} from '../config/helcimLinks.ts';

export type BookingPackageId = 'maintenance' | 'deepReset';
export type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';
export type LocationType = 'garage' | 'mobile';
export type AddOnId = 'paintProtection' | 'petHairRemoval' | 'engineBay' | 'headlightRestoration';

export const MOBILE_FEE = 30;
export const OAK_HARBOR_TAX_RATE = 0.091;

// Add-on pricing
// Paint Protection and Pet Hair Removal are size-based
// Engine Bay and Headlight Restoration are flat rates
// Prices in dollars
export const ADD_ON_PRICES: Record<AddOnId, number | Record<VehicleTypeId, number>> = {
  paintProtection: { sedan: 150, smallSuv: 225, largeSuvTruck: 300 },
  petHairRemoval: { sedan: 75, smallSuv: 110, largeSuvTruck: 150 },
  engineBay: 60,
  headlightRestoration: 120,
};

export const bookingPackages: Record<
  BookingPackageId,
  {
    label: Service;
    shortLabel: string;
    bestFor: string;
    priceNote: string;
    vehiclePricing: Record<VehicleTypeId, number>;
  }
> = {
  maintenance: {
    label: 'Maintenance Detail',
    shortLabel: 'Maintenance',
    bestFor:
      'Premium ongoing upkeep for daily drivers that already have a decent baseline and need repeatable care, protection-minded washing, and cleaner handoff details every visit.',
    priceNote:
      'Typical price depends on size and condition. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: 225,
      smallSuv: 250,
      largeSuvTruck: 275,
    },
  },
  deepReset: {
    label: 'Deep Reset Detail',
    shortLabel: 'Deep Reset',
    bestFor:
      'Heavier extraction, steam, and restoration-focused work for vehicles that need a true baseline reset before maintenance makes sense.',
    priceNote:
      'Typical price depends on size, buildup, pet hair, and stain level. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: 400,
      smallSuv: 450,
      largeSuvTruck: 500,
    },
  },
};

export const vehicleTypeLabels: Record<VehicleTypeId, VehicleSize> = {
  sedan: 'Sedan',
  smallSuv: 'Small SUV',
  largeSuvTruck: 'Large SUV/Truck',
};

export const locationTypeLabels: Record<LocationType, Location> = {
  garage: 'Garage Studio',
  mobile: 'On-Island Mobile',
};

export const isBookingPackageId = (value: string | null | undefined): value is BookingPackageId =>
  value === 'maintenance' || value === 'deepReset';

export const isVehicleTypeId = (value: string | null | undefined): value is VehicleTypeId =>
  value === 'sedan' || value === 'smallSuv' || value === 'largeSuvTruck';

export const isLocationType = (value: string | null | undefined): value is LocationType =>
  value === 'garage' || value === 'mobile';

export const calculateBookingFinancials = ({
  packageId,
  vehicleType,
  locationType,
  selectedAddOns = [],
}: {
  packageId: BookingPackageId;
  vehicleType: VehicleTypeId;
  locationType: LocationType;
  selectedAddOns?: AddOnId[];
}) => {
  const packagePrice = bookingPackages[packageId].vehiclePricing[vehicleType];
  const mobileFee = locationType === 'mobile' ? MOBILE_FEE : 0;

  // Base price is package + mobile fee only (for deposit calculation)
  const basePrice = packagePrice + mobileFee;

  // Calculate add-on pricing (only affects remaining balance)
  const addOnsPrice = selectedAddOns.reduce((sum, addOnId) => {
    const price = ADD_ON_PRICES[addOnId];
    if (typeof price === 'number') {
      return sum + price;
    } else if (typeof price === 'object' && price !== null) {
      return sum + (price[vehicleType] || 0);
    }
    return sum;
  }, 0);

  // Deposit-side calculations based on base price only
  const depositAmount = Number((basePrice * 0.2).toFixed(2));
  const taxAmount = Number((depositAmount * OAK_HARBOR_TAX_RATE).toFixed(2));
  const totalToday = Number((depositAmount + taxAmount).toFixed(2));

  // Remaining balance includes add-ons
  const remainingBalance = Number((basePrice + addOnsPrice - depositAmount).toFixed(2));

  const helcimLink = getHelcimLink({
    service: bookingPackages[packageId].label,
    location: locationTypeLabels[locationType],
    vehicleSize: vehicleTypeLabels[vehicleType],
  });

  return {
    packagePrice,
    mobileFee,
    basePrice,
    addOnsPrice,
    subtotal: basePrice, // Display subtotal is base price only
    depositAmount,
    taxAmount,
    totalToday,
    remainingBalance,
    helcimLink,
  };
};
