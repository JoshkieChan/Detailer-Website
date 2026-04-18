import { ArrowRight, MapPin, Search, Cpu, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeadMagnet } from '../components/LeadMagnet';
import { PageSubtitle } from '../components/PageSubtitle';
import { PageHeroWithBackground } from '../components/PageHeroWithBackground';

const HubPage = () => {
  return (
    <div className="page-shell hub-page">
      <PageHeroWithBackground imageSrc="/images/hero-detailing.jpg">
        <div className="text-center reveal">
          <span className="eyebrow text-slate-300">SignalSource</span>
          <h1 className="hero-title text-white">Car detailing for Oak Harbor. Digital guides and playbooks for anywhere.</h1>
          <PageSubtitle>
            <span className="text-slate-100">
              Choose where you want to go next: local car care or downloadable guides.
            </span>
          </PageSubtitle>
          <div className="hero-actions hub-hero-actions">
            <a href="#hub-paths" className="btn primary btn-lg">
              Choose Your Path
              <ChevronDown size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </PageHeroWithBackground>

      <section className="hub-lead-magnet container">
        <LeadMagnet />
      </section>

      <section id="hub-paths" className="hub-paths">
        <div className="card-grid three">
          <article className="hub-card hub-card-primary reveal">
            <div className="hub-card-top">
              <div className="support-pill">
                <MapPin size={16} />
                Local main offer
              </div>
              <div className="badge-popular hub-recommended">Recommended for most local visitors</div>
            </div>
            <div className="hub-card-copy">
              <h2>Car Detailing &amp; Protection</h2>
              <p className="section-copy">
                For Oak Harbor drivers, NAS Whidbey families, and busy commuters who want the
                vehicle handled right without wasting a day. This is SignalSource&apos;s main local
                offer: detailing, protection, and upkeep built for real Whidbey schedules.
              </p>
            </div>
            <Link to="/detailing" className="btn primary hub-card-cta">
              View Local Services
              <ArrowRight size={16} />
            </Link>
          </article>

          <article className="hub-card reveal" data-reveal-delay="1">
            <div className="hub-card-top">
              <div className="support-pill">
                <Search size={16} />
                Secondary offer
              </div>
            </div>
            <div className="hub-card-copy">
              <h2>Digital Guides &amp; Playbooks</h2>
              <p className="section-copy">
                Practical guides for PCS prep, money, and transition planning that you can
                download once and keep using. Built for people who want clearer checklists,
                less scrambling, and less mental load.
              </p>
            </div>
            <Link to="/systems/examples/digital-assets" className="btn secondary hub-card-cta">
              Browse Guides
              <ArrowRight size={16} />
            </Link>
          </article>

          {false && (
            <article className="hub-card reveal" data-reveal-delay="2">
              <div className="hub-card-top">
                <div className="support-pill">
                  <Cpu size={16} />
                  Secondary offer
                </div>
              </div>
              <div className="hub-card-copy">
                <h2>Systems &amp; Digital Products</h2>
                <p className="section-copy">
                  Custom systems for operators who are tired of missed follow-up, manual admin,
                  and running everything from memory. This is for people who want the same
                  organized SignalSource approach applied to automations, dashboards, and
                  workflows.
                </p>
              </div>
              <Link to="/systems" className="btn secondary hub-card-cta">
                Explore Systems
                <ArrowRight size={16} />
              </Link>
            </article>
          )}

          <article className="hub-card reveal" data-reveal-delay="2">
            <div className="hub-card-copy">
              <h2>Coming Soon: Window Tint, Ceramic Coatings, PPF &amp; Wraps</h2>
              <p className="section-copy">
                We&apos;re building out surface protection and styling services. Check back soon.
              </p>
            </div>
          </article>
        </div>
      </section>

      <footer className="hub-footer reveal">
        <div className="hub-footer-copy">
          <h2>SIGNALSOURCE</h2>
          <p>Systems-driven car care based in Oak Harbor, WA.</p>
        </div>
      </footer>

      <style>{`
        .hub-page {
          display: grid;
          gap: 3rem;
        }

        .hub-hero {
          display: grid;
          gap: 1rem;
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .hub-hero-actions {
          justify-content: center;
        }

        .hub-paths {
          padding-top: 0.5rem;
        }

        .card-grid.three {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          align-items: stretch;
        }

        @media (max-width: 850px) {
          .card-grid.three {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .hub-card {
            height: auto;
            min-height: 0;
          }
        }

        .hub-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
          padding: 1.6rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
          color: inherit;
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base),
            background-color var(--transition-base);
        }

        .hub-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-hover);
        }

        .hub-card-primary {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 88%, var(--color-accent-primary) 12%);
        }

        .hub-card-primary:hover {
          border-color: var(--color-accent-primary);
        }

        .hub-card-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .hub-recommended {
          white-space: normal;
          text-align: left;
        }

        .hub-card-copy {
          display: grid;
          gap: 0.8rem;
          flex: 1;
        }

        .hub-card-copy h2 {
          font-size: 1.45rem;
          line-height: 1.2;
        }

        .hub-card-cta {
          width: fit-content;
          margin-top: auto;
        }

        .hub-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border-default);
        }

        .hub-footer-copy {
          display: grid;
          gap: 0.35rem;
        }

        .hub-footer-copy h2 {
          font-size: 1.15rem;
          letter-spacing: 0.12em;
        }

        .hub-footer-copy p,
        .hub-footer-link {
          color: var(--color-text-secondary);
        }

        .hub-footer-link:hover {
          color: var(--color-accent-primary);
        }

        @media (max-width: 960px) {
          .hub-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default HubPage;
