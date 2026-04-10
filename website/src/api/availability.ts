import { supabase } from '../lib/supabase';

export const fetchBookedDates = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('service_date')
      .in('status', ['confirmed', 'pending']); 

    if (error) {
      console.error('Supabase API Error (fetchBookedDates):', error.message, error.details, error.hint);
      return [];
    }

    return data?.map(b => b.service_date) || [];
  } catch (err) {
    console.error('Network/Fetch Error (fetchBookedDates):', err);
    return [];
  }
};

export const bookDate = async (_dateStr: string): Promise<boolean> => {
  // In the real flow, we don't 'book' immediately.
  // We insert a 'pending' record, then Stripe confirms it.
  // For now, this is just a placeholder.
  return true;
};
