import { CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

interface FeatureRowProps {
  text: string;
}

// 1. Reusable FeatureRow for perfectly consistent icon sizing and line height
export const FeatureRow = ({ text }: FeatureRowProps) => (
  <li className="feature-row">
    <CheckCircle className="icon-lime" size={20} strokeWidth={2.5} />
    <span className="feature-text">{text}</span>
  </li>
);

export interface ServiceCardProps {
  title: string;
  description: string;
  bestFor?: string;
  price: string;
  priceNote?: string;
  features: string[];
  packageId: string;
  highlight?: boolean;
  themeStyle?: 'blue' | 'lime' | 'purple';
}

// Uniform Card Structure
export const ServiceCard = ({
  title,
  description,
  bestFor,
  price,
  priceNote,
  features,
  packageId,
  highlight,
  themeStyle,
}: ServiceCardProps) => {
  return (
    <article className={`service-tier-card surface-card tone-${themeStyle || 'lime'} ${highlight ? 'featured' : ''}`}>
      <div className="service-tier-top">
        <div>
          {highlight && <div className="badge-popular">Popular</div>}
          <h3>{title}</h3>
        </div>
        {highlight && (
          <div className="service-tier-spark">
            <Sparkles size={18} />
          </div>
        )}
      </div>
      
      <p className="package-desc">{description}</p>
      {bestFor && (
        <p className="package-best-for">
          <strong>Best for:</strong> {bestFor}
        </p>
      )}
      
      <ul className="package-bullets">
        {features.map((feat, i) => (
          <FeatureRow key={i} text={feat} />
        ))}
      </ul>
      
      <div className="price-line">
        <span className="price-prefix">From</span>
        <span className={highlight ? 'highlight-lime' : ''}>${price}</span>
      </div>
      {priceNote && <p className="package-price-note">{priceNote}</p>}
      
      <Link
        to={`/booking?package=${packageId}`}
        className={`btn w-full mt-1 ${highlight ? 'primary' : 'outline-lime'}`}
        onClick={() =>
          trackEvent('Detailing Lead - Booking Page', {
            cta: 'package_book_now',
            package_id: packageId,
          })
        }
      >
        Book Now
      </Link>
    </article>
  );
};
