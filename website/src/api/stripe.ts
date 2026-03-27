import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const getStripe = () => {
  if (!stripePublishableKey) {
    console.error('Missing Stripe publishable key.');
    return null;
  }
  return loadStripe(stripePublishableKey);
};

export interface CheckoutSessionDetails {
  depositAmount: number;
  totalAmount: number;
  currency: string;
  clientSecret: string;
}

export interface BookingPayload {
  packageId: string;
  packageName: string;
  packagePrice: number;
  customerEmail: string;
  fullName: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  locationType: string;
  serviceDate: string;
  serviceTime: string;
}

export const createDepositCheckout = async (
  payload: BookingPayload
): Promise<CheckoutSessionDetails> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing in this environment.');
  }

  const functionUrl = `${supabaseUrl}/functions/v1/stripe-checkout`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || `Server responded with status ${response.status}: ${text}`);
  }

  return {
    depositAmount: data.depositAmount,
    totalAmount: payload.packagePrice,
    currency: 'USD',
    clientSecret: data.clientSecret 
  };
};
