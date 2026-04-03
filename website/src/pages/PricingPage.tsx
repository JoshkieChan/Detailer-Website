import { Link } from 'react-router-dom';
import { servicePackages } from '../data/packages';
import { detailAddOns } from '../data/addOns';
import { ShieldCheck, PlusCircle, MapPinned } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="page-shell pricing-page">
      <section className="page-hero text-center reveal compact-hero">
        <span className="eyebrow">Pricing / Memberships</span>
        <h1 className="hero-title">Clear pricing, optional add-ons, visible deposit.</h1>
        <p className="hero-subtitle">
          Start with the tier your vehicle needs. Add upgrades only when they actually solve
          a problem.
        </p>
        <div className="hero-actions hero-actions-center">
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
          <Link to="/detailing" className="btn secondary">See Detailing Overview</Link>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Core Detailing Tiers</span>
          <h2 className="section-title">Start with the baseline your vehicle needs.</h2>
        </div>

        <div className="pricing-tier-grid">
          {servicePackages.map((pkg, index) => (
            <article
              className={`pricing-tier-card reveal ${pkg.highlight ? 'featured' : ''}`}
              data-reveal-delay={String(index)}
              key={pkg.id}
            >
              <div className="pricing-tier-top">
                <div>
                  <h3>{pkg.title}</h3>
                  <p className="pricing-best-for">{pkg.bestFor}</p>
                </div>
                {pkg.highlight && <div className="badge-popular pricing-tier-badge">Most booked</div>}
              </div>

              <ul className="package-bullets">
                {pkg.features.map((feature) => (
                  <li className="feature-row" key={feature}>
                    <ShieldCheck size={18} className="icon-lime" />
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pricing-tier-bottom">
                <div className="price-line">
                  <span className="price-prefix">From</span>
                  <span>${pkg.price}</span>
                </div>
                <p className="pricing-note">{pkg.priceNote}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Optional Add-Ons</span>
          <h2 className="section-title">Optional add-ons.</h2>
          <p className="section-copy">
            These are upgrades, not hidden fees. Your base package stands on its own; add-ons
            only apply when extra labor, correction, or convenience is needed.
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
              A 20% deposit is collected at booking to reserve your appointment time. It is
              applied to the final total, not added on top. If scope or condition changes
              significantly, the final total is confirmed before work begins.
            </p>
            <p className="section-note">
              Please remove valuables, cash, documents, and heavy loose items before your
              appointment. Major last-minute changes can affect time and price.
            </p>
          </article>

          <article className="content-card reveal" data-reveal-delay="1">
            <div className="support-pill"><MapPinned size={16} /> Whidbey Island, systems-driven</div>
            <p className="section-copy">
              SignalSource is built for Oak Harbor and Whidbey drivers who want repeatable
              quality, clear scheduling, and honest scope.
            </p>
          </article>
        </div>
      </section>

      <section className="content-card reveal membership-block">
        <span className="eyebrow">Maintenance Plans</span>
        <h2 className="section-title">For after a Deep Reset or New Car Protection.</h2>
        <p className="section-copy">
          For customers who already have a clean baseline and want predictable upkeep without
          re-deciding every month.
        </p>
        <ul className="package-bullets compact-list">
          <li className="feature-row"><ShieldCheck size={18} className="icon-lime" /><span className="feature-text">Reserved spots and easier long-term upkeep</span></li>
          <li className="feature-row"><ShieldCheck size={18} className="icon-lime" /><span className="feature-text">Less mental load than waiting until the vehicle slips backward again</span></li>
          <li className="feature-row"><ShieldCheck size={18} className="icon-lime" /><span className="feature-text">Built for drivers who want a clean baseline to stay clean</span></li>
        </ul>
        <div className="hero-actions">
          <Link to="/memberships" className="btn secondary">View Plans</Link>
        </div>
      </section>

      <section className="content-card reveal cta-block">
        <span className="eyebrow">Ready To Lock In Your Spot?</span>
        <h2 className="section-title">See your estimated total and today&apos;s deposit before you book.</h2>
        <p className="section-copy">
          The configurator lets you pick a tier, add-ons, and see the 20% deposit before you submit.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
          <Link to="/detailing" className="btn secondary">See Detailing Overview</Link>
        </div>
      </section>

      <style>{`
        .pricing-page {
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

        .pricing-tier-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .pricing-tier-card {
          display: grid;
          gap: 1rem;
          min-height: 100%;
          padding: 1.5rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 14px;
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base),
            background-color var(--transition-base);
        }

        .pricing-tier-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-hover);
        }

        .pricing-tier-card.featured {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 92%, var(--color-accent-primary) 8%);
        }

        .pricing-tier-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .pricing-tier-top h3,
        .addon-menu-copy h3 {
          font-size: 1.35rem;
          line-height: 1.2;
          margin-bottom: 0.45rem;
        }

        .pricing-best-for {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .pricing-tier-badge {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .pricing-tier-bottom {
          display: grid;
          gap: 0.55rem;
        }

        .pricing-note {
          color: var(--color-text-secondary);
          font-size: 0.84rem;
          line-height: 1.6;
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

        .membership-block,
        .cta-block {
          display: grid;
          gap: 1rem;
        }

        .compact-list {
          gap: 0.8rem;
        }

        @media (max-width: 960px) {
          .pricing-tier-grid,
          .addon-menu-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .pricing-tier-card {
            padding: 1.5rem 1.25rem;
          }

          .pricing-tier-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
