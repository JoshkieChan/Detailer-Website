import { useMemo, useState } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

const OWNER_SESSION_STORAGE_KEY = 'signalsource_owner_mode';

export const getStoredOwnerPasscode = () =>
  sessionStorage.getItem(OWNER_SESSION_STORAGE_KEY) || '';

export const clearStoredOwnerPasscode = () =>
  sessionStorage.removeItem(OWNER_SESSION_STORAGE_KEY);

export const storeOwnerPasscode = (value: string) =>
  sessionStorage.setItem(OWNER_SESSION_STORAGE_KEY, value);

export const OwnerGate = ({
  children,
  onVerify,
}: {
  children: React.ReactNode;
  onVerify: (passcode: string) => Promise<boolean>;
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasStoredPasscode = useMemo(() => Boolean(getStoredOwnerPasscode()), []);

  const [isUnlocked, setIsUnlocked] = useState(hasStoredPasscode);

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const ok = await onVerify(password);
      if (!ok) {
        setError('Incorrect owner passcode.');
        setPassword('');
        setIsLoading(false);
        return;
      }

      storeOwnerPasscode(password);
      setIsUnlocked(true);
    } catch {
      setError('Owner tools are unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <section className="content-card owner-gate-card">
      <div className="support-pill">
        <Lock size={16} />
        Owner mode
      </div>
      <h1 className="section-title">Unlock owner scheduling tools.</h1>
      <p className="section-copy">
        This view exposes customer details, manual booking controls, and blackout management.
      </p>

      <form className="owner-gate-form" onSubmit={handleUnlock}>
        <label htmlFor="owner-passcode">Owner passcode</label>
        <input
          id="owner-passcode"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter owner passcode"
        />
        {error ? (
          <p className="field-error-msg">
            <ShieldAlert size={13} className="field-error-icon" />
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn primary" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Unlock owner mode'}
        </button>
      </form>
    </section>
  );
};
