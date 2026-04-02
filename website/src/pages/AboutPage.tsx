import { ArrowRight, Shield, FileText, Cpu, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="about-page">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ab-hero text-center">
        <h1>Systems-Driven Car Care, Built in Oak Harbor</h1>
        <p className="ab-hero-sub">
          SignalSource started as a way to keep one detailing shop from drowning in chaos—and
          grew into guides and systems for people who want their cars, money, and moves to
          feel under control.
        </p>
      </section>

      {/* ── Primary Service ──────────────────────────────── */}
      <section className="ab-section glass ab-primary">
        <div className="ab-section-label">Primary Service</div>
        <h2>Our Main Work: Detailing &amp; Protection</h2>
        <p>
          SignalSource's day-to-day business is hands-on car detailing and protection for the
          Oak Harbor and NAS Whidbey community. We handle interior and exterior details,
          paint decontamination, protective sealants, and ceramic coatings—all booked by
          appointment at our Garage Studio or at your door via mobile service.
        </p>
        <p>
          Every service is designed around one goal: your vehicle looks sharp, stays
          protected against PNW elements, and your time is not wasted. That's it.
        </p>
        <Link to="/services" className="ab-btn-primary">
          View detailing services <ArrowRight size={16} className="ab-btn-icon" />
        </Link>
      </section>

      {/* ── Why the guides & systems exist ──────────────── */}
      <section className="ab-section ab-why">
        <h2>Why There Are Guides and Systems Here</h2>
        <div className="ab-why-body">
          <p>
            Running a small detailing operation means building checklists for every job,
            scripts for following up with customers, and processes that survive the days
            when everything goes sideways. Those systems weren't optional—they were the
            difference between a shop that grew and one that burned out.
          </p>
          <p>
            Once those tools existed, military families and transitioning sailors kept asking
            for the same kind of structure—applied to income, PCS moves, and career changes.
            That became the <strong>Digital Guides &amp; Playbooks</strong>: downloadable
            blueprints built around real military-life problems, not generic advice.
          </p>
          <p>
            Some people needed more than a PDF—they needed someone to actually build
            the thing. So <strong>Systems &amp; Digital Products</strong> were added: done-for-you
            setups using tools you already have access to, designed to reduce mental load
            without enrolling you in another monthly subscription.
          </p>
        </div>
      </section>

      {/* ── 3-column What You Can Get ────────────────────── */}
      <section className="ab-offers">
        <h2 className="ab-offers-heading text-center">What You Can Get From SignalSource</h2>
        <div className="ab-offers-grid">

          <div className="ab-offer-card glass ab-offer-primary">
            <div className="ab-offer-icon"><Shield size={28} /></div>
            <div className="ab-offer-eyebrow">Primary Service</div>
            <h3>Car Detailing &amp; Protection</h3>
            <p>
              In-person detailing and protection work in Oak Harbor, built for people who
              care about their vehicles and their time.
            </p>
            <Link to="/services" className="ab-offer-link">
              See detailing packages <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ab-offer-card glass">
            <div className="ab-offer-icon"><FileText size={28} /></div>
            <div className="ab-offer-eyebrow">Digital Download</div>
            <h3>Digital Guides &amp; Playbooks</h3>
            <p>
              Downloadable blueprints for real problems: PCS-proof income, military relocation
              planning, and turning Navy experience into civilian-friendly resumes.
            </p>
            <Link to="/systems/examples/digital-assets" className="ab-offer-link">
              Browse guides <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ab-offer-card glass">
            <div className="ab-offer-icon"><Cpu size={28} /></div>
            <div className="ab-offer-eyebrow">Custom Builds</div>
            <h3>Systems &amp; Digital Products</h3>
            <p>
              Custom setups that help you manage bookings, moves, income, and follow-ups
              using simple tools you already have—without hidden software costs.
            </p>
            <Link to="/systems" className="ab-offer-link">
              Explore systems <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* ── Values ───────────────────────────────────────── */}
      <section className="ab-section glass ab-values">
        <h2>How We Think About Profit and People</h2>
        <ul className="ab-values-list">
          <li>
            <CheckCircle size={20} className="ab-check" />
            <span>
              We sell outcomes—less stress before inspection, fewer dropped balls during
              PCS, and clearer paths into civilian life—not just features.
            </span>
          </li>
          <li>
            <CheckCircle size={20} className="ab-check" />
            <span>
              We won't sell anything we wouldn't use ourselves or recommend to family.
            </span>
          </li>
          <li>
            <CheckCircle size={20} className="ab-check" />
            <span>
              No fake screenshots, no "guaranteed" earnings, no tools that secretly cost
              you more to run than they make.
            </span>
          </li>
          <li>
            <CheckCircle size={20} className="ab-check" />
            <span>
              Car detailing jobs are taken one vehicle at a time, by appointment only.
              The guides and systems are built the same way: one real problem at a time.
            </span>
          </li>
        </ul>
      </section>

      <style>{`
        /* ── Page shell ─────────────────────────────────── */
        .about-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 4rem 1.5rem 7rem;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        /* ── Hero ───────────────────────────────────────── */
        .ab-hero { }
        .ab-hero h1 {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 900;
          line-height: 1.1;
          color: var(--color-text-main);
          margin-bottom: 1.5rem;
        }
        .ab-hero-sub {
          font-size: 1.2rem;
          color: var(--color-text-muted);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Section base ───────────────────────────────── */
        .ab-section {
          border-radius: var(--radius-lg);
          padding: 3rem;
        }
        .ab-section h2 {
          font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 900;
          color: var(--color-text-main);
          margin-bottom: 1.25rem;
          line-height: 1.2;
        }
        .ab-section p {
          font-size: 1.05rem;
          color: var(--color-text-muted);
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }
        .ab-section p:last-of-type { margin-bottom: 0; }
        .ab-section p strong { color: var(--color-text-main); font-weight: 700; }

        .ab-section-label {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-accent-lime);
          margin-bottom: 0.75rem;
        }

        /* ── Primary service card ───────────────────────── */
        .ab-primary { border-top: 3px solid var(--color-accent-lime); }

        .ab-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-accent-lime);
          color: #000;
          font-weight: 800;
          font-size: 0.9rem;
          border-radius: 8px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .ab-btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
        .ab-btn-icon { flex-shrink: 0; }

        /* ── Why section ────────────────────────────────── */
        .ab-why { background: transparent; padding-left: 0; padding-right: 0; }
        .ab-why h2 { color: var(--color-text-main); }
        .ab-why-body { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── Offers grid ────────────────────────────────── */
        .ab-offers-heading {
          font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 900;
          color: var(--color-text-main);
          margin-bottom: 2.5rem;
        }
        .ab-offers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }
        @media (max-width: 860px) { .ab-offers-grid { grid-template-columns: 1fr; } }

        .ab-offer-card {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-radius: 14px;
          border: 1px solid var(--color-border);
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
        }
        .ab-offer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.16);
          border-color: rgba(158,255,0,0.3);
        }
        .ab-offer-primary { border-top: 2px solid var(--color-accent-lime); }

        .ab-offer-icon {
          width: 48px;
          height: 48px;
          background: rgba(158,255,0,0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-lime);
          margin-bottom: 1.25rem;
        }
        .ab-offer-eyebrow {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--color-accent-lime);
          margin-bottom: 0.5rem;
        }
        .ab-offer-card h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-text-main);
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .ab-offer-card p {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          line-height: 1.65;
          flex-grow: 1;
          margin-bottom: 1.5rem;
        }
        .ab-offer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-accent-lime);
          text-decoration: none;
          margin-top: auto;
          transition: gap 0.2s;
        }
        .ab-offer-link:hover { gap: 0.6rem; }

        /* ── Values ─────────────────────────────────────── */
        .ab-values h2 { margin-bottom: 2rem; }
        .ab-values-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ab-values-list li {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          font-size: 1.05rem;
          color: var(--color-text-muted);
          line-height: 1.65;
        }
        .ab-check {
          color: var(--color-accent-lime);
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ── Mobile padding ─────────────────────────────── */
        @media (max-width: 640px) {
          .ab-section { padding: 2rem 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
