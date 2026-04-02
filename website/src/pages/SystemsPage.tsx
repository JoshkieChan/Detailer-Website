import { Sparkles, Brain, Lightbulb, Zap, MessageSquare, ArrowUpRight } from 'lucide-react';

/* ── Use-case data ───────────────────────────────────────────────────────── */
const CASES = [
  {
    title: 'Local Booking Brain',
    description: 'AI-powered intake and booking pipeline for a detailing shop. Captures leads, qualifies inquiries, and answers scheduling questions 24/7.',
    tag: 'Local Systems',
    color: '#4ade80',
    emoji: '🗓️',
  },
  {
    title: 'PCS Income Tracker & Plan Board',
    description: 'Kanban-style board that tracks your PCS-proof income ideas, commitments, and progress so you’re never starting from zero at the next set of orders.',
    tag: 'Life & Logistics',
    color: '#60a5fa',
    emoji: '📋',
  },
  {
    title: 'Opportunity Scanner',
    description: 'Scans markets, job boards, or lead sources on a schedule and surfaces the highest-signal opportunities in a clean daily digest.',
    tag: 'Intelligence Tools',
    color: '#f59e0b',
    emoji: '🔎',
  },
  {
    title: 'Creator Content Feed',
    description: 'Aggregates posts, analytics, and action items from every platform you publish on — one feed, one priority list, every morning.',
    tag: 'Creator Tools',
    color: '#e879f9',
    emoji: '📡',
  },
  {
    title: 'Military Move Prep Board',
    description: 'Task and reminder system built around a PCS timeline: housing deadlines, vehicle prep windows, school enrollment, and base access.',
    tag: 'Life & Logistics',
    color: '#34d399',
    emoji: '🎖️',
  },
  {
    title: 'Transition Application & Interview Tracker',
    description: 'A simple pipeline for tracking which roles you’ve applied to, interviews scheduled, follow-ups, and offers, so your civilian job hunt doesn’t live in your head.',
    tag: 'Back-office Automation',
    color: '#fb923c',
    emoji: '👔',
  },
  {
    title: 'Client Follow-Up Sequencer',
    description: 'Sends timed, personalized follow-up messages after service completion to collect reviews, offer rebooking, and reduce churn.',
    tag: 'Back-office Automation',
    color: '#a78bfa',
    emoji: '💬',
  },
  {
    title: 'Review & Reputation Autopilot',
    description: 'Monitors incoming reviews across platforms, drafts responses, and flags negative reviews for urgent attention — all automatically.',
    tag: 'Back-office Automation',
    color: '#38bdf8',
    emoji: '⭐',
  },
  {
    title: 'Local Launch Checklist System',
    description: 'A structured launch tracker for opening a new local service business: licensing, marketing, soft-open logistics, and community outreach.',
    tag: 'Life & Logistics',
    color: '#f472b6',
    emoji: '🚀',
  },
];

