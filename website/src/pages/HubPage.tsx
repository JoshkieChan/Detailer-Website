import { ArrowRight, MapPin, Search, Cpu } from 'lucide-react';

const HubPage = () => {
  return (
    <div className="page-shell hub-page">
      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">SignalSource</span>
          <h1 className="hero-title">Car detailing for Oak Harbor. Digital guides and AI-backed systems for anywhere.</h1>
          <p className="hero-subtitle">
            For NAS Whidbey families, commuters, and solo operators tired of a dirty vehicle,
            PCS scramble, or missed follow-ups, SignalSource helps you get the vehicle handled
            or the process cleaned up without extra guesswork.
          </p>
          <p className="section-note">
            Choose how you want SignalSource to help: local detailing, practical guides, or
            AI-backed systems.
          </p>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Choose Your Path</span>
          <h2 className="section-title">Start with the offer that matches the problem you need solved.</h2>
        </div>

        <div className="card-grid three">
          <a href="/detailing" className="content-card surface-card reveal">
            <div className="support-pill">
              <MapPin size={16} />
              Local main offer
            </div>
            <h3>Car Detailing &amp; Protection for Oak Harbor Daily Drivers</h3>
            <p className="section-copy">
              For military families, commuters, and busy locals tired of a dirty daily driver,
              this gets the vehicle clean, protected, and easier to stay ahead of without
              wasting a full day.
            </p>
            <ul className="package-bullets mt-1">
              <li className="feature-row"><span className="icon-lime">•</span><span className="feature-text">Detailing packages</span></li>
              <li className="feature-row"><span className="icon-lime">•</span><span className="feature-text">Protection prep for upcoming coatings, tint, and PPF</span></li>
            </ul>
            <span className="cta-row accent-text mt-2">
              View local services <ArrowRight size={16} />
            </span>
          </a>

          <a href="/systems/examples/digital-assets" className="content-card surface-card reveal" data-reveal-delay="1">
            <div className="support-pill">
              <Search size={16} />
              Secondary offer
            </div>
            <h3>Digital Guides &amp; Playbooks for PCS, Money, and Daily Friction</h3>
            <p className="section-copy">
              For military households and organized operators tired of scattered notes and
              last-minute scrambling, these guides turn PCS prep, planning, and repeat
              problems into clear checklists you can actually use.
            </p>
            <span className="cta-row accent-text mt-2">
              Browse PDFs <ArrowRight size={16} />
            </span>
          </a>

          <a href="/systems" className="content-card surface-card reveal" data-reveal-delay="2">
            <div className="support-pill">
              <Cpu size={16} />
              Secondary offer
            </div>
            <h3>Systems &amp; Digital Products for Operators Losing Time to Missed Calls and Manual Follow-Up</h3>
            <p className="section-copy">
              For local businesses and one-person operators tired of dropped leads, forgotten
              callbacks, and running the day from memory, these AI-backed tools can give you
              follow-up automations, simple dashboards, and systems that keep work moving.
            </p>
            <span className="cta-row accent-text mt-2">
              Explore systems <ArrowRight size={16} />
            </span>
          </a>
        </div>
      </section>

      <style>{`
        .hub-page {
          display: grid;
          gap: 3rem;
        }

        .hub-page .content-card {
          display: grid;
          gap: 1rem;
          min-height: 100%;
        }

        .hub-page .content-card h3 {
          font-size: 1.35rem;
          line-height: 1.25;
        }
      `}</style>
    </div>
  );
};

export default HubPage;
