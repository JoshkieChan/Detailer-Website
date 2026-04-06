import { Link } from 'react-router-dom';
import { CalendarCheck, PlusCircle, ShieldCheck, ClipboardList } from 'lucide-react';
import { servicePackages } from '../data/packages';

const ServicesPage = () => {
  return (
    <div className="page-shell services-page">
      <section className="page-hero text-center reveal compact-hero">
        <div className="capacity-banner inline-block">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
        <span className="eyebrow">Detailing / Services</span>
        <h1 className="hero-title">Two clear detailing tiers for Whidbey Island vehicles.</h1>
        <p className="hero-subtitle">
          Here&apos;s the full menu of detailing tiers and how the 20% deposit works.
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
            Start here. If you need extras like engine bay cleaning or severe pet hair, mention it in your booking notes.
            We&apos;ll review your photos and confirm any additional cost before we start.
          </p>
        </div>

        <div className="card-grid two">
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

              <Link to={`/booking?package=${pkg.id}`} className={`btn ${pkg.highlight ? 'primary' : 'secondary'} w-full`}>
                {`Book ${pkg.title}`}
              </Link>
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
          The configurator lets you pick a tier and see today&apos;s deposit before you book.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary btn-lg">Configure Your Detail</Link>
          <Link to="/detailing" className="btn secondary">See Detailing Overview</Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
