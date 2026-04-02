import { ArrowRight, MapPin, Search } from 'lucide-react';

const HubPage = () => {
  return (
    <div className="hub-page">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <h1>SignalSource: Car Detailing for Oak Harbor. Digital guides and AI-backed systems for anywhere.</h1>
        <p className="subtitle">For NAS Whidbey families, commuters, and solo operators tired of a dirty vehicle, PCS scramble, or missed follow-ups, SignalSource helps you get the vehicle handled or the process cleaned up without extra guesswork.</p>
        <p className="support-line text-muted">Choose how you want SignalSource to help: local detailing, practical guides, or AI-backed systems.</p>
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
            <h3>Car Detailing &amp; Protection for Oak Harbor Daily Drivers</h3>
            <p>For military families, commuters, and busy locals tired of a dirty daily driver, this gets the vehicle clean, protected, and easier to stay ahead of without wasting a full day.</p>
            <ul className="mini-features">
              <li>Detailing packages</li>
              <li>Protection prep for upcoming coatings, tint, and PPF</li>
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
            <h3>Digital Guides &amp; Playbooks for PCS, Money, and Daily Friction</h3>
            <p>For military households and organized operators tired of scattered notes and last-minute scrambling, these guides turn PCS prep, planning, and repeat problems into clear checklists you can actually use.</p>
            <div className="card-cta mt-auto">
              Browse PDFs <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 3: Systems & Digital Products */}
          <a href="/systems" className="path-card glass group highlight-border">
            <div className="card-icon-wrapper">
              <span className="brand-icon">S</span>
            </div>
            <h3>Systems &amp; Digital Products for Operators Losing Time to Missed Calls and Manual Follow-Up</h3>
            <p>For local businesses and one-person operators tired of dropped leads, forgotten callbacks, and running the day from memory, these AI-backed tools can give you follow-up automations, simple dashboards, and systems that keep work moving.</p>
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
        .subtitle { font-size: 1.35rem; color: var(--color-text-main); font-weight: 600; margin-bottom: 0.75rem; max-width: 980px; margin-left: auto; margin-right: auto; }
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
        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: 1fr; }
          .hero-section h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default HubPage;
