import { type ScheduledInterval, type SlotBookingPackageId, type VehicleTypeId } from '../config/scheduler';

const getFunctionBase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return {
    url: `${supabaseUrl}/functions/v1/booking-availability`,
    anonKey: supabaseAnonKey,
  };
};

export interface AvailabilityResponse {
  unavailableDates: string[];
  intervalsByDate: Record<string, ScheduledInterval[]>;
  nextAvailableOpening: {
    date: string;
    startTime: string;
    label: string;
    serviceLabel: string;
  } | null;
}

export const fetchAvailability = async (
  packageId: SlotBookingPackageId,
  vehicleType?: VehicleTypeId
): Promise<AvailabilityResponse> => {
  const { url, anonKey } = getFunctionBase();
  const searchParams = new URLSearchParams({
    packageId,
    vehicleType: vehicleType || 'sedan',
  });

  const response = await fetch(`${url}?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Could not load live availability.');
  }

  return data as AvailabilityResponse;
};

export interface OwnerScheduleEvent {
  id: string;
  eventType: 'booking' | 'blackout';
  date: string;
  startTime: string;
  endTime: string;
  blockedUntil: string;
  title: string;
  details: string[];
  paymentStatus: string | null;
  customerName?: string;
  phone?: string;
  email?: string;
  locationType?: string;
  vehicleType?: string;
  vehicleInfo?: string;
  packageLabel?: string;
  packageId?: string;
  bookingSource?: string;
  notes?: string;
  calculatedPrice?: number;
  depositAmount?: number;
  remainingBalance?: number;
  reason?: string;
  source?: string;
}

export const fetchOwnerSchedule = async (passcode: string): Promise<OwnerScheduleEvent[]> => {
  const { url, anonKey } = getFunctionBase();
  const response = await fetch(`${url}?owner=true`, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'x-owner-passcode': passcode,
    },
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Could not load owner schedule.');
  }
  return data.events as OwnerScheduleEvent[];
};
