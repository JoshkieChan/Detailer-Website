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
    <div className={`flyer-card style-${themeStyle || 'lime'} ${highlight ? 'highlight-card' : ''}`}>
      {highlight && <div className="badge-popular">POPULAR</div>}
      {highlight && <div className="star-icon"><Sparkles size={20} /></div>}
      
      <h3>{title}</h3>
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
      
      <div className="price-line">From <span className={highlight ? 'highlight-lime' : ''}>${price}</span></div>
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
    </div>
  );
};
