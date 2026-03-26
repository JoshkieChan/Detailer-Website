import { supabase } from '../lib/supabase';

export const fetchBookedDates = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('service_date')
    .in('status', ['confirmed', 'pending']); // Block both paid and in-checkout bookings

  if (error) {
    console.error('Error fetching booked dates:', error.message);
    return [];
  }

  return data?.map(b => b.service_date) || [];
};

export const bookDate = async (_dateStr: string): Promise<boolean> => {
  // In the real flow, we don't 'book' immediately.
  // We insert a 'pending' record, then Stripe confirms it.
  // For now, this is just a placeholder.
  return true;
};
