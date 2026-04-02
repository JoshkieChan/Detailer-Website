import { Link } from 'react-router-dom';
import { ArrowRight, Shield, FileText, Cpu, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="page-shell about-page">
      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">About SignalSource</span>
          <h1 className="hero-title">SignalSource is a detailing shop first.</h1>
          <p className="hero-subtitle">
            The business started in Oak Harbor to solve one simple problem: deliver clean,
            reliable detailing without the chaos that usually comes with booking local
            services.
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
          The systems, playbooks, and digital tools came after that, not before. The car care
          side of the business is still the day-to-day work.
        </p>
      </section>

      <section className="content-card reveal" data-reveal-delay="1">
        <span className="eyebrow">Why the systems side exists</span>
        <h2 className="section-title">The same structure that keeps a detailing shop tight helps other parts of life too.</h2>
        <p className="section-copy">
          The same structure that keeps a detailing business tight also helps families and
          operators handle moves, money, follow-up, and day-to-day admin with less friction.
        </p>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">What You Can Get</span>
          <h2 className="section-title">Three offers, one systems mindset.</h2>
        </div>
        <div className="card-grid three">
          {[
            {
              icon: <Shield size={24} />,
              eyebrow: 'Primary Service',
              title: 'Car Detailing & Protection',
              text: 'In-person detailing and protection work in Oak Harbor, built for people who care about their vehicles and their time.',
              href: '/services',
              label: 'See detailing packages',
            },
            {
              icon: <FileText size={24} />,
              eyebrow: 'Secondary Offer',
              title: 'Digital Guides & Playbooks',
              text: 'Downloadable frameworks for PCS planning, transition prep, and practical planning problems that keep repeating.',
              href: '/systems/examples/digital-assets',
              label: 'Browse guides',
            },
            {
              icon: <Cpu size={24} />,
              eyebrow: 'Secondary Offer',
              title: 'Systems & Digital Products',
              text: 'Custom setups that help operators manage follow-up, dashboards, reminders, and routine admin with less friction.',
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
        <h2 className="section-title">Clear scope, straightforward pricing, and repeatable service.</h2>
        <ul className="package-bullets">
          {[
            'We sell outcomes: less stress before inspection, fewer dropped balls during PCS, and cleaner day-to-day operations.',
            'We do not sell anything we would not use ourselves or recommend to family.',
            'No fake screenshots, no fake car portfolios, and no tools that secretly cost more than they help.',
            'Car detailing jobs are taken one vehicle at a time, by appointment only. The guides and systems follow the same logic: one real problem at a time.',
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
      `}</style>
    </div>
  );
};

export default AboutPage;
