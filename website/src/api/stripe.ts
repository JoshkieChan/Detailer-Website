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
  checkoutUrl: string;
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
    throw new Error(`Failed to create Stripe session: ${error.message}`);
  }

  return {
    depositAmount: data.depositAmount,
    totalAmount: payload.packagePrice,
    currency: 'USD',
    checkoutUrl: data.url 
  };
};
