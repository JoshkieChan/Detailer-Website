import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './components/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SEO } from './components/SEO';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import MembershipsPage from './pages/MembershipsPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import SystemsPage from './pages/SystemsPage';
import HubPage from './pages/HubPage';
import DigitalAssetsExamples from './pages/DigitalAssetsExamples';
import LocalSystemsExamples from './pages/LocalSystemsExamples';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BookingThanksPage from './pages/BookingThanksPage';
import TripwirePage from './pages/TripwirePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import OwnerSchedulePage from './pages/OwnerSchedulePage';
import OurWorkPage from './pages/OurWorkPage';
import { useState, useEffect } from 'react';

function App() {
  // Defer non-critical scripts to improve INP and initial load times on mobile.
  const [loadAnalytics, setLoadAnalytics] = useState(false);

  useEffect(() => {
    // Wait until the main thread has likely settled before injecting tracking
    const timer = setTimeout(() => setLoadAnalytics(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/detailing" element={<><SEO /><HomePage /></>} />
                <Route path="/services" element={<><SEO title="Services" description="Professional car detailing services including interior, exterior, paint correction, and maintenance packages." /><ServicesPage /></>} />
                <Route path="/our-work" element={<><SEO title="Our Work" description="View our portfolio of professionally detailed vehicles in Oak Harbor, WA." /><OurWorkPage /></>} />
                <Route path="/pricing" element={<><SEO title="Pricing" description="Transparent pricing for all car detailing packages. Maintenance, deep reset, and add-on services." /><PricingPage /></>} />
                <Route path="/memberships" element={<><SEO title="Memberships" description="Join our car detailing membership program for regular maintenance and exclusive benefits." /><MembershipsPage /></>} />
                <Route path="/about" element={<><SEO title="About" description="Learn about SignalSource, our professional car detailing services in Oak Harbor, WA." /><AboutPage /></>} />
                <Route path="/faq" element={<><SEO title="FAQ" description="Frequently asked questions about our car detailing services, pricing, and booking process." /><FAQPage /></>} />
                <Route path="/hub" element={<><SEO title="Hub" description="Access all SignalSource resources and information from one central hub." /><HubPage /></>} />
                <Route path="/systems" element={<><SEO title="Systems" description="Information about our detailing systems and processes." /><SystemsPage /></>} />
                <Route path="/booking" element={<><SEO title="Book Now" description="Schedule your professional car detailing appointment in Oak Harbor, WA." /><BookingPage /></>} />
                <Route path="/privacy" element={<><SEO title="Privacy Policy" description="SignalSource privacy policy for car detailing services." /><PrivacyPage /></>} />
                <Route path="/terms" element={<><SEO title="Terms of Service" description="SignalSource terms of service for car detailing bookings." /><TermsPage /></>} />
                <Route path="/owner/schedule" element={<><SEO title="Owner Schedule" description="Owner schedule management for SignalSource car detailing." noindex /><OwnerSchedulePage /></>} />
                <Route path="/" element={<><SEO /><HomePage /></>} />
                <Route path="/systems/examples/digital-assets" element={<DigitalAssetsExamples />} />
                <Route path="/systems/examples/local-systems" element={<LocalSystemsExamples />} />
                <Route path="/booking/thanks" element={<BookingThanksPage />} />
                <Route path="/booking/confirmation" element={<ConfirmationPage />} />
                <Route path="/snapshot/order" element={<TripwirePage />} />
              </Routes>
            </Layout>
          </Router>
          {loadAnalytics && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