const SystemsPage = () => {
  return (
    <div className="sp-page">

      {/* ── Hero ────────────────────────────────────── */}
      <div className="sp-hero text-center">
        <div className="sp-badge">Custom Builds</div>
        <h1>Systems & Digital Products</h1>
        <p className="sp-subtitle">
          AI-powered local systems, audits, and custom digital tools designed to remove
          friction from your day-to-day operations.
        </p>
      </div>

      {/* ── Use-Case Gallery ────────────────────────── */}
      <section className="sp-gallery">
        <div className="sp-gallery-header">
          <h2>Example Systems & Use Cases</h2>
          <p className="sp-gallery-sub">
            Here's how SignalSource-style systems can actually show up in your world.
            These are examples and placeholders you can eventually click into.
          </p>
        </div>

        <div className="sp-grid">
          {CASES.map((c) => (
            <article key={c.title} className="sp-tile">
              {/* thumbnail */}
              <div className="sp-thumb" style={{ '--thumb-color': c.color } as React.CSSProperties}>
                <span className="sp-thumb-emoji">{c.emoji}</span>
              </div>

              <div className="sp-tile-body">
                <h3 className="sp-tile-title">{c.title}</h3>
                <p className="sp-tile-desc">{c.description}</p>
                <span className="sp-tag">{c.tag}</span>
              </div>

              <div className="sp-tile-footer">
                <a href="#" className="sp-tile-link" aria-label={`View details for ${c.title} (coming soon)`}>
                  View details
                  <ArrowUpRight size={13} className="sp-tile-link-icon" />
                  <span className="sp-coming-soon">coming soon</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Intelligent Setup & Automations ─────────── */}
      <div className="product-section glass highlight-border text-left mx-auto mb-12">
        <div className="section-icon">
          <Brain size={40} className="icon-lime" />
        </div>
        <div className="section-content">
          <div className="exclusive-badge">Private Build</div>
          <h2>Intelligent Setup & Automations</h2>
          <p className="section-intro">
            Custom automated systems built for local service businesses and solo operators
            seeking scale without adding headcount.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <Zap size={20} className="icon-lime" />
              <div>
                <h4>Local Booking Systems</h4>
                <p>24/7 AI assistants that capture leads, qualify inquiries, and handle repetitive scheduling questions while you're focused on the actual work.</p>
              </div>
            </div>
            <div className="feature-item">
              <Sparkles size={20} className="icon-lime" />
              <div>
                <h4>Medical Audit Systems</h4>
                <p>Data-driven audit dashboards custom-built to ingest metrics and output cleanly organized evaluation frameworks.</p>
              </div>
            </div>
            <div className="feature-item">
              <Lightbulb size={20} className="icon-lime" />
              <div>
                <h4>Opportunity Scanners & Action Feeds</h4>
                <p>A back-end "brain" that monitors leads, aggregates your creator content, or scours specific markets tailored to your tech stack.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How It Works ────────────────────────────── */}
      <section className="concierge-box glass mb-6">
        <div className="concierge-content">
          <div className="icon-wrapper mb-2">
            <MessageSquare size={32} className="icon-lime" />
          </div>
          <h2>How It Works</h2>
          <p className="mb-2">
            Need a specific daily routine optimized or a complex business bottleneck
            removed? I design and build fully tailored systems for any organizational outcome.
          </p>
          <p className="concierge-pricing-note">
            Projects are quoted case by case; simple automations are typically in the low
            hundreds, while complex, multi-step systems cost more.
          </p>
          <div className="concierge-steps">
            <div className="step">
              <span className="step-num">1</span>
              <p>DM or email me a description of the specific operational bottleneck.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <p>I'll reply with clarifying questions and a flat-rate quote for that specific build.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <p>I build it, you use it. No ongoing maintenance required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Outcomes ────────────────────────────────── */}
      <section className="outcome-section text-center">
        <Lightbulb size={48} className="icon-lime mb-2" />
        <h2>Solving Problems, Not Just Selling Features</h2>
        <p className="outcome-text">
          My goal isn't to give you more software to manage. It's to deliver tangible results
          that change how your workflow feels:
        </p>
        <div className="outcome-grid mb-4">
          <div className="outcome-card">
            <h4>Less mental overhead</h4>
            <p>Know exactly what needs to happen next without thinking about it.</p>
          </div>
          <div className="outcome-card">
            <h4>Fewer dropped balls</h4>
            <p>Leads and customers never fall through the cracks of a manual process.</p>
          </div>
          <div className="outcome-card">
            <h4>Focus on real work</h4>
            <p>Spend your energy on high-value tasks instead of fighting with admin.</p>
          </div>
        </div>
        <p className="outcome-contact-note">
          When you're ready, you can DM or email me with what you're trying to fix. My
          contact details are in the footer section below.
        </p>
      </section>

      <style>{`
        /* ── Page shell ─────────────────────────── */
        .sp-page { padding: 4rem 1.5rem 7rem; max-width: 1200px; margin: 0 auto; }

        /* ── Hero ───────────────────────────────── */
        .sp-hero { margin-bottom: 5rem; }
        .sp-badge { display: inline-block; background: var(--color-accent-lime); color: #000; padding: 0.35rem 1rem; border-radius: 4px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
        .sp-hero h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: 900; margin-bottom: 1.25rem; color: var(--color-text-main); }
        .sp-subtitle { font-size: 1.2rem; color: var(--color-text-muted); max-width: 680px; margin: 0 auto; line-height: 1.65; }

        /* ── Gallery header ─────────────────────── */
        .sp-gallery { margin-bottom: 5rem; }
        .sp-gallery-header { text-align: center; margin-bottom: 3.5rem; }
        .sp-gallery-header h2 { font-size: clamp(1.6rem, 3vw, 2.25rem); font-weight: 900; color: var(--color-text-main); margin-bottom: 0.9rem; }
        .sp-gallery-sub { font-size: 1rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }

        /* ── 3-col grid ─────────────────────────── */
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) { .sp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .sp-grid { grid-template-columns: 1fr; } }

        /* ── Tile card ──────────────────────────── */
        .sp-tile {
          display: flex;
          flex-direction: column;
          background: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .sp-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.2);
          border-color: rgba(158,255,0,0.25);
        }

        /* colored thumbnail */
        .sp-thumb {
          height: 88px;
          background: linear-gradient(135deg, var(--thumb-color, #4ade80) 0%, rgba(0,0,0,0.35) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sp-thumb-emoji { font-size: 2.5rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }

        /* tile body */
        .sp-tile-body { padding: 1.25rem 1.25rem 0.75rem; flex: 1; }
        .sp-tile-title { font-size: 1rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 0.5rem; line-height: 1.3; }
        .sp-tile-desc { font-size: 0.86rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 0.85rem; }
        .sp-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--color-accent-lime);
          background: rgba(158,255,0,0.08);
          border: 1px solid rgba(158,255,0,0.2);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
        }

        /* tile footer */
        .sp-tile-footer {
          padding: 0.75rem 1.25rem 1rem;
          border-top: 1px solid var(--color-border);
        }
        .sp-tile-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color 0.18s;
        }
        .sp-tile-link:hover { color: var(--color-accent-lime); }
        .sp-tile-link-icon { opacity: 0.6; }
        .sp-coming-soon {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          opacity: 0.45;
          margin-left: 0.15rem;
        }

        /* ── Existing sections ──────────────────── */
        .product-section { padding: 3.5rem; border-radius: var(--radius-lg); position: relative; display: flex; flex-direction: column; width: 100%; margin-bottom: 3rem; }
        .highlight-border { border: 2px solid var(--color-accent-lime); background: rgba(158,255,0,0.03); }
        .section-icon { margin-bottom: 2rem; }
        .exclusive-badge { color: var(--color-accent-lime); font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.5rem; }
        .section-content h2 { font-size: 2.25rem; font-weight: 900; line-height: 1.1; margin-bottom: 1rem; }
        .section-intro { font-size: 1.1rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 2.5rem; }
        .feature-list { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 1rem; }
        .feature-item { display: flex; gap: 1.25rem; align-items: flex-start; }
        .feature-item h4 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--color-text-main); }
        .feature-item p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; }

        .concierge-box { padding: 4rem; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(158,255,0,0.2); background: radial-gradient(circle at top right, rgba(158,255,0,0.05) 0%, transparent 50%); }
        .concierge-box h2 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem; color: var(--color-text-main); }
        .concierge-pricing-note { font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 2rem; }
        .concierge-steps { display: flex; justify-content: center; gap: 3rem; margin-top: 3rem; text-align: left; }
        .step { flex: 1; max-width: 250px; }
        .step-num { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--color-accent-lime); color: #000; border-radius: 50%; font-weight: 900; margin-bottom: 1rem; }
        .step p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; font-weight: 500; }

        .outcome-section { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
        .outcome-section h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; color: var(--color-text-main); }
        .outcome-text { font-size: 1.2rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 3rem; }
        .outcome-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; text-align: left; }
        .outcome-card h4 { color: var(--color-accent-lime); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; }
        .outcome-card p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; }
        .outcome-contact-note { font-size: 1.05rem; font-weight: 500; color: var(--color-text-muted); }

        @media (max-width: 900px) {
          .concierge-steps { flex-direction: column; align-items: center; gap: 2rem; }
          .step { max-width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; }
          .step-num { margin: 0 auto 1rem; }
          .outcome-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .product-section, .concierge-box { padding: 2.5rem; }
        }
        @media (max-width: 480px) {
          .outcome-section h2 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default SystemsPage;
