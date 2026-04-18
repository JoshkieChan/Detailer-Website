import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './components/ThemeContext';

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
    <ThemeProvider>

        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HubPage />} />
              <Route path="/detailing" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/memberships" element={<MembershipsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              {/* Keep /hub as an alias if needed, though / is the primary now. */}
              <Route path="/hub" element={<HubPage />} />
              <Route path="/systems" element={<SystemsPage />} />
              <Route path="/systems/examples/digital-assets" element={<DigitalAssetsExamples />} />
              <Route path="/systems/examples/local-systems" element={<LocalSystemsExamples />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/thanks" element={<BookingThanksPage />} />
              <Route path="/booking/confirmation" element={<ConfirmationPage />} />
              <Route path="/owner/schedule" element={<OwnerSchedulePage />} />
              <Route path="/snapshot/order" element={<TripwirePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
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
  );
}

export default App;
