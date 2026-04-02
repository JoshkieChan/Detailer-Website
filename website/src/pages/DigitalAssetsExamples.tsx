import { ChevronLeft, FileText, CheckCircle, Shield, Droplets, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUMROAD_URL = 'https://signaldatasource.gumroad.com';

const pdfs = [
  {
    title: 'The Weekend Wash Blueprint',
    price: '$15',
    description:
      'A step-by-step checklist to perfectly wash your car at home without scratching the paint. Includes product recommendations and the exact order of operations.',
    icon: <Droplets size={22} />,
    link: GUMROAD_URL,
  },
  {
    title: 'Military PCS Cleaning Guide',
    price: '$20',
    description:
      'How to prep your vehicle for a smooth, damage-free transfer. Essential for military families shipping vehicles or handing off a car at inspection.',
    icon: <CheckCircle size={22} />,
    link: GUMROAD_URL,
  },
  {
    title: 'Ceramic Coating Aftercare',
    price: '$10',
    description:
      'Maximize the lifespan of your coating with these core principles. Know exactly what chemicals to avoid and how to maintain the hydrophobic layer long-term.',
    icon: <Shield size={22} />,
    link: GUMROAD_URL,
  },
  {
    title: "Detailer's Chemical Cheatsheet",
    price: '$15',
    description:
      'Exactly what chemicals to use, when, and on what surfaces safely. A quick-reference guide to avoid costly mistakes on sensitive interior and exterior trims.',
    icon: <FileText size={22} />,
    link: GUMROAD_URL,
  },
];

const DigitalAssetsExamples = () => {
  return (
    <div className="dg-page">
      {/* ── Top navigation ── */}
      <div className="dg-container">
        <Link to="/hub" className="dg-back-link">
          <ChevronLeft size={15} />
          Back to Hub
        </Link>

        {/* ── Hero ── */}
        <header className="dg-hero">
          <h1>Digital Guides & Playbooks</h1>
          <p className="dg-subheading">
            Practical, outcome-focused checklists and frameworks. Download once,
            reference forever.
          </p>
        </header>

        {/* ── Product grid ── */}
        <div className="dg-grid">
          {pdfs.map((pdf) => (
            <article key={pdf.title} className="dg-card">
              {/* card top row: icon + price */}
              <div className="dg-card-top">
                <span className="dg-icon">{pdf.icon}</span>
                <span className="dg-price">{pdf.price}</span>
              </div>

              <h3 className="dg-card-title">{pdf.title}</h3>
              <p className="dg-card-desc">{pdf.description}</p>

              <div className="dg-card-actions">
                <a
                  href={pdf.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dg-btn-primary"
                >
                  Buy on Gumroad
                </a>
                <a
                  href={pdf.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dg-link-secondary"
                >
                  View details →
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* ── Bundles section ── */}
        <section className="dg-bundles-section">
          <h2 className="dg-section-label">Bundles & Packs</h2>
          <article className="dg-bundle-card">
            <div className="dg-bundle-inner">
              <div className="dg-bundle-icon">
                <Package size={28} />
              </div>
              <div className="dg-bundle-content">
                <div className="dg-bundle-top">
                  <h3 className="dg-bundle-title">Complete Car Care Operator Pack</h3>
                  <span className="dg-bundle-price">$49</span>
                </div>
                <p className="dg-bundle-desc">
                  All four guides together — wash blueprint, PCS cleaning, ceramic aftercare, and
                  chemical cheatsheet — in one bundle. Best value if you plan to detail
                  regularly or run a small operation.
                </p>
                <div className="dg-card-actions">
                  <a
                    href={GUMROAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dg-btn-primary"
                  >
                    Buy bundle on Gumroad
                  </a>
                  <a
                    href={GUMROAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dg-link-secondary"
                  >
                    View details →
                  </a>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>

      <style>{`
        /* ─── Page shell ─────────────────────────── */
        .dg-page {
          min-height: 100vh;
          padding: 4rem 1.5rem 7rem;
        }
        .dg-container {
          max-width: 1040px;
          margin: 0 auto;
        }

        /* ─── Back link ──────────────────────────── */
        .dg-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-decoration: none;
          opacity: 0.65;
          margin-bottom: 3rem;
          transition: opacity 0.2s, color 0.2s;
        }
        .dg-back-link:hover { opacity: 1; color: var(--color-accent-lime); }

        /* ─── Hero ───────────────────────────────── */
        .dg-hero {
          margin-bottom: 3.5rem;
          text-align: center;
        }
        .dg-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          color: var(--color-text-main);
          margin-bottom: 1rem;
          line-height: 1.1;
        }
        .dg-subheading {
          font-size: 1.1rem;
          color: var(--color-text-muted);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ─── Product grid ───────────────────────── */
        .dg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 680px) {
          .dg-grid { grid-template-columns: 1fr; }
        }

        /* ─── Product card ───────────────────────── */
        .dg-card {
          display: flex;
          flex-direction: column;
          background: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 2rem;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .dg-card:hover {
          transform: translateY(-4px);
          border-color: rgba(158, 255, 0, 0.35);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
        }

        .dg-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .dg-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(158, 255, 0, 0.1);
          border-radius: 10px;
          color: var(--color-accent-lime);
        }
        .dg-price {
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--color-accent-lime);
          letter-spacing: -0.5px;
        }

        .dg-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-text-main);
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .dg-card-desc {
          font-size: 0.92rem;
          color: var(--color-text-muted);
          line-height: 1.65;
          flex-grow: 1;
          margin-bottom: 0;
        }

        /* ─── CTA area ───────────────────────────── */
        .dg-card-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }
        .dg-btn-primary {
          display: block;
          text-align: center;
          padding: 0.75rem 1rem;
          background: var(--color-accent-lime);
          color: #000;
          font-weight: 800;
          font-size: 0.9rem;
          border-radius: 8px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .dg-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        .dg-link-secondary {
          display: block;
          text-align: center;
          font-size: 0.82rem;
          color: var(--color-text-muted);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .dg-link-secondary:hover { color: var(--color-accent-lime); }

        /* ─── Bundles section ────────────────────── */
        .dg-bundles-section {
          margin-top: 1rem;
        }
        .dg-section-label {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }

        .dg-bundle-card {
          background: var(--color-bg-alt);
          border: 1px solid rgba(158, 255, 0, 0.25);
          border-radius: 16px;
          padding: 2rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .dg-bundle-card:hover {
          border-color: rgba(158, 255, 0, 0.5);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
        }
        .dg-bundle-inner {
          display: flex;
          gap: 1.75rem;
          align-items: flex-start;
        }
        .dg-bundle-icon {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          background: rgba(158, 255, 0, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-lime);
          margin-top: 0.25rem;
        }
        .dg-bundle-content { flex: 1; }
        .dg-bundle-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .dg-bundle-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--color-text-main);
          line-height: 1.25;
        }
        .dg-bundle-price {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--color-accent-lime);
          white-space: nowrap;
        }
        .dg-bundle-desc {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          line-height: 1.65;
          margin-bottom: 0;
        }

        @media (max-width: 600px) {
          .dg-bundle-inner { flex-direction: column; gap: 1.25rem; }
          .dg-bundle-top { flex-direction: column; gap: 0.25rem; }
        }
      `}</style>
    </div>
  );
};

export default DigitalAssetsExamples;
