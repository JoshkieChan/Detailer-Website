import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  Star,
  ShieldCheck,
  CalendarCheck,
  Gauge,
  MapPinned,
  MessageSquare,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { servicePackages } from '../data/packages';
import { trackEvent } from '../lib/analytics';

const systemsBenefits = [
  {
    title: 'Faster replies',
    text: 'You get clearer answers earlier instead of long back-and-forth before you can even book.',
  },
  {
    title: 'Clear reminders',
    text: 'Prep instructions and appointment reminders keep service day from turning into guesswork.',
  },
  {
    title: 'Fewer dropped balls',
    text: 'The process stays tighter so details, follow-up, and payment handoff do not get lost.',
  },
];

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

      <section className="detailing-section">
        <div className="section-header reveal">
          <span className="eyebrow">Choose Your Tier</span>
          <h2 className="section-title">Two clear detailing tiers for Whidbey Island vehicles.</h2>
          <p className="section-copy">
            Choose the level your vehicle actually needs. If you need extras like engine bay cleaning, severe pet hair, or headlight work, mention it in your booking notes.
          </p>
        </div>

        <div className="tier-grid">
          {servicePackages.map((pkg, index) => (
            <article
              className={`tier-card reveal ${pkg.highlight ? 'featured' : ''}`}
              data-reveal-delay={String(index)}
              key={pkg.id}
            >
              <div className="tier-card-head">
                <div>
                  <div className="tier-title-row">
                    <h3>{pkg.title}</h3>
                    {pkg.highlight && <div className="badge-popular tier-badge">Most booked</div>}
                  </div>
                  <p className="tier-for-line">{pkg.description}</p>
                </div>
              </div>

              <ul className="tier-inclusions">
                {pkg.features.map((feature) => (
                  <li className="feature-row" key={feature}>
                    <CheckCircle2 size={18} className="icon-lime" />
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="tier-price-wrap">
                <div className="price-line">
                  <span className="price-prefix">From</span>
                  <span>{`$${pkg.price}`}</span>
                </div>
                <p className="tier-price-note">{pkg.priceNote}</p>
              </div>

              <Link
                to={`/booking?package=${pkg.id}`}
                className={`btn w-full ${pkg.highlight ? 'primary' : 'secondary'}`}
                onClick={() =>
                  trackEvent('Detailing Lead - Booking Page', {
                    cta: 'tier_book_now',
                    package_id: pkg.id,
                  })
                }
              >
                {pkg.highlight ? 'Book Deep Reset' : `Book ${pkg.title}`}
              </Link>
            </article>
          ))}
        </div>
        <p className="section-note mt-1 reveal text-center">
          <strong>Need extras?</strong> Engine bay cleaning, severe pet hair, or headlight work? Mention it in your booking notes. We&apos;ll review your photos and send updated pricing before we start.
        </p>
      </section>

      <section className="detailing-section">
        <div className="section-header reveal">
          <span className="eyebrow">Service Modes</span>
          <h2 className="section-title">Garage studio for heavier work. On-Island Mobile for convenience.</h2>
        </div>

        <div className="section-panel two-up reveal" data-reveal-delay="1">
          <article className="detailing-callout">
            <div className="support-pill">
              <Gauge size={16} />
              Garage Studio
            </div>
            <h3>Better for resets, protection work, and longer jobs.</h3>
            <p className="section-copy">
              Drop-off service near Erie Street in Oak Harbor. Exact address is shared after
              booking. If the vehicle needs controlled lighting, reliable power, weather
              protection, or a longer reset, the studio is the better call.
            </p>
          </article>

          <article className="detailing-callout">
            <div className="support-pill">
              <MapPinned size={16} />
              On-Island Mobile
            </div>
            <h3>Better when home or work service makes more sense.</h3>
            <p className="section-copy">
              Available within roughly a 25–30 mile radius of Oak Harbor, including NAS
              Whidbey, Coupeville, Deception Pass, and nearby areas. No heavy machine
              polishing or multi-day jobs on mobile appointments.
            </p>
          </article>
        </div>
      </section>

      <section className="detailing-section">
        <div className="section-header reveal">
          <span className="eyebrow">Maintenance Plans</span>
          <h2 className="section-title">Keep the vehicle from sliding backward.</h2>
        </div>

        <div className="section-panel membership-panel reveal" data-reveal-delay="1">
          <article className="detailing-callout">
            <div className="badge-popular tier-badge">Membership</div>
            <p className="section-copy">
              Maintenance plans are for customers who already have a clean baseline and want
              predictable upkeep without re-deciding every month.
            </p>
            <p className="membership-punch">
              Keep it dialed from <span className="accent-text">$60/mo</span> with member-first
              scheduling and fewer “it&apos;s trashed again” surprises.
            </p>
            <ul className="tier-inclusions compact">
              <li className="feature-row">
                <ShieldCheck size={18} className="icon-lime" />
                <span className="feature-text">Best for daily drivers after a Deep Reset service</span>
              </li>
              <li className="feature-row">
                <ShieldCheck size={18} className="icon-lime" />
                <span className="feature-text">Guaranteed spots, easier upkeep, and less mental load than ad-hoc booking</span>
              </li>
            </ul>
            <Link
              to="/memberships"
              className="btn secondary membership-btn"
              onClick={() =>
                trackEvent('Detailing Lead - View Plans', {
                  cta: 'maintenance_plan_view_plans',
                })
              }
            >
              View Plans
            </Link>
          </article>
        </div>
      </section>

      <section className="detailing-section">
        <div className="section-header reveal">
          <span className="eyebrow">Systems In The Background</span>
          <h2 className="section-title">A smoother detailing experience because the systems run in the background.</h2>
          <p className="section-copy">
            SignalSource uses automation behind the scenes so booking detailing feels cleaner
            and more predictable for you.
          </p>
        </div>

        <div className="section-panel benefits-panel reveal" data-reveal-delay="1">
          {systemsBenefits.map((item, index) => (
            <article className="benefit-row reveal-item" key={item.title}>
              <div className="support-pill slim">
                {index === 0 ? <MessageSquare size={16} /> : index === 1 ? <Bell size={16} /> : <ShieldCheck size={16} />}
                {item.title}
              </div>
              <p className="section-copy">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-local-cta content-card reveal">
        <div className="support-pill">
          <MapPinned size={16} />
          Ready To Book
        </div>
        <h2 className="section-title">Pick your tier and lock in your spot.</h2>
        <p className="section-copy">
          You&apos;ll see today&apos;s 20% deposit before you submit. If you still need to compare
          options first, read the service details or pricing before booking.
        </p>
        <div className="hero-actions cta-actions">
          <Link
            to="/booking"
            className="btn primary btn-lg"
            onClick={() =>
              trackEvent('Detailing Lead - Booking Page', {
                cta: 'final_configure_detail',
              })
            }
          >
            Pay 20% Deposit &amp; Book
          </Link>
          <Link to="/services" className="btn secondary">
            See Service Details &amp; Pricing
          </Link>
        </div>
        <p className="cta-reassurance">
          The 20% deposit goes toward your final total, not on top. Final pricing is
          confirmed before work begins if scope or vehicle condition changes.
        </p>
      </section>

      <style>{`
        .detailing-home {
          display: grid;
          gap: 2rem;
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
          color: var(--color-text-secondary);
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
          color: var(--color-text-secondary);
        }

        .detailing-section {
          display: grid;
          gap: 1.5rem;
          padding-top: 1rem;
        }

        .tier-grid {
          margin-bottom: 2rem;
        }

        .section-panel {
          padding: 1.6rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
        }

        .two-up {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .detailing-callout {
          display: grid;
          gap: 0.85rem;
        }

        .detailing-callout h3 {
          font-size: 1.2rem;
          line-height: 1.3;
        }

        .membership-panel {
          max-width: 760px;
        }

        .membership-punch {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-secondary);
        }

        .membership-btn {
          width: fit-content;
        }

        .benefits-panel {
          display: grid;
          gap: 1rem;
        }

        .benefit-row {
          display: grid;
          gap: 0.65rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border-default);
        }

        .benefit-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .support-pill.slim {
          width: fit-content;
        }

        .final-local-cta {
          display: grid;
          gap: 1rem;
          margin-top: 0.5rem;
          padding: 2rem;
        }

        .cta-actions {
          align-items: center;
        }

        .cta-reassurance {
          color: var(--color-text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
          max-width: 60ch;
        }

        @media (max-width: 1040px) {
          .tier-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .two-up {
            grid-template-columns: 1fr;
          }

          .section-panel,
          .final-local-cta,
          .tier-card,
          .review-strip {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
