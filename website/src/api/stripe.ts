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
  
  // Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: payload,
  });

  if (error) {
    // Attempt to extract the specific error message from the response body
    console.group('Supabase Edge Function Error');
    console.error('Full Error Object:', error);
    console.groupEnd();
    
    // If the error message is the generic one, we try to see if there's more detail
    // In many cases, we have to look into the logs if it's a 500, 
    // but for 400s we should get our custom message.
    throw new Error(error.message || 'Unknown backend error');
  }

  // If the function returned an error in the body (fallback)
  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    depositAmount: data.depositAmount,
    totalAmount: payload.packagePrice,
    currency: 'USD',
    clientSecret: data.clientSecret 
  };
};
