import { Sparkles, Brain, Lightbulb, ShoppingBag, ArrowRight, Zap, Target, Heart } from 'lucide-react';

const SystemsPage = () => {
  return (
    <div className="systems-page">
      <div className="page-header text-center">
        <div className="badge-lime mb-1">Coming Soon</div>
        <h1>Systems & Digital Products</h1>
        <p className="subtitle">High-impact tools precisely engineered to solve painful business and lifestyle bottlenecks.</p>
      </div>

      <div className="systems-grid">
        {/* Section 1: Digital Products */}
        <section className="product-section glass">
          <div className="section-icon">
            <ShoppingBag size={40} className="icon-lime" />
          </div>
          <div className="section-content">
            <h2>Digital Assets & Blueprints</h2>
            <p className="section-intro">Stop guessing and start executing with field-tested frameworks for car care and business efficiency.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <Target size={20} className="icon-lime" />
                <div>
                  <h4>The Definitve Car Care Checklist</h4>
                  <p>A precision-mapped guide to keeping your vehicle in showroom condition with minimal effort.</p>
                </div>
              </div>
              <div className="feature-item">
                <Heart size={20} className="icon-lime" />
                <div>
                  <h4>Elite Customer Experience Templates</h4>
                  <p>The exact communication frameworks I use to turn one-time visitors into lifelong advocates.</p>
                </div>
              </div>
            </div>
            
            <div className="status-badge">Phase: Development</div>
          </div>
        </section>

        {/* Section 2: AI & Automation */}
        <section className="product-section glass highlight-border">
          <div className="section-icon">
            <Brain size={40} className="icon-lime" />
          </div>
          <div className="section-content">
            <div className="exclusive-badge">Next Gen</div>
            <h2>AI-Powered Local Systems</h2>
            <p className="section-intro">Leveraging autonomous agents to handle the heavy lifting of scheduling, lead-gen, and follow-ups for local service businesses.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <Zap size={20} className="icon-lime" />
                <div>
                  <h4>Automated Booking Agents</h4>
                  <p>24/7 AI assistants that don't just take numbers, but actually 'sell' the value of your services while you sleep.</p>
                </div>
              </div>
              <div className="feature-item">
                <Sparkles size={20} className="icon-lime" />
                <div>
                  <h4>Dynamic Operations Automator</h4>
                  <p>A complete backend system that synchronizes your calendar, CRM, and customer feedback loop automatically.</p>
                </div>
              </div>
            </div>

            <div className="status-badge">Phase: R&D / Private Beta</div>
          </div>
        </section>
      </div>

      <section className="outcome-section text-center">
        <Lightbulb size={48} className="icon-lime mb-2" />
        <h2>Solving Problems, Not Just Selling Features</h2>
        <p className="outcome-text">
          My goal isn't to give you more software to manage. It's to give you **time back**, **peace of mind**, and the **confidence** that your business or vehicle is being handled by a system that actually cares about the outcome.
        </p>
        <div className="cta-waitlist">
          <p>Want to be the first to know when these tools drop?</p>
          <a href="mailto:jcab@signaldatasource.com" className="btn primary">
            Join the Waitlist <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <style>{`
        .systems-page { padding: 4rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .page-header { margin-bottom: 5rem; }
        .badge-lime { display: inline-block; background: var(--color-accent-lime); color: #000; padding: 0.35rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .page-header h1 { font-size: 3.5rem; font-weight: 900; margin-bottom: 1.25rem; }
        .subtitle { font-size: 1.35rem; color: var(--color-text-muted); max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .systems-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 6rem; }
        
        .product-section { padding: 3.5rem; border-radius: var(--radius-lg); position: relative; display: flex; flex-direction: column; }
        .highlight-border { border: 2px solid var(--color-accent-lime); background: rgba(158, 255, 0, 0.03); }

        .section-icon { margin-bottom: 2rem; }
        .exclusive-badge { color: var(--color-accent-lime); font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.5rem; }
        
        .section-content h2 { font-size: 2.25rem; font-weight: 900; line-height: 1.1; margin-bottom: 1rem; }
        .section-intro { font-size: 1.1rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 2.5rem; }

        .feature-list { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 3rem; }
        .feature-item { display: flex; gap: 1.25rem; align-items: flex-start; }
        .feature-item h4 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--color-text-main); }
        .feature-item p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; }

        .status-badge { display: inline-block; padding: 0.5rem 1.25rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); border-radius: 999px; font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); }

        .outcome-section { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; border-radius: var(--radius-lg); background: radial-gradient(circle at top, rgba(158, 255, 0, 0.05) 0%, transparent 70%); }
        .outcome-section h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; }
        .outcome-text { font-size: 1.25rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 3rem; }
        .outcome-text b { color: var(--color-accent-lime); font-weight: 800; }

        .cta-waitlist p { margin-bottom: 1.5rem; font-weight: 700; font-size: 1.1rem; }
        .cta-waitlist .btn { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        @media (max-width: 900px) {
          .systems-grid { grid-template-columns: 1fr; gap: 2rem; }
          .page-header h1 { font-size: 2.75rem; }
          .product-section { padding: 2.5rem; }
        }

        @media (max-width: 480px) {
          .page-header h1 { font-size: 2.25rem; }
          .outcome-section h2 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default SystemsPage;
