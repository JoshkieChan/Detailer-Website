import { ArrowRight, ArrowDown, MapPin, Search } from 'lucide-react';

const HubPage = () => {
  return (
    <div className="hub-page">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <h1>SignalSource: Systems, Services, and Digital Assets</h1>
        <p className="subtitle">Car care for Oak Harbor. Digital assets and AI systems for anywhere.</p>
        <p className="support-line text-muted">Choose how you want SignalSource to help: local detailing, world-wide guides, or custom-built systems.</p>
        
        <button 
          className="btn-primary mt-6 group"
          onClick={() => {
            document.getElementById('paths-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Explore all options
          <ArrowDown size={18} className="ml-2 group-hover:translate-y-1 transition-transform" />
        </button>
      </section>

      {/* 3-Card Section */}
      <section id="paths-section" className="paths-section">
        <h2 className="sr-only">Choose your path</h2>
        <div className="cards-grid">
          
          {/* Card 1: Car Detailing */}
          <a href="/detailing" className="path-card glass group">
            <div className="card-icon-wrapper">
              <MapPin size={32} className="icon-lime" />
            </div>
            <h3>Car Detailing & Protection</h3>
            <p>Professional detailing, coatings, and protection services in Oak Harbor, WA. Designed for military families, commuters, and anyone who wants their vehicle to look new longer.</p>
            <ul className="mini-features">
              <li>Detailing packages</li>
              <li>Ceramic coatings</li>
              <li>Tint, PPF, and wraps</li>
            </ul>
            <div className="card-cta">
              View local services <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 2: Digital PDFs */}
          <a href="/systems/examples/digital-assets" className="path-card glass group">
            <div className="card-icon-wrapper">
              <Search size={32} className="icon-lime" />
            </div>
            <h3>Digital Guides & Playbooks</h3>
            <p>Downloadable PDFs designed to save you time and stress: checklists, planning guides, and problem-specific playbooks. Built for military, local operators, and anyone who wants clearer systems.</p>
            <div className="card-cta mt-auto">
              Browse PDFs <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 3: Systems & Digital Products */}
          <a href="/systems" className="path-card glass group highlight-border">
            <div className="card-icon-wrapper">
              <div className="badge-lime badge-ai-powered mb-2">AI Powered</div>
              <span className="brand-icon">S</span>
            </div>
            <h3>Systems & Digital Products</h3>
            <p>Custom-built AI systems and digital tools: audits, dashboards, and automations that help local businesses and operators run smoother with less guesswork.</p>
            <div className="card-cta mt-auto">
              Explore systems <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      {/* Deeper Context Sections */}
      <section className="context-sections">
        <div className="context-card glass">
          <h3>For Oak Harbor & NAS Whidbey</h3>
          <p>We provide exclusive, in-person detailing with limited slots to guarantee quality. Trusted by the local and military community to protect your investment.</p>
          <a href="/services" className="btn-secondary mt-4 inline-flex">
            See detailing packages
          </a>
        </div>

        <div className="context-card glass">
          <h3>Digital PDFs & Guides</h3>
          <div className="pdf-mini-list mt-4">
            <div className="pdf-row">
              <div>
                <strong>The Weekend Wash Blueprint</strong>
                <p className="text-sm text-muted">A step-by-step checklist to perfectly wash your car safely at home.</p>
              </div>
              <a href="https://signaldatasource.gumroad.com" target="_blank" rel="noopener noreferrer" className="text-link-lime">Buy now ($15)</a>
            </div>
            <div className="pdf-row">
              <div>
                <strong>Military PCS Cleaning Guide</strong>
                <p className="text-sm text-muted">How to prep your vehicle for a smooth, damage-free transfer.</p>
              </div>
              <a href="https://signaldatasource.gumroad.com" target="_blank" rel="noopener noreferrer" className="text-link-lime">Buy now ($20)</a>
            </div>
            <div className="pdf-row">
              <div>
                <strong>Ceramic Coating Aftercare</strong>
                <p className="text-sm text-muted">Maximize the lifespan of your coating with these core principles.</p>
              </div>
              <a href="https://signaldatasource.gumroad.com" target="_blank" rel="noopener noreferrer" className="text-link-lime">Buy now ($10)</a>
            </div>
            <div className="pdf-row">
              <div>
                <strong>Detailer's Chemical Cheatsheet</strong>
                <p className="text-sm text-muted">Exactly what chemicals to use, when, and on what surfaces safely.</p>
              </div>
              <a href="https://signaldatasource.gumroad.com" target="_blank" rel="noopener noreferrer" className="text-link-lime">Buy now ($15)</a>
            </div>
            <p className="text-xs text-muted mt-2">Payments are securely handled off-site via Gumroad.</p>
          </div>
        </div>

        <div className="context-card glass">
          <h3>AI Systems & Custom Builds</h3>
          <p>SignalSource builds automated tools that remove daily friction. Examples include:</p>
          <ul className="bullet-list mt-3 mb-4">
            <li>Medical Audit Systems</li>
            <li>Opportunity Scanners</li>
            <li>Creator Action Feeds</li>
          </ul>
          <a href="/about#contact" className="btn-secondary inline-flex">
            Request a custom system
          </a>
        </div>
      </section>

      <style>{`
        .hub-page { padding: 5rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        
        /* Hero */
        .hero-section { margin-bottom: 5rem; animation: fadeIn 0.8s ease-out; }
        .hero-section h1 { font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; }
        .subtitle { font-size: 1.5rem; color: var(--color-text-main); font-weight: 600; margin-bottom: 0.5rem; }
        .support-line { font-size: 1.2rem; }
        
        /* Cards */
        .paths-section { margin-bottom: 5rem; }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        
        .path-card { 
          display: flex; flex-direction: column; padding: 2.5rem; border-radius: var(--radius-lg);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          position: relative; text-decoration: none; color: inherit;
        }
        .path-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(158, 255, 0, 0.08);
          border-color: rgba(158, 255, 0, 0.4);
        }
        
        .card-icon-wrapper { margin-bottom: 1.5rem; position: relative; display: inline-flex; }
        .brand-icon { background: var(--color-accent-lime); color: #000; font-weight: 800; font-size: 1.25rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        
        .path-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: #fff; }
        .path-card p { color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem; }
        
        .mini-features { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
        .mini-features li { position: relative; padding-left: 1.25rem; font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
        .mini-features li::before { content: "→"; position: absolute; left: 0; color: var(--color-accent-lime); }
        
        .card-cta { display: flex; align-items: center; color: var(--color-accent-lime); font-weight: 700; font-size: 0.95rem; margin-top: auto; }
        
        .highlight-border { border: 1px solid rgba(158, 255, 0, 0.3); background: rgba(158, 255, 0, 0.02); }
        .badge-lime { display: inline-block; background: var(--color-accent-lime); color: #000; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .badge-ai-powered { position: absolute; top: -12px; right: -12px; font-size: 0.7rem; }

        /* Context Sections */
        .context-sections { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-top: 4rem; }
        .context-card { padding: 2.5rem; border-radius: var(--radius-lg); }
        .context-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: var(--color-accent-lime); }
        .context-card p { color: var(--color-text-muted); line-height: 1.6; }
        
        .bullet-list { padding-left: 1.25rem; color: var(--color-text-muted); }
        .bullet-list li { margin-bottom: 0.5rem; }
        
        .pdf-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--color-border); }
        .pdf-row:last-of-type { border-bottom: none; }
        .text-link-lime { color: var(--color-accent-lime); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; white-space: nowrap; margin-left: 1rem; }
        .text-link-lime:hover { border-bottom-color: var(--color-accent-lime); }

        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: 1fr; }
          .hero-section h1 { font-size: 2.5rem; }
          .pdf-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .text-link-lime { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default HubPage;
