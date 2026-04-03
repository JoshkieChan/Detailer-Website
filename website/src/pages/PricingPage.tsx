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
                  <p className="tier-for-line">{pkg.bestFor}</p>
                </div>
              </div>

              <ul className="tier-inclusions">
                {pkg.features.map((feature) => (
                  <li className="feature-row" key={feature}>
                    <ShieldCheck size={18} className="icon-lime" />
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
              <div className="addon-price">{`+$${addOn.price}`}</div>
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

        @media (max-width: 960px) {
          .pricing-page {
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .pricing-page {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
