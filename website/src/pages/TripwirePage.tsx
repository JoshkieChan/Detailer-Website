import { ChevronRight, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUMROAD_URL = 'https://signaldatasource.gumroad.com';

const TripwirePage = () => {
  return (
    <div className="page-shell tripwire-page">
      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Your 1-Page Snapshot is on the way</span>
          <h1 className="hero-title">Wait! Before you check your inbox...</h1>
          <p className="hero-subtitle">
            The Snapshot tells you <em>where</em> you are. But if you already know you are 
            drowning in bills and debt, you need a system to <em>get out</em>.
          </p>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <div className="card-grid two">
        <section className="guide-card reveal">
          <div className="guide-card-top">
            <span className="support-pill"><TrendingUp size={18} /> $47</span>
          </div>
          <h3>Debt &amp; Bills Dashboard 2026</h3>
          <p className="section-copy">
            The same one-page snapshot system, but with the full pay-down engine. 
            Stop avoidance and anxiety by knowing exactly what to pay next, 
            identifying hidden subscriptions, and seeing your "freedom date" move closer 
            every month.
          </p>
          <div className="hero-actions">
            <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn primary">
              Get the Dashboard
              <ChevronRight size={16} />
            </a>
          </div>
        </section>

        <section className="guide-card highlight reveal" data-reveal-delay="1">
          <div className="guide-card-top">
            <span className="support-pill badge-primary"><Package size={18} /> $147</span>
          </div>
          <h3>Digital Life &amp; Income Pack 2026</h3>
          <span className="tier-badge">Best Value - 30% Savings</span>
          <p className="section-copy">
            The ultimate systems restart. Get the <strong>Debt &amp; Bills Dashboard 2026</strong>, 
            the <strong>2026 Overwhelm Reset</strong>, <strong>2026 Work Pivot Blueprint</strong>, 
            and <strong>Faceless Launch OS</strong> together.
          </p>
          <div className="hero-actions">
            <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn primary btn-lg">
              Get the Full Bundle
              <ChevronRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <section className="container reveal tripwire-footer">
        <p className="section-copy text-center">
          <Link to="/systems/examples/digital-assets" className="btn secondary">
            No thanks, just take me to the guides
          </Link>
        </p>
      </section>

      <style>{`
        .tripwire-page {
          display: grid;
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .guide-card.highlight {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 94%, var(--color-accent-primary) 6%);
          box-shadow: 0 0 40px rgba(163, 230, 53, 0.1);
        }

        .tripwire-footer {
          margin-top: 2rem;
        }

        .text-center {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default TripwirePage;
