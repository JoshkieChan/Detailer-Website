import { Link } from 'react-router-dom';
import { ServiceCard } from '../components/ServiceCard';
import { servicePackages } from '../data/packages';

const PricingPage = () => {
  return (
    <div className="pricing-page container">
      <div className="page-header text-center">
        <h1>Transparent Pricing</h1>
        <p>No hidden fees. Just honest pricing for top-tier detailing.</p>
      </div>

      <div className="packages-grid">
        {servicePackages.map(pkg => (
          <ServiceCard 
            key={pkg.id}
            title={pkg.title}
            description={pkg.description}
            price={pkg.price}
            features={pkg.features}
            packageId={pkg.id}
            highlight={pkg.highlight}
            themeStyle={pkg.themeStyle}
          />
        ))}
      </div>

      <div className="pricing-note glass text-center">
        <p><strong>Note:</strong> Final pricing may vary based on vehicle size and condition. We'll confirm everything before your deposit is charged.</p>
      </div>

      <div className="text-center mt-4">
        <Link to="/booking" className="btn primary btn-lg">Book Your Detail Now</Link>
      </div>

      <style>{`
        .pricing-page { padding: 4rem 1.5rem; max-width: 1100px; }
        .page-header { margin-bottom: 4rem; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--color-text-muted); }
        
        .packages-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; align-items: stretch; margin-bottom: 4rem; }
        .flyer-card { background: var(--color-bg-card-dark); padding: 2.5rem; border-radius: 12px; position: relative; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); transition: all var(--transition-fast); display: flex; flex-direction: column; }
        .flyer-card:hover { transform: translateY(-5px); box-shadow: var(--card-shadow-hover); border-color: var(--color-border-hover); }
        .flyer-card h3 { font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; }
        .package-desc { color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; min-height: 45px; }
        
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
        
        .pricing-note { padding: 1.5rem; border-radius: var(--radius-md); max-width: 800px; margin: 0 auto 3rem; color: var(--color-text-muted); font-size: 0.95rem; border-left: 4px solid var(--color-accent-lime); }
        .pricing-note strong { color: var(--color-text-main); }
        [data-theme='light'] .pricing-note { background: #fdfef9; border-color: #559300; }

        @media (max-width: 900px) {
          .packages-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
