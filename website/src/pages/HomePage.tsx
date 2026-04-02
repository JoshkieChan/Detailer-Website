import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Star, ShieldCheck, MessageSquare, Calendar, Bell, Users, TrendingUp, RefreshCw, CalendarCheck } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { servicePackages } from '../data/packages';
import { trackEvent } from '../lib/analytics';

const HomePage = () => {
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90];

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScrollable = documentHeight - viewportHeight;

      if (maxScrollable <= 0) return;

      const percent = Math.round((scrollTop / maxScrollable) * 100);

      thresholds.forEach((depth) => {
        if (percent >= depth && !trackedDepths.current.has(depth)) {
          trackedDepths.current.add(depth);
          trackEvent('Detailing Page Scroll Depth', { depth });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="capacity-banner">
            <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
          </div>
          <h1 className="hero-title">NAS Whidbey families and busy Oak Harbor drivers: get the daily driver clean, protected, and handled right the first time.</h1>
          <p className="hero-subtitle">
            If the vehicle is dirty, your schedule is full, and you do not want to gamble on a rushed job, SignalSource gives you honest pricing, studio or mobile options, and detailing built for real life in Oak Harbor.
          </p>
          <div className="hero-ctas">
            <Link
              to="/booking"
              className="btn primary btn-lg"
              onClick={() =>
                trackEvent('Detailing Lead - Booking Page', {
                  cta: 'hero_book_a_detail',
                })
              }
            >
              Book a Detail
            </Link>
            <Link to="/memberships" className="btn secondary btn-lg outline-lime">See Memberships</Link>
          </div>
        </div>
        <div className="hero-glow"></div>
      </section>

      {/* Packages Overview (3 Cards from Flyer) */}
      <section className="packages">
        <div className="container">
          <div className="packages-grid">
            {servicePackages.map(pkg => (
              <ServiceCard 
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                bestFor={pkg.bestFor}
                price={pkg.price}
                priceNote={pkg.priceNote}
                features={pkg.features}
                packageId={pkg.id}
                highlight={pkg.highlight}
                themeStyle={pkg.themeStyle}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Two Special Sections: Garage/Mobile and Maintenance Plan */}
      <section className="special-cards-section mt-4">
        <div className="container">
          <div className="special-grid">
            
            {/* Garage vs Mobile */}
            <div className="special-card garage-mobile glass">
              <div className="special-text">
                <h3>HEAVY WORK BELONGS IN THE GARAGE STUDIO.<br/>MOBILE IS FOR LIGHTER JOBS.</h3>
                <div className="location-details">
                  <div className="location-item">
                    <h4>Garage Studio (Erie St)</h4>
                    <p>Drop-off service near Erie Street in Oak Harbor. Exact address is shared after your booking is confirmed. If the vehicle needs controlled lighting, reliable power, weather protection, or a longer reset, the studio is the better call. Best for full details, Deep Reset, and New Car Protection packages.</p>
                  </div>
                  <div className="location-item mt-1">
                    <h4>Mobile Detailing</h4>
                    <p>I come to your driveway or parking spot within roughly a 25–30 mile radius of Oak Harbor, including NAS Whidbey, Coupeville, Deception Pass, and nearby areas. Mobile is best for Maintenance and lighter Deep Reset services when convenience matters most. No heavy machine polishing or multi-day jobs on mobile appointments.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Plan */}
            <div className="special-card maintenance-plan glass relative">
              <div className="badge-popular">POPULAR</div>
              <div className="special-text">
                <h3 className="flex items-center gap-2">
                  <ShieldCheck size={24} className="icon-lime" /> Maintenance Plan
                </h3>
                <p className="plan-intro">For drivers who do not want to think about booking every time the car slips backward, this keeps you on a routine instead of waiting until it feels trashed again.</p>
                <p className="sub-price">Keep it dialed from <span className="highlight-lime">$60/mo</span> with member-first scheduling and fewer &ldquo;it&apos;s trashed again&rdquo; surprises.</p>
                <ul className="plan-bullets">
                  <li><span className="bullet-arrow">{'>'}</span> Best for daily drivers after a Deep Reset or New Car Protection service</li>
                  <li><span className="bullet-arrow">{'>'}</span> Priority booking slots and easier long-term upkeep</li>
                </ul>
              </div>
              <Link
                to="/memberships"
                className="btn outline-lime mt-1"
                onClick={() =>
                  trackEvent('Detailing Lead - View Plans', {
                    cta: 'maintenance_plan_view_plans',
                  })
                }
              >
                View Plans
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof Band */}
      <div className="social-proof-band mt-4">
        <div className="container text-center">
          <div className="stars-row">
            {[...Array(5)].map((_, i) => <Star key={i} fill="#facc15" color="#facc15" size={20} />)}
            <span className="review-text"><strong>5.0★ LOCAL REVIEWS</strong> — NAS Whidbey & Oak Harbor</span>
          </div>
        </div>
      </div>

      {/* AI Agents Section */}
      <section className="ai-agents mt-4">
        <div className="container">
          <h2 className="section-title text-center">Busy drivers should not have to chase a detailer for updates.</h2>
          <p className="section-subtitle text-center">Automations and AI agents handle intake, scheduling, reminders, and follow-up so you get faster replies, fewer dropped details, and a smoother appointment from first message to final payment.</p>
          <div className="agents-grid">
            
            <div className="agent-card glass">
              <div className="agent-icon"><MessageSquare size={24} /></div>
              <div className="agent-info">
                <h4>Lead Intake</h4>
                <p>Uses webchat and SMS to collect your details fast and help you choose the right package without a long back-and-forth.</p>
              </div>
            </div>

            <div className="agent-card glass">
              <div className="agent-icon"><Calendar size={24} /></div>
              <div className="agent-info">
                <h4>Scheduling</h4>
                <p>Keeps the calendar updated and blocks dates as bookings come in so your spot does not get lost or double-booked.</p>
              </div>
            </div>

            <div className="agent-card glass">
              <div className="agent-icon"><Bell size={24} /></div>
              <div className="agent-info">
                <h4>Reminders</h4>
                <p>Sends prep instructions and appointment reminders so you know what to do before service day and nothing slips through.</p>
              </div>
            </div>

            <div className="agent-card glass">
              <div className="agent-icon"><Users size={24} /></div>
              <div className="agent-info">
                <h4>Review &amp; Referral</h4>
                <p>Follows up after service to request a Google review and make referring friends simple.</p>
              </div>
            </div>

            <div className="agent-card glass">
              <div className="agent-icon"><TrendingUp size={24} /></div>
              <div className="agent-info">
                <h4>Planned: Membership Upsell</h4>
                <p>Will follow up after a Deep Reset or New Car Protection job with maintenance plan options before the vehicle slides backward again.</p>
              </div>
            </div>

            <div className="agent-card glass">
              <div className="agent-icon"><RefreshCw size={24} /></div>
              <div className="agent-info">
                <h4>Operations</h4>
                <p>Deposits are tracked through Stripe, and booking records sync automatically to the database after payment.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero { position: relative; padding: 7rem 0 5rem; text-align: center; overflow: hidden; }
        .hero-title { font-size: 4rem; margin-bottom: 1.5rem; letter-spacing: -1.5px; line-height: 1.1; font-weight: 900; max-width: 1100px; margin-left: auto; margin-right: auto; }
        .hero-subtitle { font-size: 1.25rem; color: var(--color-text-muted); margin-bottom: 3rem; max-width: 650px; margin-left: auto; margin-right: auto; }
        .hero-ctas { display: flex; justify-content: center; gap: 1.5rem; }
        .hero-glow { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(158, 255, 0, 0.15) 0%, rgba(15, 19, 31, 0) 70%); z-index: -1; pointer-events: none; }

        /* General Section */
        .section-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 3rem; }

        /* Flyer Packages Grid */
        .packages { padding-top: 2rem; }
        .packages-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; align-items: stretch; }
        .flyer-card { background: var(--color-bg-card-dark); padding: 2.5rem; border-radius: 12px; position: relative; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); transition: all var(--transition-fast); display: flex; flex-direction: column; }
        .flyer-card:hover { transform: translateY(-5px); box-shadow: var(--card-shadow-hover); border-color: var(--color-border-hover); }
        .flyer-card h3 { font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; }
        .package-desc { color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 1rem; min-height: 96px; }
        .package-best-for { color: var(--color-text-main); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        .package-price-note { color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; min-height: 88px; }
        
        /* Colored Borders */
        .style-blue { border-top: 4px solid var(--color-accent-blue); }
        .style-lime { border-top: 4px solid var(--color-accent-lime); }
        .style-purple { border-top: 4px solid var(--color-accent-purple); }

        .star-icon { position: absolute; top: 1.5rem; right: 1.5rem; color: var(--color-accent-lime); }
        [data-theme='light'] .star-icon { color: #559300; }
        
        .package-bullets { list-style: none; padding: 0; margin-bottom: 2rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
        .feature-row { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--color-text-main); }
        .feature-row span { margin-top: 0.1rem; }
        .icon-lime { color: var(--color-accent-lime); flex-shrink: 0; }
        [data-theme='light'] .icon-lime { color: #559300; }
        
        .price-line { font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 1.5rem; display: flex; align-items: baseline; gap: 0.5rem; }
        .price-line span { font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); }

        /* Special Grid */
        .special-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .special-card { padding: 2.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05); }
        
        .garage-mobile { border-color: rgba(59, 130, 246, 0.4); }
        .garage-mobile h3 { font-weight: 800; line-height: 1.2; font-size: 1.25rem; margin-bottom: 1rem; letter-spacing: 0.5px; }
        .location-details { display: flex; flex-direction: column; gap: 1rem; }
        .location-item h4 { font-size: 1rem; color: var(--color-accent-lime); margin-bottom: 0.25rem; }
        .location-item p { color: var(--color-text-muted); font-size: 0.95rem; max-width: 350px; line-height: 1.5; }

        .maintenance-plan { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .plan-intro { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; }
        .sub-price { font-weight: 800; font-size: 1.1rem; margin-bottom: 1rem; }
        .plan-bullets { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .plan-bullets li { display: flex; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; }
        .bullet-arrow { color: var(--color-accent-lime); font-weight: 800; }
        .badge-popular { position: absolute; top: -12px; right: 2rem; background: var(--color-accent-lime); color: #000; font-weight: 900; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 12px; letter-spacing: 0.5px; }

        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 0.5rem; }

        /* Social Proof Band */
        .social-proof-band { background: #000; padding: 1.5rem 0; letter-spacing: 0.5px; }
        .stars-row { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
        .review-text { margin-left: 0.5rem; font-size: 1.1rem; }
        .review-text strong { color: #fff; font-weight: 800; }

        /* AI Agents Grid */
        .ai-agents { padding: 4rem 0 6rem; }
        .section-subtitle { color: var(--color-text-muted); font-size: 1.1rem; max-width: 600px; margin: -1.5rem auto 2.5rem; line-height: 1.6; }
        .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .agent-card { padding: 1.5rem; display: flex; gap: 1.5rem; align-items: flex-start; border: 1px solid rgba(255,255,255,0.05); }
        .agent-icon { background: rgba(158, 255, 0, 0.1); color: var(--color-accent-lime); padding: 1rem; border-radius: var(--radius-md); flex-shrink: 0; }
        .agent-info h4 { font-size: 1.15rem; margin-bottom: 0.25rem; }
        .agent-info p { color: var(--color-text-muted); font-size: 0.95rem; }

        @media (max-width: 900px) {
          .packages-grid { grid-template-columns: 1fr; }
          .special-grid { grid-template-columns: 1fr; }
          .agents-grid { grid-template-columns: 1fr; }
          .special-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .special-icons { align-self: flex-start; }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero-ctas { flex-direction: column; gap: 1rem; }
          .hero-ctas .btn { width: 100%; }
          .review-text { font-size: 0.95rem; text-align: center; margin-top: 0.5rem; display: block; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
