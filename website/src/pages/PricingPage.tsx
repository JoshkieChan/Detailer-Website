import { Link } from 'react-router-dom';
import { ServiceCard } from '../components/ServiceCard';
import { servicePackages } from '../data/packages';
import { detailAddOns } from '../data/addOns';

const PricingPage = () => {
  return (
    <div className="page-shell pricing-page">
      <section className="page-hero text-center reveal">
        <span className="eyebrow">Pricing / Memberships</span>
        <h1 className="hero-title">Clear pricing, optional add-ons, visible deposit.</h1>
        <p className="hero-subtitle">
          Start with the tier your vehicle needs. Add upgrades only when they actually solve
          a problem.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Core Detailing Tiers</span>
          <h2 className="section-title">Start with the baseline your vehicle needs.</h2>
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

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Optional Add-Ons</span>
          <h2 className="section-title">Optional upgrades, not hidden fees.</h2>
          <p className="section-copy">
            Your base package stands on its own. Add-ons are only for extra labor, extra
            correction, or extra convenience.
          </p>
        </div>
        <div className="addon-price-grid card-grid two">
          {detailAddOns.map((addOn, index) => (
            <div className="addon-price-card reveal" data-reveal-delay={String(index % 2)} key={addOn.id}>
              <div>
                <h3>{addOn.name}</h3>
                <p className="section-copy">{addOn.description}</p>
              </div>
              <div className="addon-price">+${addOn.price}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-grid two">
        <article className="content-card reveal">
          <span className="eyebrow">Today&apos;s Deposit</span>
          <h2 className="section-title">Today&apos;s deposit is 20%.</h2>
          <p className="section-copy">
            You pay 20% at booking to reserve the appointment. The remaining balance is due
            after the work is completed.
          </p>
        </article>
        <article className="content-card reveal" data-reveal-delay="1">
          <span className="eyebrow">Whidbey Positioning</span>
          <h2 className="section-title">A systems-driven local shop for Whidbey Island.</h2>
          <p className="section-copy">
            SignalSource is built around repeatable quality, clear scheduling, and honest
            scope. On-Island Mobile Convenience is available when you want us to come to you,
            but the service itself stays structured and predictable.
          </p>
        </article>
      </section>

      <section className="content-card reveal">
        <span className="eyebrow">Ready To Book</span>
        <h2 className="section-title">Pick the tier, add what you need, and see the deposit before you submit.</h2>
        <p className="section-copy">
          Final pricing is confirmed before work begins if vehicle condition or selected scope
          changes from what was originally selected.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary">Pay 20% Deposit &amp; Book</Link>
          <Link to="/memberships" className="btn secondary">See Memberships</Link>
        </div>
      </section>

      <style>{`
        .pricing-page {
          display: grid;
          gap: 3rem;
        }

        .addon-price-grid {
          align-items: stretch;
        }

        .addon-price-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.4rem 1.5rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
        }

        .addon-price-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-accent-primary);
          box-shadow: var(--shadow-hover);
        }

        .addon-price-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.45rem;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
