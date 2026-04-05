import { ChevronLeft, CheckCircle2, TrendingUp, Package, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OVERWHELM_LINK = '#overwhelm-link';
const DEBT_DASHBOARD_LINK = '#debt-dashboard-link';
const LIFE_INCOME_PACK_LINK = '#life-income-pack-link';

const DigitalAssetsExamples = () => {
  return (
    <div className="page-shell guides-page storefront">
      <Link to="/hub" className="back-link reveal">
        <ChevronLeft size={15} />
        Back to More
      </Link>

      {/* A. Hero Section */}
      <section className="hero-grid reveal">
        <div className="hero-copy">
          <span className="eyebrow">SignalSource Systems</span>
          <h1 className="hero-title">Digital Guides &amp; Playbooks for When Life Feels Like Too Much</h1>
          <p className="hero-subtitle">
            Practical, step-by-step systems to reduce overwhelm, get control of your money, 
            and build a better plan for the road ahead.
          </p>
          <div className="hero-actions">
            <a href={OVERWHELM_LINK} className="btn primary btn-lg">
              Start the 7-Day Overwhelm Reset – $39
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true" />
      </section>

      {/* B. Product Section 1 – Overwhelm Reset */}
      <section className="product-section reveal section-stack">
        <div className="product-header">
          <span className="step-label">Step 1 – Get Out of Overwhelm</span>
          <h2 className="section-title">2026 Overwhelm Reset – 7-Day System to Get Your Life Back Under Control</h2>
          <div className="price-tag">$39 – One-time</div>
        </div>
        <div className="product-content-grid">
          <div className="outcome-list">
            <div className="outcome-item">
              <CheckCircle2 size={24} className="accent-icon" />
              <p>Feel in control again in just 7 days without adding to your workload.</p>
            </div>
            <div className="outcome-item">
              <CheckCircle2 size={24} className="accent-icon" />
              <p>Simple daily prompts that cut through the noise—absolutely no fluff.</p>
            </div>
            <div className="outcome-item">
              <CheckCircle2 size={24} className="accent-icon" />
              <p>Specifically designed for people who already feel like they’re drowning in tasks and decisions.</p>
            </div>
          </div>
          <div className="product-footer">
            <a href={OVERWHELM_LINK} className="btn primary btn-lg">
              Start the 7-Day Overwhelm Reset – $39
            </a>
          </div>
        </div>
      </section>

      {/* C. Product Section 2 – Debt & Bills Dashboard */}
      <section className="product-section reveal section-stack darker-bg">
        <div className="product-header">
          <span className="step-label">Step 2 – Get Honest About the Money</span>
          <h2 className="section-title">Debt &amp; Bills Dashboard 2026 – A Zero-BS Plan to Stop Drowning</h2>
          <div className="price-tag">$47 – One-time</div>
        </div>
        <div className="product-content-grid">
          <div className="outcome-list">
            <div className="outcome-item">
              <TrendingUp size={24} className="accent-icon" />
              <p>See every bill, debt, and due date in one clear, honest place.</p>
            </div>
            <div className="outcome-item">
              <TrendingUp size={24} className="accent-icon" />
              <p>Turn financial chaos into a clear payoff timeline you can actually follow.</p>
            </div>
            <div className="outcome-item">
              <TrendingUp size={24} className="accent-icon" />
              <p>Built for people who avoid looking at their bank accounts because the stress is too high.</p>
            </div>
          </div>
          <div className="product-footer">
            <a href={DEBT_DASHBOARD_LINK} className="btn primary btn-lg">
              Add the Debt &amp; Bills Dashboard – $47
            </a>
          </div>
        </div>
      </section>

      {/* D. Product Section 3 – Digital Life & Income Pack */}
      <section className="product-section reveal section-stack highlight-border">
        <div className="product-header">
          <span className="step-label">Step 3 – Build the Full System</span>
          <h2 className="section-title">Digital Life &amp; Income Pack 2026</h2>
          <div className="price-tag highlight">$147 – One-time</div>
        </div>
        <div className="product-content-grid">
          <div className="outcome-list">
            <div className="outcome-item">
              <Package size={24} className="accent-icon" />
              <p>Combines life, money, and income systems into one fully integrated setup.</p>
            </div>
            <div className="outcome-item">
              <Package size={24} className="accent-icon" />
              <p>For when you’re done surviving week-to-week and ready to build something stable.</p>
            </div>
            <div className="outcome-item">
              <Package size={24} className="accent-icon" />
              <p>Complete with all templates, checklists, and frameworks for repeatable decisions.</p>
            </div>
            <div className="outcome-item">
              <Package size={24} className="accent-icon" />
              <p>Includes bonus transition and income-proofing playbooks for 2026.</p>
            </div>
          </div>
          <div className="product-footer">
            <a href={LIFE_INCOME_PACK_LINK} className="btn primary btn-lg highlight-btn">
              Get the Digital Life &amp; Income Pack – $147
            </a>
          </div>
        </div>
      </section>

      {/* E. FAQ Section */}
      <section className="section-stack reveal">
        <div className="section-header">
          <span className="eyebrow">Common Questions</span>
          <h2 className="section-title">Helpful clarity before you start.</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item content-card">
            <div className="faq-q">
              <HelpCircle size={18} />
              <h4>How do I access the digital products after purchasing?</h4>
            </div>
            <p className="faq-a section-copy">
              Immediately after your purchase is confirmed, you will receive an email from 
              Stripe/SignalSource with a secure download link. You can save the files to 
              your own computer or cloud storage for permanent access.
            </p>
          </div>
          <div className="faq-item content-card">
            <div className="faq-q">
              <HelpCircle size={18} />
              <h4>Is this a subscription or a one-time purchase?</h4>
            </div>
            <p className="faq-a section-copy">
              All guides and playbooks are one-time purchases. There are no recurring fees or sneaky 
              subscriptions. You buy the system once, and you own the download forever.
            </p>
          </div>
          <div className="faq-item content-card">
            <div className="faq-q">
              <HelpCircle size={18} />
              <h4>What if I’m already completely overwhelmed and behind?</h4>
            </div>
            <p className="faq-a section-copy">
              That is exactly what these were built for. They are not "extra work." They are 
              designed to replace the mental burden of figuring it out on your own with 
              simple, pre-built paths to follow.
            </p>
          </div>
          <div className="faq-item content-card">
            <div className="faq-q">
              <HelpCircle size={18} />
              <h4>What if I don’t live in Oak Harbor or I’m not military?</h4>
            </div>
            <p className="faq-a section-copy">
              These particular systems are built for anyone human. While SignalSource is rooted 
              in Oak Harbor, the digital guides are universal and work for any individual or 
              family looking to reset their baseline.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .storefront {
          display: grid;
          gap: 4rem;
          padding-bottom: 5rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-secondary);
          font-weight: 700;
          width: fit-content;
        }

        .product-section {
          padding: 4rem 3rem;
          border-radius: var(--radius-card);
          border: 1px solid var(--color-border-default);
          background: var(--color-background-surface);
        }

        .darker-bg {
          background: var(--color-background-secondary);
        }

        .highlight-border {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 40px rgba(163, 230, 53, 0.08);
        }

        .product-header {
          margin-bottom: 2.5rem;
        }

        .step-label {
          display: block;
          font-family: var(--font-label);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-primary);
          margin-bottom: 0.75rem;
        }

        .price-tag {
          display: inline-block;
          margin-top: 1rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .price-tag.highlight {
          color: var(--color-accent-primary);
          background: rgba(163, 230, 53, 0.1);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
        }

        .product-content-grid {
          display: grid;
          gap: 2.5rem;
        }

        .outcome-list {
          display: grid;
          gap: 1.5rem;
        }

        .outcome-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .outcome-item p {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
          line-height: 1.5;
          margin: 0;
        }

        .accent-icon {
          color: var(--color-accent-primary);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .faq-q {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-accent-primary);
          margin-bottom: 1rem;
        }

        .faq-q h4 {
          font-size: 1.05rem;
          margin: 0;
          color: var(--color-text-primary);
        }

        .faq-a {
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .btn-lg {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
        }

        .highlight-btn:hover {
          background: var(--color-accent-primary) !important;
          color: #000 !important;
          box-shadow: 0 0 30px rgba(163, 230, 53, 0.4);
        }

        @media (max-width: 768px) {
          .product-section {
            padding: 2.5rem 1.5rem;
          }
          
          .storefront {
            gap: 2.5rem;
          }

          .hero-title {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DigitalAssetsExamples;
