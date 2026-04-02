import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Memberships', path: '/memberships' },
    { name: 'About', path: '/about' },
    { name: 'More', path: '/hub' },
    { name: 'FAQ', path: '/faq' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (revealNodes.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Theme Cycler
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Monitor size={18} />;
  };

  return (
    <div className="layout">
      {/* Navbar */}
      <header className="navbar glass-nav">
        <div className="navbar-inner">
          <Link to="/detailing" className="brand">
            <span className="brand-icon">S</span>
            <span className="brand-text">SIGNALSOURCE</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={location.pathname === link.path ? 'nav-link active' : 'nav-link'}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme} 
              aria-label={`Current theme: ${theme}. Click to switch.`}
              title={`Switch theme (Current: ${theme})`}
            >
              {getThemeIcon()}
              <span className="sr-only">{theme}</span>
            </button>


          </nav>

          {/* Mobile Actions */}
          <div className="mobile-actions">
            <button className="theme-toggle-btn mobile-only" onClick={toggleTheme}>
              {getThemeIcon()}
            </button>
            <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`mobile-nav glass-nav ${isMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      {/* Footer / Contact Bar (Matches bottom of flyer) */}
      <footer className="footer-bar">
        <div className="container footer-bar-container">
          <div className="footer-left">
            <h2 className="brand-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>SIGNALSOURCE</h2>
            <p className="positioning-statement">Systems-driven car care and local service automation based in Oak Harbor, WA.</p>
            <p className="serving-text mt-1">Serving Oak Harbor, NAS Whidbey & surrounding areas.</p>
            <p className="footer-hours">By appointment only • Monday–Saturday</p>
            <p className="footer-legal">Fully Licensed & Insured • Whidbey Island, WA</p>
            <p className="coming-soon mt-1">Coming Soon: Window Tint, Ceramic Coatings, PPF & Wraps</p>
          </div>
          <div className="footer-right">
            <a href="tel:9049937503" className="contact-pill">
              <Phone size={18} />
              <span>(904) 993-7503</span>
            </a>
            <a href="mailto:jcab@signaldatasource.com" className="contact-pill">
              <Mail size={18} />
              <span>jcab@signaldatasource.com</span>
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.9rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .glass-nav {
          background: var(--color-background-surface);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        
        .navbar-inner { 
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 2.25rem;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .brand { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .brand-icon {
          background: var(--color-accent-primary);
          color: var(--color-button-primary-text);
          font-weight: 800;
          font-size: 1.15rem;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          box-shadow: inset 0 0 0 1px rgba(15, 23, 32, 0.08);
        }
        .brand-text {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.22rem;
          color: var(--color-text-primary);
          letter-spacing: 0.08em;
        }
        
        .desktop-nav { 
          display: flex; 
          align-items: center; 
          gap: 1.3rem; 
          flex-wrap: nowrap; 
        }
        .nav-link {
          font-family: var(--font-label);
          font-weight: 700;
          font-size: 0.74rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          position: relative;
          padding: 0.4rem 0.55rem;
          transition: color var(--transition-fast);
        }
        .nav-link:hover,
        .nav-link.active {
          color: var(--color-text-primary);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          left: 0.55rem;
          right: 0.55rem;
          bottom: -0.25rem;
          height: 2px;
          border-radius: 999px;
          background: var(--color-accent-primary);
        }
        
        .theme-toggle-btn {
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
          border-radius: 999px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .theme-toggle-btn:hover {
          background: var(--color-background-soft);
          color: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          transform: translateY(-2px);
        }
        .theme-toggle-btn .sr-only { display: none; }
        
        .mobile-actions { display: none; align-items: center; gap: 1rem; }
        .mobile-only { display: flex !important; }
        .mobile-toggle {
          background: transparent;
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 999px;
        }
        
        .mobile-nav {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: calc(100% + 0.4rem);
          left: 1rem;
          right: 1rem;
          padding: 0 1.5rem;
          border: 1px solid var(--color-border-default);
          border-radius: 20px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: all 0.3s ease-in-out;
          visibility: hidden;
          box-shadow: var(--shadow-hover);
        }
        .mobile-nav.open { max-height: 500px; opacity: 1; padding: 1.5rem; visibility: visible; }
        
        .mobile-nav-link {
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border-default);
          font-size: 1rem;
          color: var(--color-text-primary);
          font-weight: 700;
        }
        .mobile-nav-link:last-child { border-bottom: none; }
        
        .main-content { flex: 1; }
        
        .footer-bar {
          background-color: var(--color-accent-primary);
          color: var(--color-button-primary-text);
          padding: 3rem 0;
          margin-top: 4rem;
        }
        .footer-bar-container { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
        .footer-left h2 {
          color: var(--color-button-primary-text);
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 0.8rem;
          letter-spacing: -0.04em;
        }
        .positioning-statement,
        .footer-hours,
        .footer-legal,
        .coming-soon {
          color: rgba(15, 23, 32, 0.78);
        }
        .serving-text {
          font-family: var(--font-label);
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .coming-soon { font-size: 0.9rem; font-weight: 700; }
        
        .footer-right { display: flex; flex-direction: column; gap: 1rem; min-width: 300px; }
        .contact-pill {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 32, 0.94);
          color: #f8fafc;
          padding: 1rem 1.5rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1rem;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), color var(--transition-fast);
        }
        .contact-pill:hover {
          transform: translateY(-2px);
          color: var(--color-accent-primary);
          box-shadow: 0 12px 28px rgba(15, 23, 32, 0.18);
        }
        .contact-pill svg { color: var(--color-accent-primary); }
        
        @media (max-width: 1048px) {
          .navbar-inner {
            justify-content: space-between;
            gap: 0;
          }
          .footer-bar-container { flex-direction: column; text-align: center; }
          .footer-right { width: 100%; }
        }
        
        @media (max-width: 1200px) {
          .desktop-nav { display: none; }
          .mobile-actions { display: flex; }
          .footer-left h2 { font-size: 1.9rem; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
