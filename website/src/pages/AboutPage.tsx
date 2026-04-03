import { Link } from 'react-router-dom';
import { ArrowRight, Shield, FileText, Cpu, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="page-shell about-page">
      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">ABOUT SIGNALSOURCE</span>
          <h1 className="hero-title">SignalSource is a detailing shop first.</h1>
          <p className="hero-subtitle">
            SignalSource started as a local detailing shop in Oak Harbor. The guides and
            systems came later as secondary tools for people who wanted the same clear,
            organized approach elsewhere.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn primary">See Detailing Services</Link>
          </div>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="content-card reveal">
        <span className="eyebrow">What the business actually does</span>
        <h2 className="section-title">The main local offer is detailing and protection for Whidbey Island drivers.</h2>
        <p className="section-copy">
          The day-to-day work is still{' '}
          <Link to="/detailing" className="accent-text">
            Car Detailing &amp; Protection
          </Link>
          , with the clearest package breakdown on the{' '}
          <Link to="/services" className="accent-text">
            Services page
          </Link>
          . Future services like tint, ceramic coatings, PPF, and wraps are being scoped and
          will appear here only when they&apos;re ready to book.
        </p>
      </section>

      <section className="content-card reveal" data-reveal-delay="1">
        <span className="eyebrow">Why the systems side exists</span>
        <h2 className="section-title">The same structure that keeps a detailing shop tight helps other parts of life too.</h2>
        <p className="section-copy">
          Digital Guides &amp; Playbooks and Systems &amp; Digital Products are secondary
          offers for people who want the same systems mindset applied to moves, money,
          follow-up, and day-to-day admin. If that is what you need, start from the{' '}
          <Link to="/hub" className="accent-text">
            Hub
          </Link>
          , browse the{' '}
          <Link to="/systems/examples/digital-assets" className="accent-text">
            Guides
          </Link>
          , or go straight to{' '}
          <Link to="/systems" className="accent-text">
            Systems
          </Link>
          .
        </p>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Who this is for</span>
          <h2 className="section-title">Built for local drivers first, with secondary tools when they actually help.</h2>
          <p className="section-copy">
            Most local visitors need the detailing side. The digital side is there for families
            planning moves and operators who want tighter follow-up and less admin.
          </p>
        </div>
        <div className="card-grid three">
          {[
            {
              icon: <Shield size={24} />,
              eyebrow: 'Main local offer',
              title: 'Car Detailing & Protection',
              text: 'For Oak Harbor and Whidbey drivers who want clean, protected vehicles and clear scheduling without wasting a day.',
              href: '/services',
              label: 'See detailing services',
            },
            {
              icon: <FileText size={24} />,
              eyebrow: 'Secondary Offer',
              title: 'Digital Guides & Playbooks',
              text: 'For PCS planning, money, and repeat life-admin problems that go smoother with a practical checklist.',
              href: '/systems/examples/digital-assets',
              label: 'Browse guides',
            },
            {
              icon: <Cpu size={24} />,
              eyebrow: 'Secondary Offer',
              title: 'Systems & Digital Products',
              text: 'For operators who want tighter follow-up, simpler dashboards, and less routine admin holding the day together.',
              href: '/systems',
              label: 'Explore systems',
            },
          ].map((item, index) => (
            <article className="content-card surface-card reveal" data-reveal-delay={String(index)} key={item.title}>
              <div className="support-pill">{item.icon}{item.eyebrow}</div>
              <h3>{item.title}</h3>
              <p className="section-copy">{item.text}</p>
              <Link to={item.href} className="cta-row accent-text">
                {item.label} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card reveal">
        <span className="eyebrow">How We Work</span>
        <h2 className="section-title">Clear scope, straightforward pricing, and fewer surprises.</h2>
        <ul className="package-bullets">
          {[
            'One vehicle per day means your appointment gets focused time instead of assembly-line turnover.',
            'Scope and pricing stay clear up front, without upsell games once the work starts.',
            'No fake portfolios, fake screenshots, or padded offers that do not help.',
            'The same systems mindset keeps reminders, follow-up, and communication tight from booking through handoff.',
          ].map((item) => (
            <li className="feature-row" key={item}>
              <CheckCircle size={18} className="icon-lime" />
              <span className="feature-text">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <style>{`
        .about-page {
          display: grid;
          gap: 2.5rem;
        }

        .section-header {
          display: grid;
          gap: 0.8rem;
          margin-bottom: 1.35rem;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
