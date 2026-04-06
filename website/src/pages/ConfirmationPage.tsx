import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, CreditCard, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID found. If you just booked, please check your email for confirmation.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      // Poll Supabase for the booking where id matches
      let attempts = 0;
      const maxAttempts = 5;
      
      const poll = async () => {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (data) {
          setBooking(data);
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1500); // Poll every 1.5s
        } else {
          // If we timed out but the record exists (even if unpaid yet)
          if (data) {
            setBooking(data);
            setLoading(false);
          } else {
            setError("We couldn't find your booking details yet. Don't worry, your payment was processed. Please check your email shortly.");
            setLoading(false);
          }
        }
      };

      poll();
    };

    fetchBooking();
  }, [bookingId]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

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

  const packageName = booking.package_id === 'maintenance' ? 'Maintenance' 
                    : 'Deep Reset';

  return (
    <div className="confirmation-page container">
      <div className="success-header text-center">
        <div className="success-icon-wrap">
          <CheckCircle size={80} className="icon-lime pulse-animation" />
        </div>
        <h1>Booking Received!</h1>
        <p className="hook-text mt-1">
          Your reservation request has been processed. We have locked in your slot and added it to our internal calendar.
        </p>
      </div>

      <div className="confirmation-grid mt-4">
        
        {/* Reservation Details */}
        <div className="info-card glass">
          <h3><Calendar size={20} className="icon-lime" /> Appointment Details</h3>
          <ul className="details-list">
            <li><strong>Service:</strong> {packageName}</li>
            <li><strong>Date:</strong> {new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</li>
            <li><strong>Time Window:</strong> {booking.service_time === 'morning' ? 'Morning (8AM - 12PM)' : 'Afternoon (12PM - 4PM)'}</li>
            <li><strong>Vehicle:</strong> {booking.vehicle_info}</li>
          </ul>

          <h3 className="mt-2"><MapPin size={20} className="icon-lime" /> Location specifics</h3>
          <p className="location-desc">
            {booking.location_type === 'garage' 
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
            <span>{formatCurrency(booking.total_amount - booking.deposit_amount)}</span>
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
