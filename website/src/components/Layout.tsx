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
            <h2 className="brand-text footer-brand-heading">SIGNALSOURCE</h2>
            <p className="positioning-statement">Systems-driven car care and local service automation based in Oak Harbor, WA.</p>
            <p className="serving-text mt-1">Serving Oak Harbor, NAS Whidbey & surrounding areas.</p>
            <p className="footer-hours">By appointment only • Monday–Saturday</p>
            <p className="footer-legal">Fully Licensed & Insured • Whidbey Island, WA</p>
            <div className="footer-legal-links mt-1">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link to="/terms">Terms of Service</Link>
            </div>
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
    </div>
  );
};

export default Layout;
