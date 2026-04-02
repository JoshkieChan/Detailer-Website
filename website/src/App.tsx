import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './components/ThemeContext';
import PasswordGate from './components/PasswordGate';
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

function App() {
  return (
    <ThemeProvider>
      <PasswordGate>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/memberships" element={<MembershipsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/hub" element={<HubPage />} />
              <Route path="/systems" element={<SystemsPage />} />
              <Route path="/systems/examples/digital-assets" element={<DigitalAssetsExamples />} />
              <Route path="/systems/examples/local-systems" element={<LocalSystemsExamples />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/confirmation" element={<ConfirmationPage />} />
            </Routes>
          </Layout>
        </Router>
      </PasswordGate>
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;
