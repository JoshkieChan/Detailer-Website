import { Link } from 'react-router-dom';
import { CalendarCheck, PlusCircle, ShieldCheck, ClipboardList } from 'lucide-react';
import { servicePackages } from '../data/packages';
import { detailAddOns } from '../data/addOns';

const ServicesPage = () => {
  return (
    <div className="page-shell services-page">
      <section className="page-hero text-center reveal compact-hero">
        <div className="capacity-banner inline-block">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
        <span className="eyebrow">Detailing / Services</span>
        <h1 className="hero-title">Three clear detailing tiers for Whidbey Island vehicles.</h1>
        <p className="hero-subtitle">
          Here&apos;s the full menu of detailing tiers, add-ons, and how the 20% deposit works.
          Use it to see what fits before you configure your booking.
        </p>
        <div className="hero-actions hero-actions-center">
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
          <Link to="/detailing" className="btn secondary">See Detailing Overview</Link>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Service Menu</span>
          <h2 className="section-title">Start with the baseline your vehicle actually needs.</h2>
          <p className="section-copy">
            Start here, then add optional upgrades if your vehicle needs more than the baseline.
          </p>
        </div>

        <div className="card-grid three">
          {servicePackages.map((pkg, index) => (
            <article
              className={`service-menu-card surface-card reveal ${pkg.highlight ? 'featured' : ''}`}
              data-reveal-delay={String(index)}
              key={pkg.id}
            >
              <div className="service-menu-top">
                <div>
                  <h3>{pkg.title}</h3>
                  <p className="service-best-for">{pkg.bestFor}</p>
                </div>
                {pkg.highlight && <div className="badge-popular menu-badge">Most booked</div>}
              </div>

              <ul className="package-bullets">
                {pkg.features.map((feature) => (
                  <li className="feature-row" key={feature}>
                    <ShieldCheck size={18} className="icon-lime" />
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="service-price-block">
                <div className="price-line">
                  <span className="price-prefix">From</span>
                  <span>${pkg.price}</span>
                </div>
                <p className="package-price-note">{pkg.priceNote}</p>
              </div>

              <Link to={`/booking?package=${pkg.id}`} className={`btn ${pkg.highlight ? 'primary' : 'secondary'} w-full`}>
                {pkg.title === 'New Car Protection' ? 'Book Protection' : `Book ${pkg.title}`}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Optional Add-Ons</span>
          <h2 className="section-title">Optional upgrades that solve specific problems.</h2>
          <p className="section-copy">
            These are upgrades, not hidden fees. Your base package stands on its own.
          </p>
        </div>

        <div className="addon-menu-grid">
          {detailAddOns.map((addOn, index) => (
            <article className="addon-menu-row reveal" data-reveal-delay={String(index % 2)} key={addOn.id}>
              <div className="addon-menu-copy">
                <h3>{addOn.name}</h3>
                <p className="section-copy">
                  {addOn.id === 'mobile-convenience'
                    ? 'Optional convenience upgrade for customers who want service at home or work instead of dropping off at the studio.'
                    : addOn.description}
                </p>
              </div>
              <div className="addon-price">+${addOn.price}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Deposit & Expectations</span>
          <h2 className="section-title">How the 20% deposit works.</h2>
        </div>

        <div className="card-grid two">
          <article className="content-card reveal">
            <div className="support-pill"><PlusCircle size={16} /> Deposit</div>
            <p className="section-copy">
              A 20% deposit is collected at booking to reserve your appointment time. It goes
              toward the final total, not on top. If the scope or vehicle condition changes
              significantly, the final total is confirmed before work begins.
            </p>
          </article>

          <article className="content-card reveal" data-reveal-delay="1">
            <div className="support-pill"><ClipboardList size={16} /> Expectations</div>
            <p className="section-copy">
              Please remove valuables, cash, documents, and heavy loose items before your
              appointment. Major last-minute scope changes can affect time and price, and any
              needed adjustment is confirmed before work starts.
            </p>
          </article>
        </div>
      </section>

      <section className="content-card reveal cta-block">
        <span className="eyebrow">Next Step</span>
        <h2 className="section-title">Ready to see your detail laid out?</h2>
        <p className="section-copy">
          The configurator lets you pick a tier, add-ons, and see today&apos;s deposit before you book.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
          <Link to="/detailing" className="btn secondary">See Detailing Overview</Link>
        </div>
      </section>

      <style>{`
        .services-page {
          display: grid;
          gap: 2.75rem;
        }

        .compact-hero {
          max-width: 860px;
          margin: 0 auto;
        }

        .hero-actions-center {
          justify-content: center;
        }

        .service-menu-card {
          display: grid;
          gap: 1rem;
          padding: 1.5rem;
          min-height: 100%;
        }

        .service-menu-card.featured {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 92%, var(--color-accent-primary) 8%);
        }

        .service-menu-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .service-menu-card h3,
        .addon-menu-copy h3 {
          font-size: 1.35rem;
          line-height: 1.2;
          margin-bottom: 0.45rem;
        }

        .service-best-for {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .menu-badge {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .service-price-block {
          display: grid;
          gap: 0.55rem;
        }

        .addon-menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem 1rem;
        }

        .addon-menu-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.1rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 14px;
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base);
        }

        .addon-menu-row:hover {
          transform: translateY(-4px);
          border-color: var(--color-accent-primary);
          box-shadow: var(--shadow-hover);
        }

        .addon-menu-copy {
          display: grid;
          gap: 0.35rem;
        }

        .addon-price {
          font-family: var(--font-label);
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          color: var(--color-accent-primary);
          white-space: nowrap;
          padding-top: 0.2rem;
        }

        .cta-block {
          display: grid;
          gap: 1rem;
        }

        @media (max-width: 960px) {
          .addon-menu-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .service-menu-card {
            padding: 1.6rem 1.25rem;
          }

          .service-menu-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
