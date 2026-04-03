import { ChevronLeft, FileText, CheckCircle, Shield, Droplets, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUMROAD_URL = 'https://signaldatasource.gumroad.com';

const pdfs = [
  {
    title: 'Whidbey Navy Spouse PCS-Proof Income Blueprint 2026',
    price: '$39',
    description: 'A clear income plan for Navy spouses at or near NAS Whidbey. Learn how to keep money coming in before, during, and after PCS moves without shady schemes or burning yourself out.',
    icon: <CheckCircle size={20} />,
  },
  {
    title: 'Transitioning Sailor to Civilian Success Blueprint 2026',
    price: '$49',
    description: 'Step-by-step transition map for sailors leaving active duty. Covers timelines, savings targets, networking, and job-hunt routines so you do not drift for 12–18 months after separation.',
    icon: <Shield size={20} />,
  },
  {
    title: 'Global Military Family Relocation & Income Blueprint 2026',
    price: '$59',
    description: 'A relocation and income survival plan for military families moving across states or overseas. Housing, schools, budgeting, side-income options, and a repeatable move workflow.',
    icon: <Droplets size={20} />,
  },
  {
    title: 'AI-Proof Navy Resume Builder 2026',
    price: '$39',
    description: 'A guided resume and LinkedIn framework that translates ratings, quals, and eval bullets into civilian language recruiters and ATS tools actually understand.',
    icon: <FileText size={20} />,
  },
  {
    title: 'Faceless Launch OS – Launch System Guide 2026',
    price: '$67',
    description: 'Launch your faceless digital product in 30 days using a simple operating system and content sprint. Turn scattered ideas into a focused offer, build automated DM funnels, and track every sale in one lightweight system—no personal brand or face-on-camera required.',
    icon: <Package size={20} />,
  },
];

const DigitalAssetsExamples = () => {
  return (
    <div className="page-shell guides-page">
      <Link to="/hub" className="back-link reveal">
        <ChevronLeft size={15} />
        Back to More
      </Link>

      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Digital Guides &amp; Playbooks</span>
          <h1 className="hero-title">Practical guides for moves, money, and transition planning.</h1>
          <p className="hero-subtitle">
            These are secondary products. SignalSource’s main local offer is still Car
            Detailing &amp; Protection for Whidbey Island. The guides are for customers who
            want repeatable frameworks they can download once and keep using.
          </p>
          <div className="hero-actions">
            <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn primary">
              Browse Guides
            </a>
          </div>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Flagship Guides</span>
          <h2 className="section-title">Downloadable frameworks with a concrete use case.</h2>
        </div>
        <div className="card-grid two">
          {pdfs.map((pdf, index) => (
            <article className="guide-card reveal" data-reveal-delay={String(index % 2)} key={pdf.title}>
              <div className="guide-card-top">
                <span className="support-pill">{pdf.icon}{pdf.price}</span>
              </div>
              <h3>{pdf.title}</h3>
              <p className="section-copy">{pdf.description}</p>
              <div className="hero-actions">
                <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn primary">
                  Buy on Gumroad
                </a>
                <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn secondary">
                  View details
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card reveal">
        <div className="support-pill"><Package size={18} /> Bundles</div>
        <h2 className="section-title">Full Military Move &amp; Income Pack 2026</h2>
        <p className="section-copy">
          All four blueprints together: spouse income, sailor transition, global relocation,
          and AI-proof resume building. Built so your family can plan moves, money, and
          civilian life in one place instead of starting from scratch every time.
        </p>
        <div className="hero-actions">
          <a href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" className="btn primary">
            Buy bundle on Gumroad
          </a>
        </div>
      </section>

      <section className="content-card reveal">
        <span className="eyebrow">Why these exist</span>
        <h2 className="section-title">The same systems mindset, just packaged differently.</h2>
        <p className="section-copy">
          The same systems mindset behind the detailing business also shows up here: clear
          steps, fewer dropped balls, less mental load, and no fluff.
        </p>
        <div className="hero-actions">
          <Link to="/detailing" className="btn secondary">Back to detailing</Link>
        </div>
      </section>

      <style>{`
        .guides-page {
          display: grid;
          gap: 2.75rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-secondary);
          font-weight: 700;
          width: fit-content;
        }

        .back-link:hover {
          color: var(--color-accent-primary);
        }

        .guide-card {
          display: grid;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
        }

        .guide-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-hover);
        }

        .guide-card h3 {
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default DigitalAssetsExamples;
