import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Star,
  CalendarCheck,
  Gauge,
  MapPinned,
  CheckCircle2,
} from 'lucide-react';
import { servicePackages } from '../data/packages';
import { trackEvent } from '../lib/analytics';
import { fetchAvailability } from '../api/availability';

const galleryProofCards = [
  {
    title: 'Interior reset',
    body: 'Deep cleaning and restoration for high-touch interior surfaces.',
    link: '/our-work',
  },
  {
    title: 'Exterior finish',
    body: 'Noticeable clarity and protection for the vehicle exterior.',
    link: '/our-work',
  }
];

const HomePage = () => {
  const trackedDepths = useRef(new Set<number>());
  const [nextAvailableOpening, setNextAvailableOpening] = useState<{
    date: string;
    startTime: string;
    serviceLabel: string;
  } | null>(null);

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

  useEffect(() => {
    fetchAvailability('maintenance')
      .then((data) => setNextAvailableOpening(data.nextAvailableOpening))
      .catch((error) => console.error('Failed to load next opening', error));
  }, []);

  return (
    <div className="page-shell detailing-home">
      <header className="page-hero reveal">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="capacity-banner">
              <CalendarCheck size={16} /> Currently accepting 2–3 customers per day, Monday–Saturday.
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
              <Link to="/pricing" className="btn secondary">
                See Pricing
              </Link>
            </div>
            <p className="policy-note">
              A 20% deposit secures the appointment and goes toward the final total.
            </p>
            {nextAvailableOpening ? (
              <p className="section-note next-opening-pill mt-1">
                Next available opening: {nextAvailableOpening.date} at {nextAvailableOpening.startTime} for {nextAvailableOpening.serviceLabel}
              </p>
            ) : null}
          </div>
          <div className="hero-visual"></div>
        </div>
      </header>

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
          <span className="eyebrow">Our Work</span>
          <h2 className="section-title">See the results from our latest resets.</h2>
          <p className="section-copy">
            We focus on real turnaround for daily drivers. No stock photos, just the actual 
            starting condition and final finish.
          </p>
        </div>

        <div className="our-work-proof-cards">
          {galleryProofCards.map((card, index) => (
            <article 
              key={card.title}
              className="our-work-proof-card content-card reveal"
              data-reveal-delay={String(index)}
            >
              <div className="our-work-proof-card__copy">
                <h3>{card.title}</h3>
                <p className="section-copy">{card.body}</p>
                <Link to={card.link} className="text-link">View documentation →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="detailing-section">
        <div className="section-header reveal">
          <span className="eyebrow">Choose Your Tier</span>
          <h2 className="section-title">Two clear detailing tiers for Whidbey Island vehicles.</h2>
          <p className="section-copy">
            Choose the level your vehicle actually needs. If you need extras like light engine bay tidying, severe pet hair, or headlight work, mention it in your booking notes. We&apos;ll review your photos and confirm what&apos;s realistic and the total price before your appointment.
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
              >
                {pkg.highlight ? 'Book Deep Reset' : `Book ${pkg.title}`}
              </Link>
            </article>
          ))}
        </div>
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
              booking.
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
              Whidbey.
            </p>
          </article>
        </div>
      </section>

      <section className="final-local-cta content-card reveal">
        <div className="support-pill">
          <MapPinned size={16} />
          Ready To Book
        </div>
        <h2 className="section-title">Pick your tier and lock in your spot.</h2>
        <div className="hero-actions cta-actions">
          <Link to="/booking" className="btn primary btn-lg">
            Pay 20% Deposit &amp; Book
          </Link>
          <Link to="/pricing" className="btn secondary">
            See Service Details
          </Link>
        </div>
      </section>

      <style>{`
        .detailing-home {
          display: grid;
          gap: 2rem;
        }

        .our-work-proof-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .our-work-proof-card {
          padding: 1.5rem;
          display: grid;
          gap: 1rem;
        }

        .our-work-proof-card__copy {
          display: grid;
          gap: 0.5rem;
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

        .stars-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.55rem;
        }

        .detailing-section {
          display: grid;
          gap: 1.5rem;
          padding-top: 1rem;
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
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

        .final-local-cta {
          display: grid;
          gap: 1rem;
          padding: 2rem;
        }

        @media (max-width: 820px) {
          .tier-grid,
          .our-work-proof-cards,
          .two-up {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
