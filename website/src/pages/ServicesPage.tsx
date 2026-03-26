import { Link } from 'react-router-dom';
import { Shield, Sparkles, Droplets, Wind, Focus, CheckCircle, Home, MapPin, Search } from 'lucide-react';
import { CalendarCheck } from 'lucide-react';

const ServicesPage = () => {
  return (
    <div className="services-page">
      <div className="text-center mb-1">
        <div className="capacity-banner inline-block mb-3">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
      </div>

      <div className="page-header text-center">
        <h1>Detailed Service Breakdown</h1>
        <p>Explore exactly what goes into each premium package.</p>
      </div>

      <div className="service-breakdown-list">
        
        {/* Maintenance */}
        <section className="service-detailed-row glass">
          <div className="service-detailed-header">
            <h2>Maintenance</h2>
            <p className="service-detailed-desc">A thorough inside-out refresh to keep your daily driver looking crisp.</p>
          </div>
          <div className="service-detailed-body">
            <div className="service-area">
              <Droplets className="icon-lime" size={28} />
              <h4>Exterior Care</h4>
              <ul>
                <li>Plush foam hand wash & careful hand dry</li>
                <li>Wheel face and tire safe cleaning</li>
                <li>Tire conditioning (no greasy sling)</li>
              </ul>
            </div>
            <div className="service-area">
              <Focus className="icon-lime" size={28} />
              <h4>Interior Refresh</h4>
              <ul>
                <li>Thorough interior vacuum (seats, carpets, mats)</li>
                <li>Light wipe-down of all hard plastics and dash</li>
                <li>Door jambs wiped clean of surface dust</li>
                <li>Streak-free glass cleaning inside and out</li>
              </ul>
            </div>
          </div>
          <div className="service-detailed-footer">
            <Link to="/booking?package=maintenance" className="btn outline-lime mt-1">Book Maintenance</Link>
          </div>
        </section>

        {/* Deep Reset */}
        <section className="service-detailed-row glass highlight-border">
          <div className="service-detailed-header">
            <div className="popular-badge"><Sparkles size={16} /> Signature Service</div>
            <h2 className="highlight-lime mt-1">Deep Reset</h2>
            <p className="service-detailed-desc">Restores your interior and gloss back toward factory fresh. Our most comprehensive detail.</p>
          </div>
          <div className="service-detailed-body">
            <div className="service-area">
              <Shield className="icon-lime" size={28} />
              <h4>Decontamination & Protection</h4>
              <ul>
                <li>Pre-wash & two-bucket safe contact wash</li>
                <li>Iron/fallout chemical decontamination</li>
                <li>Clay bar mechanical decontamination (smooth paint)</li>
                <li>Premium protective sealant applied to paint, plastics, and wheel faces</li>
              </ul>
            </div>
            <div className="service-area">
              <Search className="icon-lime" size={28} />
              <h4>Deep Interior Restoration</h4>
              <ul>
                <li>Extensive vacuum including deep crevices and trunk</li>
                <li>Stain treatment on seats and carpets (as safely possible)</li>
                <li>Deep cleaning and dressing of all interior plastics/vinyl</li>
                <li>Pet hair removal (within reasonable limits)</li>
              </ul>
            </div>
          </div>
          <div className="service-detailed-footer">
            <Link to="/booking?package=deep-reset" className="btn primary mt-1">Book Deep Reset</Link>
          </div>
        </section>

        {/* New Car Protection */}
        <section className="service-detailed-row glass">
          <div className="service-detailed-header">
            <h2>New Car Protection</h2>
            <p className="service-detailed-desc">Perfect for new or newly-detailed vehicles. Lock in the gloss and protect against the PNW elements.</p>
          </div>
          <div className="service-detailed-body">
            <div className="service-area">
              <Wind className="icon-lime" size={28} />
              <h4>Paint Enhancement</h4>
              <ul>
                <li>Deep exterior clean & full chemical decontamination</li>
                <li>Light one-step gloss enhancement machine polish</li>
                <li>Dramatically increases shine and clarity (no heavy correction)</li>
              </ul>
            </div>
            <div className="service-area">
              <Shield className="icon-lime" size={28} />
              <h4>Long-Term Defense</h4>
              <ul>
                <li>Durable 1-year paint sealant applied to painted surfaces</li>
                <li>Dedicated wheel face protection to repel brake dust</li>
                <li>Exterior glass sealant to improve rain visibility</li>
              </ul>
            </div>
          </div>
          <div className="service-detailed-footer">
            <Link to="/booking?package=new-car" className="btn outline-lime mt-1">Book Protection</Link>
          </div>
        </section>

      </div>

      {/* Location vs Mobile Section */}
      <section className="location-info mt-4 glass">
        <h2 className="text-center mb-2">How We Operate</h2>
        <div className="location-grid">
          <div className="loc-card">
            <Home className="icon-lime mb-1" size={32} />
            <h3>Garage Studio (Erie St)</h3>
            <p>A controlled drop-off environment at my Oak Harbor studio. Features specialized lighting, power, and climate control. <strong>Best for heavy details like Deep Reset and New Car Protection.</strong></p>
          </div>
          <div className="loc-card">
            <MapPin className="icon-lime mb-1" size={32} />
            <h3>Mobile Detailing</h3>
            <p>I bring the detailing setup to your driveway. We use the exact same premium processes adapted for your location. <strong>Best for Maintenance details and lighter services.</strong></p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon-info mt-4">
        <h2 className="text-center mb-2">Future Expansions</h2>
        <p className="text-center mb-2" style={{ color: 'var(--color-text-muted)' }}>We are currently focused strictly on premium detailing and 1-year sealant protection. The following services are on our roadmap as the studio grows:</p>
        
        <div className="coming-soon-grid gap-2">
          <div className="soon-card glass">
            <h4>Ceramic Coatings</h4>
            <p>Multi-year 9H hardness protection for the ultimate permanent gloss and extreme ease of maintenance.</p>
            <div className="overlay-badge">COMING SOON</div>
          </div>
          <div className="soon-card glass">
            <h4>Paint Protection Film (PPF)</h4>
            <p>Self-healing clear bra to protect your high-impact areas from rock chips and scratching.</p>
            <div className="overlay-badge">COMING SOON</div>
          </div>
          <div className="soon-card glass">
            <h4>Window Tinting</h4>
            <p>Premium heat-rejecting ceramic window film installations.</p>
            <div className="overlay-badge">COMING SOON</div>
          </div>
        </div>
      </section>

      <style>{`
        .services-page { padding: 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 4rem; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--color-text-muted); }
        
        .service-breakdown-list { display: flex; flex-direction: column; gap: 4rem; }
        .service-detailed-row { border-radius: var(--radius-lg); padding: 3rem; display: flex; flex-direction: column; gap: 2rem; }
        .highlight-border { border: 2px solid var(--color-accent-lime); background: rgba(158, 255, 0, 0.03); position: relative; }
        [data-theme='light'] .highlight-border { background: #fdfef9; }

        .popular-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--color-accent-lime); color: #000; padding: 0.35rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
        
        .service-detailed-header h2 { font-size: 2.25rem; font-weight: 900; }
        .service-detailed-desc { font-size: 1.15rem; color: var(--color-text-muted); margin-top: 0.5rem; }
        
        .service-detailed-body { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; border-top: 1px dashed var(--color-border); border-bottom: 1px dashed var(--color-border); padding: 2rem 0; }
        
        .service-area h4 { font-size: 1.25rem; margin: 1rem 0; color: var(--color-text-main); }
        .service-area ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .service-area li { position: relative; padding-left: 1.5rem; color: var(--color-text-muted); line-height: 1.5; font-size: 0.95rem; }
        .service-area li::before { content: "✓"; position: absolute; left: 0; color: var(--color-accent-lime); font-weight: bold; }
        [data-theme='light'] .service-area li::before { color: #559300; }
        
        .service-detailed-footer { text-align: left; }
        .service-detailed-footer .btn { padding: 1rem 3rem; font-size: 1.1rem; }
        
        .location-info { padding: 3rem; border-radius: var(--radius-lg); }
        .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
        .loc-card h3 { font-size: 1.4rem; margin-bottom: 0.5rem; }
        .loc-card p { color: var(--color-text-muted); line-height: 1.6; }
        
        .coming-soon-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-top: 2rem; }
        .soon-card { position: relative; padding: 2rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--color-border); overflow: hidden; opacity: 0.8; }
        .soon-card h4 { font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--color-text-main); }
        .soon-card p { color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; }
        
        .overlay-badge { background: rgba(0,0,0,0.8); color: #fff; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; padding: 0.3rem 0; text-align: center; position: absolute; top: 1rem; right: -2rem; width: 150px; transform: rotate(45deg); border: 1px dashed var(--color-text-muted); }
        [data-theme='light'] .overlay-badge { background: #e2e8f0; color: #475569; }
        
        @media (max-width: 900px) {
          .service-detailed-body { grid-template-columns: 1fr; gap: 2rem; }
          .services-page { padding: 3rem 1rem; }
        }
        
        @media (max-width: 768px) {
          .location-grid, .coming-soon-grid { grid-template-columns: 1fr; }
          .service-detailed-row { padding: 2rem; }
          .service-detailed-header h2 { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
