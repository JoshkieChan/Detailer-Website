import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Star,
  ShieldCheck,
  Gauge,
  MapPinned,
  CheckCircle2,
} from 'lucide-react';
import { servicePackages } from '../data/packages';
import { trackEvent } from '../lib/analytics';
import { fetchAvailability } from '../api/availability';
import { PageHeroWithBackground } from '../components/PageHeroWithBackground';

const recentWorkImages = [
  {
    src: "/images/recent-work/01.jpg",
    alt: "Interior reset – family SUV front seats",
    label: "Interior reset – family SUV",
  },
  {
    src: "/images/recent-work/02.jpg",
    alt: "Wheel and tire deep clean",
    label: "Wheel and tire deep clean",
  },
  {
    src: "/images/recent-work/03.jpg",
    alt: "Interior carpet and floor reset",
    label: "Interior carpet and floor reset",
  },
  {
    src: "/images/recent-work/04.png",
    alt: "Subaru wheel detailing",
    label: "Subaru wheel detailing",
  },
  {
    src: "/images/recent-work/05.png",
    alt: "Exterior foam wash - Subaru Outback",
    label: "Exterior foam wash - Subaru Outback",
  },
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
      <PageHeroWithBackground imageSrc="/images/hero-detailing.jpg">
        <p className="text-xs font-semibold tracking-wide text-primary">
          Currently accepting 2–3 customers per day, Monday–Saturday.
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Whidbey Island detailing for drivers who want it done right the first time.
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-100">
          SignalSource is a systems-driven local shop in Oak Harbor. We clean, protect, and maintain daily drivers without wasting your day or leaving you guessing on price.
        </p>
        <div className="hero-actions hero-actions-center mt-6">
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
          <Link to="/pricing" className="btn secondary text-white border-white/30 hover:bg-white/10 btn-lg">
            See Pricing
          </Link>
        </div>
        <p className="policy-note text-slate-300 mt-4">
          A 20% deposit secures the appointment and goes toward the final total.
        </p>
        {nextAvailableOpening ? (
          <p className="section-note next-opening-pill bg-white/10 border-white/20 text-white mt-4 inline-block">
            Next available opening: {nextAvailableOpening.date} at {nextAvailableOpening.startTime} for {nextAvailableOpening.serviceLabel}
          </p>
        ) : null}
      </PageHeroWithBackground>

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
            Choose the level your vehicle actually needs. If you need extras like light engine bay tidying, severe pet hair, or headlight work, mention it in your booking notes. We&apos;ll review your photos and confirm what&apos;s realistic and the total price before your appointment. Engine bay work is limited to light dusting and wipe-down only; we do not offer deep degreasing or engine detailing at this time.
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

              {pkg.id === 'deep-reset' && (
                <div className="addon-callout">
                  <p className="addon-label"><strong>Optional add-ons</strong></p>
                  <p className="section-note">Light paint correction (machine polishing to reduce swirls and minor surface scratches in the clear coat) is available on a case‑by‑case basis after inspection. It does not repair dents or deep damage.</p>
                  <p className="section-note mt-1"><strong>Weather and paint safety</strong><br/>In extreme heat or full sun with no shade, we may adjust or reschedule the decontamination and polishing steps to protect your paint. We’ll always talk this through with you on the day of service so you know exactly what will be done.</p>
                </div>
              )}

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

        <section className="py-12 sm:py-16 reveal border-t border-border mt-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              RECENT WORK
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              A few real vehicles we&apos;ve cleaned and reset.
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              These are actual angles from Whidbey Island drivers. Use them to get a feel
              for the level of work before you book.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentWorkImages.map((item) => (
                <figure
                  key={item.src}
                  className="overflow-hidden rounded-xl border border-border bg-muted/40 transition-all hover:shadow-lg"
                >
                  <div className="overflow-hidden h-48 sm:h-56">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="h-full w-full object-cover transition duration-500 hover:scale-110"
                    />
                  </div>
                  <figcaption className="px-3 py-3 text-xs sm:text-sm text-muted-foreground font-medium border-t border-border bg-white">
                    {item.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        
        <div className="section-panel reveal mt-1 text-center" style={{ maxWidth: '800px', margin: '0 auto 1rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Products we use (without the chemistry lesson)</h3>
          <p className="section-copy" style={{ textAlign: 'left', margin: '0 auto' }}>
            We use modern pH‑balanced wash soaps, dedicated wheel and tire cleaners, interior‑safe cleaners, iron removers, and clay to safely deep‑clean without beating up your clear coat or interior. That means:
            <br/><br/>
            – Brake dust and brown, baked-on tire grime broken down instead of just pushed around<br/>
            – Traffic film, road grime, and fallout removed so the paint feels smooth again<br/>
            – Interiors cleaned with products safe for modern plastics, vinyl, and leather<br/>
            – Light to moderate fabric staining treated where safely extractable<br/>
            – Glass haze, fingerprints, and bug residue removed, with ceramic glass treatment to help water bead and make future washes easier
          </p>
        </div>

        <p className="section-note mt-1 reveal text-center">
          <strong>Need extras?</strong> If you need extras like light engine bay tidying, severe pet hair, or headlight work, mention it in your booking notes. We’ll review your photos and confirm what’s realistic and the total price before your appointment. Engine bay work is limited to light dusting and wipe‑down of accessible areas only; we do not offer deep degreasing or full engine detailing at this time.
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



      <section className="detailing-section reveal">
        <div className="section-header">
          <span className="eyebrow">Scope &amp; Boundaries</span>
          <h2 className="section-title">What we don&apos;t do.</h2>
        </div>
        <div className="section-panel reveal" data-reveal-delay="1">
          <p className="section-copy">
            To keep our quality consistent, we focus on high-end maintenance and resets. We do not offer:
            <br/><br/>
            – Full ceramic coatings (we use spray‑on protection and ceramic glass treatments instead)<br/>
            – Full interior mold remediation<br/>
            – Deep engine bay degreasing or pressure‑washing (light dusting and wipe‑down only)<br/>
            – Deep stain or paint damage repair (light correction is available, but deep gouges or failed clear coat require a body shop)<br/>
            – We also do not repair dents, bent metal, or perform collision repair.
          </p>
          <div className="mt-2">
            <Link to="/faq" className="text-link">Have more questions? Read our full FAQ →</Link>
          </div>
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
