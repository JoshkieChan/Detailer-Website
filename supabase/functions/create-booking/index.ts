import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts"

// --- TYPES & DATA (Merged from shared files for maximum stability) ---
type BookingPackageId = 'maintenance' | 'deepReset';
type VehicleTypeId = 'sedan' | 'smallSuv' | 'largeSuvTruck';
type LocationType = 'garage' | 'mobile';
type HelcimPackageKey = 'maintenance' | 'deep_reset';
type HelcimVehicleSizeKey = 'sedan' | 'small_suv' | 'large_suv_truck';
type HelcimLocationTypeKey = 'studio' | 'mobile';

const MOBILE_FEE = 30;
const OAK_HARBOR_TAX_RATE = 0.091;

const HELCIM_DEPOSIT_URLS = {
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
    vehiclePricing: {
      sedan: { basePrice: 225, helcim: HELCIM_DEPOSIT_URLS.maintenance.sedan },
      small_suv: { basePrice: 250, helcim: HELCIM_DEPOSIT_URLS.maintenance.small_suv },
      large_suv_truck: { basePrice: 275, helcim: HELCIM_DEPOSIT_URLS.maintenance.large_suv_truck },
    },
  },
  deep_reset: {
    label: 'Deep Reset',
    vehiclePricing: {
      sedan: { basePrice: 400, helcim: HELCIM_DEPOSIT_URLS.deep_reset.sedan },
      small_suv: { basePrice: 450, helcim: HELCIM_DEPOSIT_URLS.deep_reset.small_suv },
      large_suv_truck: { basePrice: 500, helcim: HELCIM_DEPOSIT_URLS.deep_reset.large_suv_truck },
    },
  },
} as const;

const vehicleTypeLabels: Record<VehicleTypeId, string> = {
  sedan: 'Sedan',
  smallSuv: 'Small SUV',
  largeSuvTruck: 'Large SUV / Truck',
};

// --- UTILS ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateBookingFinancials({ packageId, vehicleType, locationType }: { packageId: BookingPackageId, vehicleType: VehicleTypeId, locationType: LocationType }) {
  const packageKey = (packageId === 'deepReset' ? 'deep_reset' : 'maintenance') as HelcimPackageKey;
  const vehicleKey = (vehicleType === 'sedan' ? 'sedan' : vehicleType === 'smallSuv' ? 'small_suv' : 'large_suv_truck') as HelcimVehicleSizeKey;
  const locationKey = (locationType === 'garage' ? 'studio' : 'mobile') as HelcimLocationTypeKey;
  
  const pricing = BOOKING_COMBINATIONS[packageKey].vehiclePricing[vehicleKey];
  const packagePrice = pricing.basePrice;
  const helcimDepositUrl = pricing.helcim[locationKey];
  const mobileFee = locationType === 'mobile' ? MOBILE_FEE : 0;
  const subtotal = packagePrice + mobileFee;
  const depositAmount = Number((subtotal * 0.2).toFixed(2));
  const taxAmount = Number((depositAmount * OAK_HARBOR_TAX_RATE).toFixed(2));
  const totalToday = Number((depositAmount + taxAmount).toFixed(2));
  const remainingBalance = Number((subtotal - depositAmount).toFixed(2));

  return { 
    subtotal, 
    depositAmount, 
    taxAmount, 
    totalToday, 
    remainingBalance, 
    helcimDepositUrl, 
    packageLabel: BOOKING_COMBINATIONS[packageKey].label, 
    vehicleTypeLabel: vehicleTypeLabels[vehicleType] 
  };
}

Deno.serve(async (req) => {
  // 1. Universal CORS Preflight (Must be first)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // 2. Health Check (GET)
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      project: supabaseUrl?.split('.')[0].split('//')[1] || 'unknown'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  try {
    const body = await req.json();
    const { 
      packageId, 
      vehicleType, 
      locationType, 
      membershipIntent, 
      email: customerEmail, 
      fullName, 
      phone, 
      address, 
      date: serviceDate, 
      time: serviceTime,
      notes 
    } = body;

    // Validation
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const pricing = calculateBookingFinancials({ packageId, vehicleType, locationType });

    // 3. Database Insert
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert([{
        full_name: fullName,
        email: customerEmail,
        phone,
        address: address || '',
        package_id: packageId,
        vehicle_type: vehicleType,
        service_date: serviceDate,
        service_time: serviceTime,
        location_type: locationType,
        notes: notes || '',
        membership_intent: membershipIntent || 'none',
        calculated_price: pricing.subtotal,
        deposit_amount: pricing.depositAmount,
        tax_amount: pricing.taxAmount,
        total_today: pricing.totalToday,
        remaining_balance: pricing.remainingBalance,
        helcim_deposit_url: pricing.helcimDepositUrl,
        status: 'pending'
      }])
      .select('id')
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      throw new Error(`Database Error: ${dbError.message}`);
    }

    // 4. Return Success with Redirect URL
    return new Response(
      JSON.stringify({
        bookingId: booking.id,
        helcimDepositUrl: pricing.helcimDepositUrl,
        totalToday: pricing.totalToday
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('CRITICAL EDGE ERROR:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 // Return 200 with error JSON so the browser can read it (CORS safetly)
      }
    );
  }
});
