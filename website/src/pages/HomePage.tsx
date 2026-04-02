import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Calendar,
  Bell,
  Users,
  TrendingUp,
  RefreshCw,
  CalendarCheck,
  Gauge,
  MapPinned,
} from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { servicePackages } from '../data/packages';
import { trackEvent } from '../lib/analytics';

const HomePage = () => {
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90];

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScrollable = documentHeight - viewportHeight;

      if (maxScrollable <= 0) return;

      const percent = Math.round((scrollTop / maxScrollable) * 100);

      thresholds.forEach((depth) => {
        if (percent >= depth && !trackedDepths.current.has(depth)) {
          trackedDepths.current.add(depth);
          trackEvent('Detailing Page Scroll Depth', { depth });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="page-shell detailing-home">
      <section className="hero-grid">
        <div className="hero-copy reveal">
          <div className="capacity-banner">
            <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
          </div>
          <h1 className="hero-title">
            Whidbey Island detailing for drivers who want it done right the first time.
          </h1>
          <p className="hero-subtitle">
            SignalSource is a systems-driven local shop in Oak Harbor. We clean, protect, and
            maintain daily drivers without wasting your day or leaving you guessing on price.
          </p>
          <div className="hero-actions">
            <Link
              to="/booking"
              className="btn primary btn-lg"
              onClick={() =>
                trackEvent('Detailing Lead - Booking Page', {
                  cta: 'hero_book_a_detail',
                })
              }
            >
              Configure Your Detail
            </Link>
            <Link to="/pricing" className="btn secondary btn-lg">
              See Pricing
            </Link>
          </div>
          <p className="policy-note">
            A 20% deposit secures the appointment and goes toward the final total.
          </p>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Choose Your Tier</span>
          <h2 className="section-title">Three clear detailing tiers for Whidbey Island vehicles.</h2>
          <p className="section-copy">
            Choose the level your vehicle actually needs, then add only what solves a real
            problem.
          </p>
        </div>
        <div className="card-grid three">
          {servicePackages.map((pkg, index) => (
            <div className="reveal" data-reveal-delay={String(index)} key={pkg.id}>
              <ServiceCard
                title={pkg.title}
                description={pkg.description}
                bestFor={pkg.bestFor}
                price={pkg.price}
                priceNote={pkg.priceNote}
                features={pkg.features}
                packageId={pkg.id}
                highlight={pkg.highlight}
                themeStyle={pkg.themeStyle}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card-grid two">
        <article className="detailing-callout content-card reveal">
          <div className="support-pill">
            <Gauge size={16} />
            Garage Studio or Mobile
          </div>
          <h3>Heavy work belongs in the garage studio. Mobile is for lighter jobs.</h3>
          <div className="location-stack">
            <div>
              <h4>Garage Studio (Erie St)</h4>
              <p>
                Drop-off service near Erie Street in Oak Harbor. Exact address is shared after
                booking. If the vehicle needs controlled lighting, reliable power, weather
                protection, or a longer reset, the studio is the better call.
              </p>
            </div>
            <div>
              <h4>On-Island Mobile</h4>
              <p>
                Available within roughly a 25–30 mile radius of Oak Harbor, including NAS
                Whidbey, Coupeville, Deception Pass, and nearby areas. No heavy machine
                polishing or multi-day jobs on mobile appointments.
              </p>
            </div>
          </div>
        </article>

        <article className="detailing-callout content-card reveal" data-reveal-delay="1">
          <div className="badge-popular">Membership</div>
          <h3>Keep the vehicle from sliding backward.</h3>
          <p className="section-copy">
            Maintenance plans are for customers who already have a clean baseline and want
            predictable upkeep without re-deciding every month.
          </p>
          <p className="membership-punch">
            Keep it dialed from <span className="accent-text">$60/mo</span> with member-first
            scheduling and fewer “it&apos;s trashed again” surprises.
          </p>
          <ul className="package-bullets">
            <li className="feature-row"><ShieldCheck size={18} className="icon-lime" /><span className="feature-text">Best for daily drivers after a Deep Reset or New Car Protection service</span></li>
            <li className="feature-row"><ShieldCheck size={18} className="icon-lime" /><span className="feature-text">Guaranteed spots, easier long-term upkeep, and pricing you do not have to keep renegotiating</span></li>
          </ul>
          <Link
            to="/memberships"
            className="btn secondary"
            onClick={() =>
              trackEvent('Detailing Lead - View Plans', {
                cta: 'maintenance_plan_view_plans',
              })
            }
          >
            View Plans
          </Link>
        </article>
      </section>

      <section className="review-strip reveal">
        <div className="quote-shell">
          <p className="quote-blurb">“Easy to book, clear on price, and the car looked right when I got it back.”</p>
          <div className="stars-row">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="var(--color-rating-star)" color="var(--color-rating-star)" size={18} />
            ))}
            <span className="review-label">5.0★ local reviews — NAS Whidbey &amp; Oak Harbor</span>
          </div>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Systems In The Background</span>
          <h2 className="section-title">Busy drivers should not have to chase a detailer for updates.</h2>
          <p className="section-copy">
            Automations and AI agents handle intake, scheduling, reminders, and follow-up so
            you get faster replies, fewer dropped details, and a smoother appointment from
            first message to final payment.
          </p>
        </div>
        <div className="card-grid three">
          {[
            {
              icon: <MessageSquare size={22} />,
              title: 'Lead Intake',
              text: 'Uses webchat and SMS to collect your details fast and help you choose the right package without a long back-and-forth.',
            },
            {
              icon: <Calendar size={22} />,
              title: 'Scheduling',
              text: 'Keeps the calendar updated and blocks dates as bookings come in so your spot does not get lost or double-booked.',
            },
            {
              icon: <Bell size={22} />,
              title: 'Reminders',
              text: 'Sends prep instructions and appointment reminders so you know what to do before service day and nothing slips through.',
            },
            {
              icon: <Users size={22} />,
              title: 'Review & Referral',
              text: 'Follows up after service to request a Google review and make referring friends simple.',
            },
            {
              icon: <TrendingUp size={22} />,
              title: 'Planned: Membership Upsell',
              text: 'Will follow up after a Deep Reset or New Car Protection job with maintenance plan options before the vehicle slides backward again.',
            },
            {
              icon: <RefreshCw size={22} />,
              title: 'Operations',
              text: 'Deposits are tracked through Stripe, and booking records sync automatically to the database after payment.',
            },
          ].map((item, index) => (
            <article className="info-card reveal" data-reveal-delay={String(index % 3)} key={item.title}>
              <div className="support-pill">{item.icon}{item.title}</div>
              <p className="section-copy">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-local-cta content-card reveal">
        <div className="support-pill">
          <MapPinned size={16} />
          Oak Harbor · Whidbey Island
        </div>
        <h2 className="section-title">Ready to book without the usual back-and-forth?</h2>
        <p className="section-copy">
          Pick your tier, add only the upgrades that fit your vehicle, and see today&apos;s 20%
          deposit before you submit.
        </p>
        <div className="hero-actions">
          <Link
            to="/booking"
            className="btn primary"
            onClick={() =>
              trackEvent('Detailing Lead - Booking Page', {
                cta: 'final_configure_detail',
              })
            }
          >
            Pay 20% Deposit &amp; Book
          </Link>
          <Link to="/services" className="btn secondary">
            See Service Details
          </Link>
        </div>
      </section>

      <style>{`
        .detailing-home {
          display: grid;
          gap: 3rem;
        }

        .detailing-callout,
        .final-local-cta {
          display: grid;
          gap: 1rem;
        }

        .location-stack {
          display: grid;
          gap: 1rem;
        }

        .location-stack h4 {
          font-size: 1rem;
          margin-bottom: 0.35rem;
        }

        .location-stack p,
        .membership-punch,
        .quote-blurb,
        .review-label {
          color: var(--color-text-secondary);
        }

        .membership-punch {
          font-size: 1.02rem;
          font-weight: 700;
        }

        .review-strip {
          padding: 1.75rem 2rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
        }

        .quote-shell {
          display: grid;
          gap: 0.85rem;
          justify-items: center;
          text-align: center;
        }

        .quote-blurb {
          font-size: 1.05rem;
          max-width: 52ch;
        }

        .stars-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.55rem;
        }

        .review-label {
          font-family: var(--font-label);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
