import { useState } from 'react';
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
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .glass-nav {
          background: rgba(15, 19, 31, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        [data-theme='light'] .glass-nav {
          background: rgba(255, 255, 255, 0.9);
        }
        [data-theme='light'] .brand-text {
          color: #0f172a;
        }
        
        .navbar-inner { 
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 3rem; /* Balanced gap between logo and nav on wide screens */
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .brand { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .brand-icon { background: var(--color-accent-lime); color: #000; font-weight: 800; font-size: 1.25rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        .brand-text { font-family: var(--font-heading); font-weight: 900; font-size: 1.5rem; color: #fff; letter-spacing: 0.5px; }
        
        .desktop-nav { 
          display: flex; 
          align-items: center; 
          gap: 2.25rem; 
          flex-wrap: nowrap; 
        }
        .nav-link { font-weight: 600; font-size: 0.95rem; color: var(--color-text-main); opacity: 0.8; text-transform: uppercase; letter-spacing: 0.8px; position: relative; padding: 0.25rem 0.5rem; transition: opacity 0.2s ease; transition: color 0.2s ease; }
        .nav-link:hover, .nav-link.active { opacity: 1; color: var(--color-accent-lime); }
        .nav-link-special { 
          font-weight: 800; font-size: 0.9rem; color: var(--color-accent-lime); text-transform: uppercase; letter-spacing: 0.5px; border: 1px dashed var(--color-accent-lime); padding: 0.5rem 1rem; border-radius: 4px; transition: all var(--transition-fast);
        }
        .nav-link-special:hover { background: rgba(158, 255, 0, 0.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(158, 255, 0, 0.2); }
        .nav-btn { font-size: 0.9rem; padding: 0.6rem 1.5rem; }
        
        .theme-toggle-btn {
          background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast);
        }
        .theme-toggle-btn:hover { background: rgba(158, 255, 0, 0.1); color: var(--color-accent-lime); border-color: var(--color-accent-lime); }
        .theme-toggle-btn .sr-only { display: none; }
        
        .mobile-actions { display: none; align-items: center; gap: 1rem; }
        .mobile-only { display: flex !important; }
        .mobile-toggle { background: none; border: none; color: var(--color-text-main); display: flex; align-items: center; justify-content: center; }
        
        .mobile-nav {
          display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; padding: 0 1.5rem; border-bottom: 1px solid var(--color-border); max-height: 0; overflow: hidden; opacity: 0; transition: all 0.3s ease-in-out; visibility: hidden;
        }
        .mobile-nav.open { max-height: 500px; opacity: 1; padding: 1.5rem; visibility: visible; }
        
        .mobile-nav-link { padding: 1rem 0; border-bottom: 1px solid var(--color-border); font-size: 1.1rem; color: var(--color-text-main); font-weight: 700; }
        .mobile-nav-link-special { 
          padding: 1rem 0; font-size: 1.1rem; color: var(--color-accent-lime); font-weight: 800; border-bottom: 1px dashed var(--color-accent-lime); text-transform: uppercase;
        }
        .mobile-nav-btn { margin-top: 1.5rem; width: 100%; }
        
        .main-content { flex: 1; }
        
        .footer-bar { background-color: var(--color-footer-bg); color: var(--color-footer-text); padding: 3rem 0; margin-top: 4rem; }
        .footer-bar-container { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
        .footer-left h2 { color: var(--color-footer-text); font-size: 2.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 1rem; letter-spacing: -1px; }
        .serving-text { font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; margin-bottom: 0.5rem; }
        .coming-soon { font-size: 0.85rem; font-weight: 600; opacity: 0.8; }
        
        .footer-right { display: flex; flex-direction: column; gap: 1rem; min-width: 300px; }
        .contact-pill { display: flex; align-items: center; gap: 1rem; background: #0f131f; color: #fff; padding: 1rem 1.5rem; border-radius: 999px; font-weight: 700; font-size: 1.1rem; transition: transform var(--transition-fast); }
        .contact-pill:hover { transform: translateY(-2px); color: var(--color-accent-lime); }
        .contact-pill svg { color: var(--color-accent-lime); }
        
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
          .footer-left h2 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
