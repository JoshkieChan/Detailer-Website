import { Link } from 'react-router-dom';
import { CheckCircle, CalendarClock } from 'lucide-react';
import { maintenancePlans } from '../data/maintenancePlans';

const MembershipsPage = () => {
  return (
    <div className="page-shell memberships-page">
      <section className="page-hero text-center reveal">
        <span className="eyebrow">Maintenance Plans</span>
        <h1 className="hero-title">Keep the vehicle from sliding backward.</h1>
        <p className="hero-subtitle">
          Maintenance plans are for customers who already have a clean baseline and want
          predictable upkeep without re-deciding every month.
        </p>
      </section>

      <div className="card-grid two">
        {maintenancePlans.map((plan, index) => (
          <article key={plan.id} className={`membership-card reveal ${plan.popular ? 'featured' : ''}`} data-reveal-delay={String(index)}>
            <div className="membership-head">
              {plan.popular && <div className="badge-popular">Most picked</div>}
              <h2>{plan.name}</h2>
              <div className="membership-price">
                <span className="price-main">{plan.monthlyPrice}</span>
                <span className="price-suffix">/mo</span>
              </div>
            </div>

            <div className="membership-billing">
              <span className="eyebrow">Monthly equivalent</span>
              <p>{plan.monthlyEquivalent} for comparison.</p>
              <span className="eyebrow">How billing works</span>
              <p>{plan.billingLine}</p>
              <p>{plan.perksSummary}</p>
            </div>

            <ul className="package-bullets">
              {plan.features.map((feature) => (
                <li className="feature-row" key={feature}>
                  <CheckCircle size={18} className="icon-lime" />
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/booking" className={`btn w-full ${plan.popular ? 'primary' : 'secondary'}`}>
              {plan.ctaLabel}
            </Link>
          </article>
        ))}
      </div>

      <section className="content-card reveal">
        <div className="support-pill"><CalendarClock size={16} /> Who should join</div>
        <h2 className="section-title">Smarter than ad-hoc booking once you already have a clean baseline.</h2>
        <p className="section-copy">
          Plans make sense for drivers who want guaranteed spots, easier upkeep, and less
          mental load. If you keep waiting until the vehicle feels trashed again, you end up
          paying for bigger resets instead of lighter maintenance.
        </p>
        <div className="fine-print mt-1">
          <p><em>* Maintenance plans assume a clean starting baseline, usually after a Deep Reset or New Car Protection service.</em></p>
          <p><em>* Cancel anytime after 3 months. Minimum commitment required.</em></p>
        </div>
      </section>

      <style>{`
        .memberships-page {
          display: grid;
          gap: 3rem;
        }

        .membership-card {
          display: grid;
          gap: 1.25rem;
          padding: 1.75rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
          transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
        }

        .membership-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-hover);
        }

        .membership-card.featured {
          border-color: var(--color-accent-primary);
        }

        .membership-head {
          display: grid;
          gap: 0.8rem;
        }

        .membership-head h2 {
          font-size: 1.6rem;
        }

        .membership-price {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
        }

        .price-main {
          font-size: 3rem;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .price-suffix {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
          font-weight: 700;
        }

        .membership-billing {
          display: grid;
          gap: 0.5rem;
          color: var(--color-text-secondary);
        }

        .membership-billing p {
          line-height: 1.6;
        }

        .fine-print p {
          color: var(--color-text-secondary);
          margin-bottom: 0.4rem;
        }
      `}</style>
    </div>
  );
};

export default MembershipsPage;
