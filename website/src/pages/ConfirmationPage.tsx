import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, CreditCard, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface BookingConfirmation {
  package_id?: string;
  package?: string;
  location_type?: string;
  remaining_balance?: number | null;
  total_amount?: number;
  deposit_amount?: number;
  service_date: string;
  service_time?: string;
  vehicle_info?: string;
  address?: string;
  payment_status?: string;
  status?: string;
  booking_capacity_segments?: Array<{ segment_date: string; start_time: string; end_time: string }>;
}

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const [access] = useState<{ bookingId?: string; token?: string }>(() => {
    try { return JSON.parse(sessionStorage.getItem('booking_confirmation') || '{}'); } catch { return {}; }
  });
  const bookingId = searchParams.get('booking_id') || access.bookingId;
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const fetchBooking = async () => {
      // Poll Supabase for the booking where id matches
      let attempts = 0;
      const maxAttempts = 5;
      
      const poll = async () => {
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/functions/v1/booking-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY },
          body: JSON.stringify({ bookingId, token: access.token }),
        });
        const data = response.ok ? await response.json() : null;
        if (!active) return;

        if (data) {
          setBooking(data as BookingConfirmation);
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          timer = setTimeout(() => { void poll().catch(() => { if (active) { setError('Could not load booking details.'); setLoading(false); } }); }, 1500);
        } else {
          // If we timed out but the record exists (even if unpaid yet)
          if (data) {
            setBooking(data as BookingConfirmation);
            setLoading(false);
          } else {
            setError("We could not verify this booking. Please contact SignalSource to check your booking and payment.");
            setLoading(false);
          }
        }
      };

      await poll();
    };

    void fetchBooking().catch(() => { if (active) { setError('Could not load booking details.'); setLoading(false); } });
    return () => { active = false; clearTimeout(timer); };
  }, [bookingId, access.token]);

  const formatCurrency = (amount: number | undefined) => `$${Number(amount ?? 0).toFixed(2)}`;

  if (!bookingId || !access.token) {
    return <div className="confirmation-page container text-center confirmation-state"><h1>Appointment Pending Confirmation</h1><p>We cannot verify payment from this page. Check your confirmation email or contact SignalSource.</p><Link to="/" className="btn primary mt-2">Return Home</Link></div>;
  }

  if (loading) {
    return (
      <div className="confirmation-page container text-center confirmation-state">
        <Loader2 size={60} className="spinner icon-lime confirmation-state-icon" />
        <h1>Finalizing your booking...</h1>
        <p className="confirmation-state-copy">Please don't close this page. We're securing your reservation.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="confirmation-page container text-center confirmation-state">
        <AlertTriangle size={80} className="confirmation-error-icon" />
        <h1>Something went wrong</h1>
        <p className="confirmation-error-copy">{error}</p>
        <Link to="/" className="btn primary mt-2">Return Home</Link>
      </div>
    );
  }

  const packageName =
    booking.package_id === 'maintenance' || booking.package === 'maintenance'
      ? 'Maintenance'
      : 'Deep Reset';
  const locationType = booking.location_type === 'studio' ? 'garage' : booking.location_type;
  const remainingBalance =
    booking.remaining_balance !== null && booking.remaining_balance !== undefined
      ? Number(booking.remaining_balance)
      : Number(booking.total_amount) - Number(booking.deposit_amount);

  return (
    <div className="confirmation-page container">
      <div className="success-header text-center">
        <div className="success-icon-wrap">
          <CheckCircle size={80} className="icon-lime pulse-animation" />
        </div>
        <h1>Booking Received!</h1>
        <p className="hook-text mt-1">
          {booking.payment_status === 'paid' && booking.status !== 'cancelled'
            ? 'Your payment is confirmed and your appointment is reserved.'
            : 'Your request is recorded. Payment and appointment confirmation are still pending.'}
        </p>
      </div>

      <div className="confirmation-grid mt-4">
        
        {/* Reservation Details */}
        <div className="info-card glass">
          <h3><Calendar size={20} className="icon-lime" /> Appointment Details</h3>
          <ul className="details-list">
            <li><strong>Service:</strong> {packageName}</li>
            <li><strong>Date:</strong> {new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</li>
            <li><strong>Time Window:</strong> {booking.booking_capacity_segments?.map(segment => segment.segment_date + ' ' + segment.start_time + '-' + segment.end_time).join(', ') || booking.service_time}</li>
            <li><strong>Vehicle:</strong> {booking.vehicle_info}</li>
          </ul>

          <h3 className="mt-2"><MapPin size={20} className="icon-lime" /> Location specifics</h3>
          <p className="location-desc">
            {locationType === 'garage' 
              ? "Drop-off at Erie St. Studio, Oak Harbor. We will text you the exact drop-off instructions the day before."
              : `Mobile Detail at your driveway: ${booking.address}`
            }
          </p>
        </div>

        {/* Payment Summary */}
        <div className="payment-card glass highlight-border">
          <h3><CreditCard size={20} className="icon-lime" /> Payment Summary</h3>
          <div className="payment-row">
            <span>Base Package Price:</span>
            <span>{formatCurrency(booking.total_amount)}</span>
          </div>
          <div className="payment-row deposit-row">
            <span>Booking Deposit (20%):</span>
            <span className="highlight-lime">- {formatCurrency(booking.deposit_amount)}</span>
          </div>
          <div className="payment-row total-row">
            <span>Remaining Balance Due:</span>
            <span>{formatCurrency(remainingBalance)}</span>
          </div>
          
          <div className="payment-methods mt-2">
            <h4><Clock size={16} /> Due After Service</h4>
            <p>You can pay the remaining balance in-person via:</p>
            <div className="method-badges">
              <span className="badge">Cash</span>
              <span className="badge">Card (Square)</span>
              <span className="badge">Cash App</span>
              <span className="badge">Bank Transfer</span>
            </div>
            <p className="subtext mt-1">Final pricing may slightly vary based on extreme vehicle condition, which we will confirm before starting work.</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 mb-4">
        <Link to="/" className="btn secondary">Return to Home</Link>
      </div>
    </div>
  );
}

export default ConfirmationPage;
