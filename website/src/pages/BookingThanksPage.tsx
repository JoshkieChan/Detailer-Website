import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const BookingThanksPage = () => {
  return (
    <div className="page-shell thanks-page">
      <section className="content-card thanks-card reveal is-visible">
        <div className="thanks-icon-wrap">
          <CheckCircle2 size={56} className="icon-lime" />
        </div>
        <span className="eyebrow">Booking Received</span>
        <h1 className="hero-title">Appointment Pending Confirmation.</h1>
        <p className="hero-subtitle">
          Your deposit has been attempted. Final booking confirmation will be sent to your email
          once your payment is successfully processed.
        </p>

        <div className="thanks-copy">
          <p>
            Once confirmed, please arrive on time for your selected start window, remove personal
            items and heavy loose gear before service, and expect us to confirm any major scope
            changes before work begins.
          </p>
          <p className="section-note">
            Rescheduling is allowed up to 24 hours before the appointment. Deposits are
            non-refundable for late cancellations and no-shows once the booking is confirmed.
          </p>
        </div>

        <div className="hero-actions hero-actions-center">
          <Link to="/services" className="btn primary btn-lg">
            Back to Detailing Services
          </Link>
        </div>
        <p className="section-note">
          <Link to="/booking" className="inline-text-link">
            Or return to Booking
          </Link>
        </p>
      </section>
    </div>
  );
};

export default BookingThanksPage;
