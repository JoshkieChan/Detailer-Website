import { Link } from 'react-router-dom';
import { CheckCircle2, MapPinned } from 'lucide-react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { PageSubtitle } from '../components/PageSubtitle';
import { detailingGalleryItems, detailingGallerySupportingImages } from '../config/detailingGallery';

const sliderSections = detailingGalleryItems.map((item) => ({
  ...item,
  heading: item.title.charAt(0).toUpperCase() + item.title.slice(1),
}));

// Set Hero image to the After image as requested
const heroImage = detailingGallerySupportingImages.find((image) => image.id === 'hero-image');

const OurWorkPage = () => {
  return (
    <div className="page-shell our-work-page">
      <header className="our-work-hero reveal">
        <div className="our-work-hero-copy">
          <span className="eyebrow">Our Work</span>
          <h1 className="hero-title">Real detailing results from Oak Harbor and Whidbey Island.</h1>
          <PageSubtitle className="our-work-hero-subtitle">
            A recent Subaru Outback reset, shown the way customers actually care about it:
            what it looked like before, what it looked like after, and what changed.
          </PageSubtitle>
        </div>

        <div className="our-work-hero-visual">
          {heroImage ? (
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="our-work-hero-image"
            />
          ) : null}
          <div className="our-work-hero-note">
            <span className="support-pill">
              <MapPinned size={16} />
              Garage studio service in Oak Harbor
            </span>
            <p>Featured reset with real before-and-after documentation from the same vehicle.</p>
          </div>
        </div>
      </header>

      <section className="our-work-intro section-panel reveal">
        <div className="section-header">
          <span className="eyebrow">Featured Reset</span>
          <h2 className="section-title">Subaru Outback | Deep Reset Detail (interior and exterior baseline reset)</h2>
          <div className="price-anchor">
            <p className="price-anchor-text">
              This was a Deep Reset Detail for a Subaru Outback, which typically runs in the $400–$550 range depending on condition. For exact pricing on your vehicle, check the <Link to="/pricing">Pricing page</Link>.
            </p>
          </div>
          <p className="section-copy">
            This Deep Reset Detail focused on the areas daily drivers usually feel first: dirty rear floors,
            cluttered storage spaces, dusty exterior surfaces, and wheels that make the whole
            vehicle look tired.
          </p>
          <div className="inline-cta">
            <p className="inline-cta-text">Want this kind of reset? Scroll down for more angles or <Link to="/pricing">jump straight to pricing</Link>.</p>
          </div>
        </div>
        <div className="our-work-intro-points">
          <div className="feature-row">
            <CheckCircle2 size={18} className="icon-lime" />
            <span className="feature-text">Real vehicle, real turnaround, no stock photography.</span>
          </div>
          <div className="feature-row">
            <CheckCircle2 size={18} className="icon-lime" />
            <span className="feature-text">Matched before/after comparisons for the areas customers notice fastest.</span>
          </div>
        </div>
      </section>

      <section className="our-work-sections">
        {sliderSections.map((item, index) => (
          <article
            key={item.id}
            className={`our-work-case reveal ${index % 2 === 1 ? 'our-work-case--reverse' : ''}`}
            data-reveal-delay={String(index)}
          >
            <div className="our-work-case-copy">
              <span className="eyebrow">{item.serviceTag}</span>
              <h2 className="section-title">{item.heading}</h2>
              <p className="section-copy">{item.summary}</p>
              <ul className="package-bullets">
                {item.detailPoints.map((point) => (
                  <li key={point} className="feature-row">
                    <CheckCircle2 size={18} className="icon-lime" />
                    <span className="feature-text">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="our-work-case-media">
              <BeforeAfterSlider
                items={[item]}
                showDetails={false}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="our-work-proof reveal">
        <div className="section-header">
          <span className="eyebrow">More Angles</span>
          <h2 className="section-title">Additional proof from the same vehicle</h2>
          <p className="section-copy">
            A few extra shots from the same reset so you can see the starting condition and
            the final finish across the cabin and exterior.
          </p>
        </div>

        <div className="our-work-proof-grid">
          {detailingGallerySupportingImages.filter(img => img.id !== 'wheel-after' && img.id !== 'hero-image').map((image, index) => (
            <figure
              key={image.id}
              className="our-work-proof-card reveal"
              data-reveal-delay={String(index % 3)}
            >
              <img src={image.src} alt={image.alt} className="our-work-proof-image" />
            </figure>
          ))}
        </div>
      </section>

      <section className="content-card reveal cta-block our-work-cta">
        <span className="eyebrow">Ready To Book</span>
        <h2 className="section-title">Want this kind of reset for your vehicle?</h2>
        <p className="section-copy">
          Choose your package, add any extras, and see today&apos;s deposit before you book.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary btn-lg">
            Configure Your Deep Reset
          </Link>
          <Link to="/pricing" className="btn secondary">
            See Pricing
          </Link>
        </div>
      </section>

      <style>{`
        .our-work-page {
          display: grid;
          gap: 2.5rem;
        }

        .our-work-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
          gap: 2rem;
          align-items: stretch;
        }

        .our-work-hero-copy {
          display: grid;
          gap: 1rem;
          align-content: center;
        }

        .our-work-hero-subtitle {
          margin-left: 0;
          margin-right: 0;
          text-align: left;
          max-width: 60ch;
        }

        .our-work-hero-visual {
          position: relative;
          overflow: hidden;
          min-height: 420px;
          border-radius: 24px;
          border: 1px solid var(--color-border-default);
          background: transparent;
          box-shadow: var(--shadow-hover);
        }

        .our-work-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          min-height: 420px;
        }

        .our-work-hero-note {
          position: absolute;
          left: 1.25rem;
          right: 1.25rem;
          bottom: 1.25rem;
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(15, 23, 32, 0.72);
          color: #f8fafc;
          backdrop-filter: blur(12px);
        }

        .our-work-hero-note .support-pill {
          width: fit-content;
          background: rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          border-color: rgba(255, 255, 255, 0.18);
        }

        .our-work-intro {
          display: grid;
          gap: 1rem;
        }

        .our-work-intro-points {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .price-anchor {
          padding: 1rem;
          background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-accent-primary) 15%, transparent);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .price-anchor-text {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--color-text-secondary);
        }

        .price-anchor-text a {
          color: var(--color-accent-primary);
          text-decoration: underline;
        }

        .inline-cta {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: color-mix(in srgb, var(--color-background-surface) 95%, var(--color-accent-primary) 5%);
          border-radius: 8px;
        }

        .inline-cta-text {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--color-text-secondary);
        }

        .inline-cta-text a {
          color: var(--color-accent-primary);
          font-weight: 500;
        }

        .our-work-sections {
          display: grid;
          gap: 1rem;
        }

        .our-work-case {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--color-border-default);
          border-radius: 24px;
          background: var(--color-background-surface);
        }

        .our-work-case--reverse {
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
        }

        .our-work-case--reverse .our-work-case-copy {
          order: 2;
        }

        .our-work-case--reverse .our-work-case-media {
          order: 1;
        }

        .our-work-case-copy {
          display: grid;
          gap: 0.75rem;
        }

        .our-work-case-media {
          min-width: 0;
        }

        .our-work-proof {
          display: grid;
          gap: 1.5rem;
        }

        .our-work-proof-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .our-work-proof-card {
          margin: 0;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid var(--color-border-default);
          background: transparent;
          box-shadow: var(--shadow-hover);
        }

        .our-work-proof-image {
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          object-position: center top;
          min-height: 300px;
        }

        @media (max-width: 980px) {
          .our-work-hero,
          .our-work-case,
          .our-work-case--reverse {
            grid-template-columns: 1fr;
          }

          .our-work-case--reverse .our-work-case-copy,
          .our-work-case--reverse .our-work-case-media {
            order: initial;
          }

          .our-work-proof-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .our-work-page {
            gap: 2rem;
          }

          .our-work-hero-visual,
          .our-work-case,
          .our-work-intro,
          .our-work-cta {
            border-radius: 20px;
          }

          .our-work-intro-points,
          .our-work-proof-grid {
            grid-template-columns: 1fr;
          }

          .our-work-case {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OurWorkPage;
