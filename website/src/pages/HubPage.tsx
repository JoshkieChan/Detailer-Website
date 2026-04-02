import { ArrowRight, MapPin, Search } from 'lucide-react';

const HubPage = () => {
  return (
    <div className="hub-page">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <h1>SignalSource: Systems, Services, and Digital Assets</h1>
        <p className="subtitle">Car care for Oak Harbor. Digital assets and AI systems for anywhere.</p>
        <p className="support-line text-muted">Choose how you want SignalSource to help: local detailing, world-wide guides, or custom-built systems.</p>
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
        
        .path-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: var(--color-text-main); }
        .path-card p { color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem; }
        
        .mini-features { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
        .mini-features li { position: relative; padding-left: 1.25rem; font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
        .mini-features li::before { content: "→"; position: absolute; left: 0; color: var(--color-accent-lime); }
        
        .card-cta { display: flex; align-items: center; color: var(--color-accent-lime); font-weight: 700; font-size: 0.95rem; margin-top: auto; }
        
        .highlight-border { border: 1px solid rgba(158, 255, 0, 0.3); background: rgba(158, 255, 0, 0.02); }
        .badge-lime { display: inline-block; background: var(--color-accent-lime); color: #000; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .badge-ai-powered { position: absolute; top: -12px; right: -12px; font-size: 0.7rem; }

        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: 1fr; }
          .hero-section h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default HubPage;
