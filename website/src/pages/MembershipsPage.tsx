import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { maintenancePlans } from '../data/maintenancePlans';

const MembershipsPage = () => {
  return (
    <div className="memberships-page container">
      <div className="page-header text-center">
        <h1>Maintenance Plans</h1>
        <p>Keep your vehicle spotless year-round on your schedule.</p>
      </div>

      <div className="plans-grid">
        {maintenancePlans.map((plan) => (
          <div key={plan.id} className={`plan-card glass ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="badge">POPULAR</div>}
            <h2 className={plan.popular ? 'highlight-lime' : ''}>{plan.name}</h2>
            <div className="plan-price">{plan.monthlyPrice}<span>/mo</span></div>
            <p className="plan-desc">
              <span>{plan.monthlyEquivalent} for comparison.</span>
              <span>{plan.billingLine}</span>
            </p>
            <ul className="plan-features">
              {plan.features.map((feature) => (
                <li key={feature}><CheckCircle size={20} className="icon-lime" /> {feature}</li>
              ))}
            </ul>
            <Link to="/booking" className={`btn ${plan.popular ? 'primary' : 'outline-lime'} w-full mt-1`}>
              {plan.ctaLabel}
            </Link>
          </div>
        ))}
      </div>

      <div className="fine-print text-center mt-4">
        <p><em>* Memberships require an initial Deep Reset Detail to establish a clean baseline.</em></p>
        <p><em>* Cancel anytime after 3 months. Minimum commitment required.</em></p>
      </div>

      <style>{`
        .memberships-page { padding: 4rem 1.5rem; max-width: 1000px; }
        .page-header { margin-bottom: 4rem; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--color-text-muted); }
        
        .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: stretch; margin-top: 2rem; }
        .plan-card { padding: 3rem; position: relative; display: flex; flex-direction: column; }
        .popular { border: 2px solid var(--color-accent-lime); background: rgba(158, 255, 0, 0.05); transform: scale(1.05); }
        .badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--color-accent-lime); color: #000; padding: 0.25rem 1.5rem; border-radius: 20px; font-weight: 900; letter-spacing: 1px; font-size: 0.85rem; }
        
        .plan-card h2 { font-size: 2.25rem; margin-bottom: 1rem; text-align: center; }
        .plan-price { font-size: 4rem; font-weight: 800; text-align: center; margin-bottom: 1rem; color: var(--color-text-main); line-height: 1; }
        .plan-price span { font-size: 1.5rem; color: var(--color-text-muted); font-weight: 600; }
        .plan-desc { text-align: center; color: var(--color-text-muted); margin-bottom: 2rem; min-height: 72px; font-size: 1.05rem; display: flex; flex-direction: column; gap: 0.4rem; }
        
        .plan-features { list-style: none; padding: 0; margin-bottom: 3rem; flex-grow: 1; display: flex; flex-direction: column; gap: 1rem; }
        .plan-features li { display: flex; align-items: start; gap: 1rem; font-size: 1.1rem; font-weight: 600; }
        .icon-lime { color: var(--color-accent-lime); flex-shrink: 0; margin-top: 0.1rem; }
        
        .fine-print p { color: var(--color-text-muted); margin-bottom: 0.5rem; font-size: 0.95rem; }
        
        @media (max-width: 768px) {
          .plans-grid { grid-template-columns: 1fr; gap: 4rem; margin-top: 3rem; }
          .popular { transform: scale(1); }
          .plan-card { padding: 2.5rem 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default MembershipsPage;
