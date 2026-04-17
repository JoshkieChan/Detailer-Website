const getOwnerFunctionBase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return {
    url: `${supabaseUrl}/functions/v1/owner-schedule`,
    anonKey: supabaseAnonKey,
  };
};

const buildHeaders = (passcode: string, anonKey: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${anonKey}`,
  apikey: anonKey,
  'x-owner-passcode': passcode,
});

export const verifyOwnerPasscode = async (passcode: string) => {
  const { url, anonKey } = getOwnerFunctionBase();
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(passcode, anonKey),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.ok === true;
};

export const createAvailabilityBlock = async ({
  passcode,
  startAt,
  endAt,
  reason,
}: {
  passcode: string;
  startAt: string;
  endAt: string;
  reason: string;
}) => {
  const { url, anonKey } = getOwnerFunctionBase();
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(passcode, anonKey),
    body: JSON.stringify({
      action: 'create_blackout',
      startAt,
      endAt,
      reason,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Could not create blackout block.');
  }

  return data;
};

export const createManualBooking = async ({
  passcode,
  payload,
}: {
  passcode: string;
  payload: Record<string, unknown>;
}) => {
  const { url, anonKey } = getOwnerFunctionBase();
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(passcode, anonKey),
    body: JSON.stringify({
      action: 'create_manual_booking',
      ...payload,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Could not create manual booking.');
  }

  return data;
};
