import { Link } from 'react-router-dom';
import { CheckCircle, CalendarClock, ClipboardList } from 'lucide-react';
import { maintenancePlans } from '../data/maintenancePlans';

const planBestFor: Record<string, string> = {
  quarterly: 'Best for families and daily drivers who want predictable upkeep after a Deep Reset service.',
  monthly: 'Best for drivers who want the cleanest ongoing cadence after a Deep Reset service.',
};

const planPricingLine: Record<string, string> = {
  quarterly: 'From $180 every 3 months (equivalent to $60/month)',
  monthly: 'From $120 every month',
};

const MembershipsPage = () => {
  return (
    <div className="page-shell memberships-page">
      <section className="page-hero text-center reveal compact-hero">
        <span className="eyebrow">Maintenance Plans</span>
        <h1 className="hero-title">Keep the vehicle from sliding backward.</h1>
        <p className="hero-subtitle">
          For customers who already have a clean baseline and want predictable upkeep without
          re-deciding every month.
        </p>
      </section>

      <section className="content-card reveal baseline-callout">
        <div className="support-pill"><CalendarClock size={16} /> Baseline required</div>
        <p className="section-copy">
          Maintenance plans assume a clean baseline from a recent Deep Reset
          service. They are for keeping a good vehicle from sliding backward, not
          for fixing a heavily neglected one on the cheap.
        </p>
      </section>

      <div className="card-grid two">
        {maintenancePlans.map((plan, index) => (
          <article
            key={plan.id}
            className={`membership-card reveal ${plan.popular ? 'featured' : ''}`}
            data-reveal-delay={String(index)}
          >
            <div className="membership-head">
              <div className="tier-title-row">
                <h2>{plan.id === 'quarterly' ? 'Quarterly Plan' : 'Monthly Plan'}</h2>
                {plan.popular && <div className="badge-popular tier-badge">Most picked</div>}
              </div>
              <p className="membership-best-for">{planBestFor[plan.id]}</p>
              <div className="membership-pricing-line">{planPricingLine[plan.id]}</div>
              {plan.id === 'monthly' && (
                <p className="membership-support-line">Monthly billing for one maintenance detail each month.</p>
              )}
              {plan.id === 'quarterly' && (
                <p className="membership-support-line">One maintenance detail every 3 months on a lower-commitment schedule.</p>
              )}
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
        <div className="support-pill"><ClipboardList size={16} /> Plan details</div>
        <h2 className="section-title">How it works.</h2>
        <ul className="package-bullets compact-list">
          <li className="feature-row"><CheckCircle size={18} className="icon-lime" /><span className="feature-text">Baseline: we start after a Deep Reset service.</span></li>
          <li className="feature-row"><CheckCircle size={18} className="icon-lime" /><span className="feature-text">Billing: subscriptions run through secure online billing with reminders.</span></li>
          <li className="feature-row"><CheckCircle size={18} className="icon-lime" /><span className="feature-text">Cancel: minimum commitment is 3 months, then cancel anytime.</span></li>
          <li className="feature-row"><CheckCircle size={18} className="icon-lime" /><span className="feature-text">Scope: heavy neglect or long gaps may require a separate reset service.</span></li>
        </ul>
      </section>

      <section className="content-card reveal cta-block">
        <span className="eyebrow">Next Step</span>
        <h2 className="section-title">Ready to keep your vehicle dialed in?</h2>
        <p className="section-copy">
          Plans are joined after a baseline service, so start there if the vehicle still needs its first reset.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary btn-lg">Join Monthly Plan</Link>
          <Link to="/pricing" className="btn secondary">See Detailing Tiers</Link>
        </div>
      </section>

      <style>{`
        .memberships-page {
          display: grid;
          gap: 2.75rem;
        }

        .card-grid.two {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
          align-items: stretch;
        }

        .compact-hero {
          max-width: 820px;
          margin: 0 auto;
        }

        .baseline-callout,
        .cta-block {
          display: grid;
          gap: 1rem;
        }

        .membership-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.6rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base),
            background-color var(--transition-base);
        }

        .membership-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-hover);
        }

        .membership-card.featured {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 88%, var(--color-accent-primary) 12%);
        }

        .membership-head {
          display: grid;
          gap: 0.6rem;
        }

        .membership-badge {
          width: fit-content;
        }

        .membership-head h2 {
          font-size: 1.7rem;
          line-height: 1.2;
        }

        .membership-best-for,
        .membership-support-line,
        .plan-terms-inline p {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .membership-best-for {
          font-size: 0.96rem;
        }

        .membership-pricing-line {
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--color-text-primary);
        }

        .membership-support-line {
          font-size: 0.88rem;
        }

        .compact-list {
          gap: 0.85rem;
        }

        @media (max-width: 768px) {
          .membership-card {
            padding: 1.5rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipsPage;
