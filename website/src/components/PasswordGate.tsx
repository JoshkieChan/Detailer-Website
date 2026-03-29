import { useState, useEffect } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('site_unlocked') === 'true';
  });
  const [error, setError] = useState(false);

  const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD || 'detailing2024';

  useEffect(() => {
    // SEO: Inject noindex tag while locked
    if (!isUnlocked) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      meta.id = 'seo-lock-meta';
      document.head.appendChild(meta);
    }

    return () => {
      const meta = document.getElementById('seo-lock-meta');
      if (meta) meta.remove();
    };
  }, [isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      localStorage.setItem('site_unlocked', 'true');
      setIsUnlocked(true);
      setError(false);
      
      // Remove SEO lock immediately
      const meta = document.getElementById('seo-lock-meta');
      if (meta) meta.remove();
    } else {
      setError(true);
      setPassword('');
      // Shake animation effect could be added here
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="password-gate-overlay">
      <div className="password-card glass">
        <div className="card-header">
          <div className="icon-wrapper">
            <Lock size={32} className="lock-icon" />
          </div>
          <h1>Private Beta</h1>
          <p>SignalSource is currently in a private testing phase. Please enter the password to view the site.</p>
        </div>

        <form onSubmit={handleUnlock} className="password-form">
          <div className={`input-group ${error ? 'error' : ''}`}>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <div className="error-msg">
                <ShieldAlert size={14} />
                <span>Incorrect password. Please try again.</span>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary submit-btn">
            Unlock Access
          </button>
        </form>

        <div className="card-footer">
          <p>© 2026 SignalSource. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .password-gate-overlay {
          position: fixed;
          inset: 0;
          background-color: #0f131f; /* Matches --color-bg */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .password-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2.5rem;
          text-align: center;
          border-radius: 24px;
          background: rgba(15, 19, 31, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: cardSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(158, 255, 0, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .lock-icon {
          color: #9eff00; /* --color-accent-lime */
        }

        h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.75rem;
          letter-spacing: -0.5px;
        }

        p {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .password-form {
          margin-top: 2rem;
        }

        .input-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }

        input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          color: #fff;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        input:focus {
          border-color: #9eff00;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(158, 255, 0, 0.1);
        }

        .input-group.error input {
          border-color: #ef4444; /* Error red */
          background: rgba(239, 68, 68, 0.05);
        }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #9eff00;
          color: #000;
          border: none;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(158, 255, 0, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .card-footer {
          margin-top: 2.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.5rem;
        }

        .card-footer p {
          font-size: 0.75rem;
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
};

export default PasswordGate;
