import { Sparkles, Brain, Lightbulb, ShoppingBag, Zap, Target, Heart, MessageSquare } from 'lucide-react';

const SystemsPage = () => {
  return (
    <div className="systems-page">
      <div className="page-header text-center">
        <div className="badge-lime mb-1">Available Now</div>
        <h1>Systems & Digital Products</h1>
        <p className="subtitle">High-impact, custom-built assets designed to remove friction and automate the success of your day-to-day operations.</p>
      </div>

      <div className="systems-grid">
        {/* Section 1: Digital Products */}
        <section className="product-section glass">
          <div className="section-icon">
            <ShoppingBag size={40} className="icon-lime" />
          </div>
          <div className="section-content">
            <h2>Digital Assets & Blueprints</h2>
            <p className="section-intro">Highly personalized, outcome-focused deliverables built specifically for your vehicle or business needs.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <Target size={20} className="icon-lime" />
                <div>
                  <h4>Car Care Blueprints</h4>
                  <p>A custom-mapped maintenance schedule and supply list built around your specific vehicle, climate, and available time.</p>
                </div>
              </div>
              <div className="feature-item">
                <Heart size={20} className="icon-lime" />
                <div>
                  <h4>Customer Experience Flows</h4>
                  <p>Message and email sequences that handle the "small talk" and follow-ups, turning one-time visitors into repeat advocates.</p>
                </div>
              </div>
              <div className="feature-item">
                <Zap size={20} className="icon-lime" />
                <div>
                  <h4>Operator Dashboards</h4>
                  <p>Centralized Notion or Airtable systems to track your pipeline, jobs, and follow-ups without the mental clutter.</p>
                </div>
              </div>
            </div>
            
            <div className="status-badge">Format: 1:1 Custom Build</div>
            
            <div className="mt-6 flex justify-center">
              <a href="/systems/examples/digital-assets" className="text-link-secondary">
                View example builds <span className="ml-1">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: AI & Automation */}
        <section className="product-section glass highlight-border">
          <div className="section-icon">
            <Brain size={40} className="icon-lime" />
          </div>
          <div className="section-content">
            <div className="exclusive-badge">Private Build</div>
            <h2>AI-Powered Local Systems</h2>
            <p className="section-intro">Intelligent automation for local service businesses (detailers, cleaners, contractors) who need to scale without more staff.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <Zap size={20} className="icon-lime" />
                <div>
                  <h4>Automated Booking Agents</h4>
                  <p>24/7 AI assistants that qualify leads and sell the value of your services while you're focused on the job.</p>
                </div>
              </div>
              <div className="feature-item">
                <Sparkles size={20} className="icon-lime" />
                <div>
                  <h4>Dynamic Operations Automator</h4>
                  <p>A back-end "brain" that syncs your calendar, CRM, and customer feedback loop automatically.</p>
                </div>
              </div>
            </div>

            <div className="status-badge">Status: Limited 1:1 Implementation</div>
            
            <div className="mt-6 flex justify-center">
              <a href="/systems/examples/local-systems" className="text-link-secondary">
                View example systems <span className="ml-1">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Concierge Instructions */}
      <section className="concierge-box glass mb-6">
        <div className="concierge-content">
          <div className="icon-wrapper mb-2">
            <MessageSquare size={32} className="icon-lime" />
          </div>
          <h2>Custom Build Requests</h2>
          <p className="mb-2">Need a specific routine optimized or a business bottleneck removed? I design and build tailored systems that actually solve the problem.</p>
          <div className="concierge-steps">
            <div className="step">
              <span className="step-num">1</span>
              <p>Email me a description of the outcome you're looking for.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <p>I'll reply with clarifying questions and a simple, flat-rate quote.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <p>I build it, you use it. No ongoing maintenance required.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="outcome-section text-center">
        <Lightbulb size={48} className="icon-lime mb-2" />
        <h2>Solving Problems, Not Just Selling Features</h2>
        <p className="outcome-text">
          My goal isn't to give you more software to manage. It's to deliver tangible results that change how your day feels:
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

        <p className="mt-4 text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, textAlign: 'center' }}>
          When you’re ready, you can DM or email me with what you’re trying to fix. My contact details are in the footer section below.
        </p>
      </section>

      <style>{`
        .systems-page { padding: 4rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .page-header { margin-bottom: 5rem; }
        .badge-lime { display: inline-block; background: var(--color-accent-lime); color: #000; padding: 0.35rem 1rem; border-radius: 4px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .page-header h1 { font-size: 3.5rem; font-weight: 900; margin-bottom: 1.25rem; }
        .subtitle { font-size: 1.35rem; color: var(--color-text-muted); max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .systems-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 4rem; }
        
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

        .status-badge { display: inline-block; padding: 0.5rem 1.25rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); }

        .concierge-box { padding: 4rem; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(158, 255, 0, 0.2); background: radial-gradient(circle at top right, rgba(158, 255, 0, 0.05) 0%, transparent 50%); }
        .concierge-box h2 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem; }
        .concierge-steps { display: flex; justify-content: center; gap: 3rem; margin-top: 3rem; text-align: left; }
        .step { flex: 1; max-width: 250px; position: relative; }
        .step-num { display: block; width: 32px; height: 32px; background: var(--color-accent-lime); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; margin-bottom: 1rem; }
        .step p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; font-weight: 500; }

        .outcome-section { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
        .outcome-section h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; }
        .outcome-text { font-size: 1.25rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 3rem; }

        .outcome-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; text-align: left; }
        .outcome-card h4 { color: var(--color-accent-lime); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; }
        .outcome-card p { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; }

        @media (max-width: 900px) {
          .systems-grid, .concierge-steps, .outcome-grid { grid-template-columns: 1fr; gap: 2rem; }
          .concierge-steps { align-items: center; }
          .step { max-width: 100%; text-align: center; }
          .step-num { margin: 0 auto 1rem; }
          .page-header h1 { font-size: 2.75rem; }
          .product-section, .concierge-box { padding: 2.5rem; }
        }

        .text-link-secondary {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease;
          opacity: 0.8;
          border-bottom: 1px solid transparent;
        }
        .text-link-secondary:hover {
          color: var(--color-accent-lime);
          opacity: 1;
          border-bottom-color: var(--color-accent-lime);
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
