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
    body: 'Deep cleaning and restoration for high-touch interior surfaces from a recent Deep Reset Detail.',
    link: '/our-work',
    image: '/images/gallery/interior-reset.png',
  },
  {
    title: 'Exterior finish',
    body: 'Noticeable clarity and protection on the exterior after a Deep Reset Detail.',
    link: '/our-work',
    image: '/images/gallery/exterior-finish.jpg',
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
      .catch(() => {
        // Error silently handled - UI shows default message
      });
  }, []);

  return (
    <div className="page-shell detailing-home">
      <header className="page-hero reveal">
        <h1 className="hero-title">
          Whidbey Island detailing for drivers who want it done right the first time.
        </h1>
        <p className="hero-subtitle">
          SignalSource is a systems-driven local shop in Oak Harbor. We clean, protect, and maintain daily drivers on a clear system — no vague &apos;full detail&apos; packages or surprise add-ons.
        </p>
        {nextAvailableOpening ? (
          <div className="availability-badge">
            <CalendarCheck size={16} />
            Next available: {nextAvailableOpening.date} at {nextAvailableOpening.startTime}
          </div>
        ) : null}
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

        <div className="our-work-container content-card reveal">
          <div className="before-after-display">
            <div className="before-after-display__image">
              <img src="/images/gallery/detail-before.png" alt="Before" />
              <span className="before-after-display__label">Before</span>
            </div>
            <div className="before-after-display__image">
              <img src="/images/gallery/detail-after.png" alt="After" />
              <span className="before-after-display__label">After</span>
            </div>
          </div>

          <div className="our-work-proof-cards">
            {galleryProofCards.map((card, index) => (
              <article 
                key={card.title}
                className="our-work-proof-card reveal"
                data-reveal-delay={String(index)}
              >
                {card.image && (
                  <div className="our-work-proof-card__image">
                    <img src={card.image} alt={card.title} />
                  </div>
                )}
                <div className="our-work-proof-card__copy">
                  <h3>{card.title}</h3>
                  <p className="section-copy">{card.body}</p>
                </div>
              </article>
            ))}
          </div>
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

        .our-work-container {
          display: grid;
          gap: 2rem;
          padding: 2rem;
        }

        .our-work-proof-card__image {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 12px;
        }

        .our-work-proof-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        .page-hero {
          position: relative;
          padding: 6rem 2rem 4rem;
          background: linear-gradient(135deg, var(--color-background-surface) 0%, var(--color-background-surface) 50%, color-mix(in srgb, var(--color-background-surface) 95%, var(--color-accent-primary) 5%) 100%);
          text-align: center;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
        }

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-accent-primary) 20%, transparent);
          border-radius: 9999px;
          color: var(--color-accent-primary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-hero {
            padding: 4rem 1.5rem 3rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }
        }

        .before-after-display {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .before-after-display__image {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 12px;
        }

        .before-after-display__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .before-after-display__label {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
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
          .two-up,
          .before-after-display {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
