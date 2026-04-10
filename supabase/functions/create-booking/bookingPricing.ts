export type BookingPackageId = 'maintenance' | 'deepReset';
export type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';
export type LocationType = 'garage' | 'mobile';

export type HelcimPackageKey = 'maintenance' | 'deep_reset';
export type HelcimVehicleSizeKey = 'sedan' | 'small_suv' | 'large_suv_truck';
export type HelcimLocationTypeKey = 'studio' | 'mobile';

export const MOBILE_FEE = 30;
export const OAK_HARBOR_TAX_RATE = 0.091;

export const HELCIM_DEPOSIT_URLS = {
  deep_reset: {
    sedan: {
      studio: 'https://signalsource.myhelcim.com/order/?token=5128afb908fe47fe9b5d7a',
      mobile: 'https://signalsource.myhelcim.com/order/?token=f2b6493d407d02eb3d26a5',
    },
    small_suv: {
      studio: 'https://signalsource.myhelcim.com/order/?token=38aa79efa9682bd48e5a14',
      mobile: 'https://signalsource.myhelcim.com/order/?token=9e37739b2372a7737c3d6e',
    },
    large_suv_truck: {
      studio: 'https://signalsource.myhelcim.com/order/?token=b5010464706f77f6a3ec88',
      mobile: 'https://signalsource.myhelcim.com/order/?token=24f4e388d87567c1126a53',
    },
  },
  maintenance: {
    sedan: {
      studio: 'https://signalsource.myhelcim.com/order/?token=186850e45078abb2db12da',
      mobile: 'https://signalsource.myhelcim.com/order/?token=e57b9731dbdbda62b7f835',
    },
    small_suv: {
      studio: 'https://signalsource.myhelcim.com/order/?token=159de77d4ee70386e9b74c',
      mobile: 'https://signalsource.myhelcim.com/order/?token=60597764306c1e11890bba',
    },
    large_suv_truck: {
      studio: 'https://signalsource.myhelcim.com/order/?token=1490c9169a2f99d650f1bf',
      mobile: 'https://signalsource.myhelcim.com/order/?token=895393d9335aeb15374138',
    },
  },
} as const;

const BOOKING_COMBINATIONS = {
  maintenance: {
    label: 'Maintenance',
    bestFor: 'Best for weekly drivers and routine upkeep.',
    priceNote:
      'Typical price depends on size and condition. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: {
        basePrice: 225,
        helcim: HELCIM_DEPOSIT_URLS.maintenance.sedan,
      },
      small_suv: {
        basePrice: 250,
        helcim: HELCIM_DEPOSIT_URLS.maintenance.small_suv,
      },
      large_suv_truck: {
        basePrice: 275,
        helcim: HELCIM_DEPOSIT_URLS.maintenance.large_suv_truck,
      },
    },
  },
  deep_reset: {
    label: 'Deep Reset',
    bestFor: 'Best for neglected vehicles that need a real return to baseline.',
    priceNote:
      'Typical price depends on size, buildup, pet hair, and stain level. Final price is confirmed before work begins if scope changes.',
    vehiclePricing: {
      sedan: {
        basePrice: 400,
        helcim: HELCIM_DEPOSIT_URLS.deep_reset.sedan,
      },
      small_suv: {
        basePrice: 450,
        helcim: HELCIM_DEPOSIT_URLS.deep_reset.small_suv,
      },
      large_suv_truck: {
        basePrice: 500,
        helcim: HELCIM_DEPOSIT_URLS.deep_reset.large_suv_truck,
      },
    },
  },
} as const;

export const vehicleTypeLabels: Record<VehicleTypeId, string> = {
  sedan: 'Sedan',
  smallSuv: 'Small SUV',
  largeSuvTruck: 'Large SUV / Truck',
};

const packageKeyMap: Record<BookingPackageId, HelcimPackageKey> = {
  maintenance: 'maintenance',
  deepReset: 'deep_reset',
};

const vehicleKeyMap: Record<VehicleTypeId, HelcimVehicleSizeKey> = {
  sedan: 'sedan',
  smallSuv: 'small_suv',
  largeSuvTruck: 'large_suv_truck',
};

const locationKeyMap: Record<LocationType, HelcimLocationTypeKey> = {
  garage: 'studio',
  mobile: 'mobile',
};

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
    label: BOOKING_COMBINATIONS.maintenance.label,
    bestFor: BOOKING_COMBINATIONS.maintenance.bestFor,
    priceNote: BOOKING_COMBINATIONS.maintenance.priceNote,
    vehiclePricing: {
      sedan: BOOKING_COMBINATIONS.maintenance.vehiclePricing.sedan.basePrice,
      smallSuv: BOOKING_COMBINATIONS.maintenance.vehiclePricing.small_suv.basePrice,
      largeSuvTruck: BOOKING_COMBINATIONS.maintenance.vehiclePricing.large_suv_truck.basePrice,
    },
  },
  deepReset: {
    label: BOOKING_COMBINATIONS.deep_reset.label,
    bestFor: BOOKING_COMBINATIONS.deep_reset.bestFor,
    priceNote: BOOKING_COMBINATIONS.deep_reset.priceNote,
    vehiclePricing: {
      sedan: BOOKING_COMBINATIONS.deep_reset.vehiclePricing.sedan.basePrice,
      smallSuv: BOOKING_COMBINATIONS.deep_reset.vehiclePricing.small_suv.basePrice,
      largeSuvTruck: BOOKING_COMBINATIONS.deep_reset.vehiclePricing.large_suv_truck.basePrice,
    },
  },
};

export const isBookingPackageId = (value: string | null | undefined): value is BookingPackageId =>
  value === 'maintenance' || value === 'deepReset';

export const isVehicleTypeId = (value: string | null | undefined): value is VehicleTypeId =>
  value === 'sedan' || value === 'smallSuv' || value === 'largeSuvTruck';

export const isLocationType = (value: string | null | undefined): value is LocationType =>
  value === 'garage' || value === 'mobile';

export const toHelcimPackageKey = (packageId: BookingPackageId): HelcimPackageKey =>
  packageKeyMap[packageId];

export const toHelcimVehicleSizeKey = (vehicleType: VehicleTypeId): HelcimVehicleSizeKey =>
  vehicleKeyMap[vehicleType];

export const toHelcimLocationTypeKey = (locationType: LocationType): HelcimLocationTypeKey =>
  locationKeyMap[locationType];

export const getHelcimDepositUrl = ({
  packageId,
  vehicleType,
  locationType,
}: {
  packageId: BookingPackageId;
  vehicleType: VehicleTypeId;
  locationType: LocationType;
}) =>
  HELCIM_DEPOSIT_URLS[toHelcimPackageKey(packageId)][toHelcimVehicleSizeKey(vehicleType)][
    toHelcimLocationTypeKey(locationType)
  ];

export const calculateBookingFinancials = ({
  packageId,
  vehicleType,
  locationType,
}: {
  packageId: BookingPackageId;
  vehicleType: VehicleTypeId;
  locationType: LocationType;
}) => {
  const packageKey = toHelcimPackageKey(packageId);
  const vehicleKey = toHelcimVehicleSizeKey(vehicleType);
  const locationKey = toHelcimLocationTypeKey(locationType);
  const packagePrice = BOOKING_COMBINATIONS[packageKey].vehiclePricing[vehicleKey].basePrice;
  const helcimDepositUrl =
    BOOKING_COMBINATIONS[packageKey].vehiclePricing[vehicleKey].helcim[locationKey];
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
    helcimDepositUrl,
  };
};
