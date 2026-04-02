import { Link } from 'react-router-dom';
import { CalendarCheck, Home, MapPin, ShieldCheck, PlusCircle } from 'lucide-react';
import { servicePackages } from '../data/packages';
import { detailAddOns } from '../data/addOns';

const ServicesPage = () => {
  return (
    <div className="page-shell services-page">
      <section className="page-hero text-center reveal">
        <div className="capacity-banner inline-block">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
        <span className="eyebrow">Detailing / Services</span>
        <h1 className="hero-title">Three clear detailing tiers for Whidbey Island vehicles.</h1>
        <p className="hero-subtitle">
          Pick the baseline your vehicle needs, then add optional upgrades like pet hair,
          stain work, or On-Island Mobile Convenience.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Choose Your Tier</span>
          <h2 className="section-title">Start with the baseline your vehicle actually needs.</h2>
          <p className="section-copy">
            Every package is built to stand on its own. Add-ons are optional upgrades for
            extra labor, extra correction, or extra convenience.
          </p>
        </div>

        <div className="card-grid three">
          {servicePackages.map((pkg, index) => (
            <article className={`service-detail-card surface-card reveal ${pkg.highlight ? 'featured' : ''}`} data-reveal-delay={String(index)} key={pkg.id}>
              {pkg.highlight && <div className="badge-popular">Signature Reset</div>}
              <h3>{pkg.title}</h3>
              <p className="section-copy">{pkg.description}</p>
              <p className="service-best-for"><strong>Who it&apos;s for:</strong> {pkg.bestFor}</p>
              <ul className="package-bullets">
                {pkg.features.map((feature) => (
                  <li className="feature-row" key={feature}>
                    <ShieldCheck size={18} className="icon-lime" />
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="price-line">
                <span className="price-prefix">From</span>
                <span>${pkg.price}</span>
              </div>
              <p className="package-price-note">{pkg.priceNote}</p>
              <Link to={`/booking?package=${pkg.id}`} className={`btn ${pkg.highlight ? 'primary' : 'secondary'}`}>
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
        <div className="card-grid two">
          {detailAddOns.map((addOn, index) => (
            <article className="addon-card reveal" data-reveal-delay={String(index % 2)} key={addOn.id}>
              <div>
                <h3>{addOn.name}</h3>
                <p className="section-copy">{addOn.description}</p>
              </div>
              <div className="addon-price">+${addOn.price}</div>
            </article>
          ))}
        </div>
        <p className="section-note reveal">
          On-Island Mobile Convenience is not a tax. It is an optional convenience upgrade for
          customers who want service at home or work instead of dropping off at the studio.
        </p>
      </section>

      <section className="card-grid two">
        <article className="content-card reveal">
          <div className="support-pill"><Home size={16} /> Garage Studio</div>
          <h3>Garage Studio is the better choice for heavier work.</h3>
          <p className="section-copy">
            Drop-off service near Erie Street in Oak Harbor with controlled lighting, reliable
            power, and weather protection. Best for heavier interior resets, longer jobs, and
            protection-focused work.
          </p>
        </article>
        <article className="content-card reveal" data-reveal-delay="1">
          <div className="support-pill"><MapPin size={16} /> On-Island Mobile</div>
          <h3>Mobile is a convenience option, not the default.</h3>
          <p className="section-copy">
            Available across Oak Harbor, NAS Whidbey, Coupeville, Deception Pass, and nearby
            areas within roughly 25–30 miles. Best for lighter jobs when home or work service
            makes more sense than drop-off.
          </p>
        </article>
      </section>

      <section className="content-card reveal">
        <div className="support-pill"><PlusCircle size={16} /> Deposit</div>
        <h2 className="section-title">Simple booking, clear commitment.</h2>
        <p className="section-copy">
          A 20% deposit is collected at booking to reserve your appointment time. It applies
          to your final invoice and is not an extra fee. If the scope changes significantly
          after booking, we confirm the updated total before work begins.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary">Pay 20% Deposit &amp; Book</Link>
          <Link to="/pricing" className="btn secondary">See Pricing</Link>
        </div>
      </section>

      <style>{`
        .services-page {
          display: grid;
          gap: 3rem;
        }

        .service-detail-card {
          padding: 1.6rem;
          display: grid;
          gap: 1rem;
        }

        .service-detail-card.featured {
          border-color: var(--color-accent-primary);
        }

        .service-detail-card h3,
        .addon-card h3 {
          font-size: 1.35rem;
        }

        .service-best-for {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .service-best-for strong {
          color: var(--color-text-primary);
        }

        .addon-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.35rem 1.5rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
        }

        .addon-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-accent-primary);
          box-shadow: var(--shadow-hover);
        }

        .addon-price {
          font-family: var(--font-label);
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          color: var(--color-accent-primary);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
