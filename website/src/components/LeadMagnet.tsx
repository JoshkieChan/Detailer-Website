import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface LeadMagnetProps {
  redirectUrl?: string;
  className?: string;
}

export const LeadMagnet = ({ redirectUrl, className = '' }: LeadMagnetProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');

    try {
      // In production, this would POST to an n8n webhook or similar automation.
      // E.g., await fetch(import.meta.env.VITE_LEAD_MAGNET_WEBHOOK || '', { method: 'POST', body: JSON.stringify({ email }) });
      
      // Simulate network lag
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus('success');

      if (redirectUrl) {
        // Short delay to show success state before redirecting
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1200);
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`lead-magnet-block success reveal is-visible ${className}`}>
        <CheckCircle2 className="success-icon" size={32} />
        <div className="lead-magnet-copy">
          <h3>
            {redirectUrl ? 'Success! Redirecting...' : 'Snapshot is on the way!'}
          </h3>
          <p className="section-copy">
            {redirectUrl 
              ? 'Taking you to your special offer now.' 
              : 'Check your inbox. The Life & Money Snapshot PDF is heading to your email now.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`lead-magnet-block reveal ${className}`}>
      <div className="lead-magnet-copy">
        <span className="eyebrow">Free Resource</span>
        <h3>Life &amp; Money Snapshot – Free 1-Page PDF</h3>
        <p className="section-copy">
          A single-page worksheet to see your life load and money picture in under 10 minutes. 
          Fill it out once, and you’ll know exactly how overwhelmed you are, how scattered your 
          bills and debts are, and what to fix first.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="lead-magnet-form">
        <div className="input-group">
          <label htmlFor="lead-email" className="sr-only">Email address</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" aria-hidden="true" />
            <input
              id="lead-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'submitting'}
              autoComplete="email"
            />
          </div>
        </div>
        <button type="submit" className="btn primary btn-lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Sending...
            </>
          ) : (
            'Get the Snapshot'
          )}
        </button>
        {status === 'error' && (
          <p className="error-text">Something went wrong. Please try again or contact us directly.</p>
        )}
      </form>
    </div>
  );
};
