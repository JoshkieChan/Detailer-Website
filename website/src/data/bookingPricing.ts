export type BookingPackageId = 'maintenance' | 'deepReset';
export type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';
export type LocationType = 'garage' | 'mobile';

export const MOBILE_FEE = 30;
export const OAK_HARBOR_TAX_RATE = 0.091;

export const bookingPackages: Record<
  BookingPackageId,
  {
    label: string;
    bestFor: string;
    priceNote: string;
    vehiclePricing: Record<VehicleTypeId, number>;
  }
> = {
  maintenance: {
    label: 'Maintenance',
    bestFor: 'Best for weekly drivers and routine upkeep.',
    priceNote:
      'Typical price depends on size and condition. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: 225,
      smallSuv: 250,
      largeSuvTruck: 275,
    },
  },
  deepReset: {
    label: 'Deep Reset',
    bestFor: 'Best for neglected vehicles that need a real return to baseline.',
    priceNote:
      'Typical price depends on size, buildup, pet hair, and stain level. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: 400,
      smallSuv: 450,
      largeSuvTruck: 500,
    },
  },
};

export const vehicleTypeLabels: Record<VehicleTypeId, string> = {
  sedan: 'Sedan',
  smallSuv: 'Small SUV',
  largeSuvTruck: 'Large SUV / Truck',
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
}: {
  packageId: BookingPackageId;
  vehicleType: VehicleTypeId;
  locationType: LocationType;
}) => {
  const packagePrice = bookingPackages[packageId].vehiclePricing[vehicleType];
  const mobileFee = locationType === 'mobile' ? MOBILE_FEE : 0;
  const subtotal = packagePrice + mobileFee;
  const depositAmount = Number((subtotal * 0.2).toFixed(2));
  const taxAmount = Number((depositAmount * OAK_HARBOR_TAX_RATE).toFixed(2));
  const totalToday = Number((depositAmount + taxAmount).toFixed(2));
  const remainingBalance = Number((subtotal - depositAmount).toFixed(2));

  return {
    packagePrice,
    mobileFee,
    subtotal,
    depositAmount,
    taxAmount,
    totalToday,
    remainingBalance,
  };
};
