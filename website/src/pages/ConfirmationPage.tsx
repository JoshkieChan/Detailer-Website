import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, CreditCard, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. If you just booked, please check your email for confirmation.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      // Poll Supabase for the booking where stripe_session_id matches
      // We poll because the webhook might take a second to update the DB
      let attempts = 0;
      const maxAttempts = 10;
      
      const poll = async () => {
        const { data, error: sbError } = await supabase
          .from('bookings')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (data && data.deposit_status === 'paid') {
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
  }, [sessionId]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="confirmation-page container text-center" style={{ padding: '10rem 1rem' }}>
        <Loader2 size={60} className="spinner icon-lime" style={{ margin: '0 auto 2rem' }} />
        <h1>Verifying your deposit...</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Please don't close this page. We're finalizing your reservation.</p>
        <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="confirmation-page container text-center" style={{ padding: '10rem 1rem' }}>
        <AlertTriangle size={80} color="#f59e0b" style={{ margin: '0 auto 2rem' }} />
        <h1>Something went wrong</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>{error}</p>
        <Link to="/" className="btn primary mt-2">Return Home</Link>
      </div>
    );
  }

  const packageName = booking.package_id === 'maintenance' ? 'Maintenance' 
                    : booking.package_id === 'deep-reset' ? 'Deep Reset' 
                    : 'New Car Protection';

  return (
    <div className="confirmation-page container">
      <div className="success-header text-center">
        <div className="success-icon-wrap">
          <CheckCircle size={80} className="icon-lime pulse-animation" />
        </div>
        <h1>Booking {booking.deposit_status === 'paid' ? 'Confirmed!' : 'Pending Confirmation'}</h1>
        <p className="hook-text mt-1">
          {booking.deposit_status === 'paid' 
            ? "Your 20% deposit was received successfully. We have locked in your slot! Your appointment has been added to my internal calendar."
            : "Your request is received. We're just waiting for the final bank confirmation."}
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
            <span>Stripe Deposit {booking.deposit_status === 'paid' ? 'Paid' : 'Pending'} (20%):</span>
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

      <style>{`
        .confirmation-page { padding: 4rem 1.5rem; max-width: 900px; }
        .success-icon-wrap { margin-bottom: 1.5rem; display: flex; justify-content: center; }
        .pulse-animation { animation: pulse 2s infinite; }
        
        @keyframes pulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(158, 255, 0, 0.4)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(158, 255, 0, 0.8)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(158, 255, 0, 0)); }
        }

        .success-header h1 { font-size: 3.5rem; line-height: 1.1; }
        .hook-text { font-size: 1.25rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto; }
        
        .confirmation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: stretch; }
        
        .info-card, .payment-card { padding: 2.5rem; border-radius: var(--radius-lg); }
        .highlight-border { border-top: 4px solid var(--color-accent-lime); background: rgba(158, 255, 0, 0.02); }
        [data-theme='light'] .highlight-border { background: #fdfef9; }
        
        h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; margin-bottom: 1.5rem; }
        
        .details-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .details-list li { font-size: 1.05rem; color: var(--color-text-main); }
        .details-list strong { color: var(--color-text-muted); display: inline-block; width: 120px; }
        
        .location-desc { color: var(--color-text-main); font-size: 1.05rem; line-height: 1.6; padding: 1rem; background: rgba(128,128,128,0.1); border-radius: var(--radius-md); }
        
        .payment-row { display: flex; justify-content: space-between; font-size: 1.1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); }
        .deposit-row { color: var(--color-text-muted); }
        .total-row { border-bottom: none; font-size: 1.25rem; font-weight: 800; padding-top: 1rem; margin-top: 0.5rem; border-top: 2px solid var(--color-border); }
        
        .payment-methods { margin-top: 2rem; padding-top: 2rem; border-top: 1px dashed var(--color-border); }
        .payment-methods h4 { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-main); margin-bottom: 0.5rem; }
        .payment-methods p { color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 1rem; }
        
        .method-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .badge { background: rgba(128,128,128,0.1); color: var(--color-text-main); padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--color-border); }
        
        .subtext { font-size: 0.8rem !important; opacity: 0.7; }
        
        @media (max-width: 900px) {
          .confirmation-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default ConfirmationPage;
