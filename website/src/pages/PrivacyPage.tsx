import { ChevronLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="page-shell legal-page">
      <Link to="/hub" className="back-link reveal">
        <ChevronLeft size={15} />
        Back to Hub
      </Link>

      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Privacy & Data</span>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Effective Date: April 4, 2026. How SignalSource collects, uses, and safeguards your information.
          </p>
          <div className="hero-actions">
            <a href="/privacy.pdf" download className="btn primary">
              <Download size={18} />
              Download PDF
            </a>
          </div>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="section-stack legal-content reveal">
        <div className="legal-section">
          <h2>1. INTRODUCTION</h2>
          <p>
            Welcome to SignalSource ("we", "our", "us"). We are committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            visit our website <a href="https://www.signaldatasource.com">https://www.signaldatasource.com</a>. 
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
            please do not access the site.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. INFORMATION WE COLLECT</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
          
          <h3>2.1 Personal Data</h3>
          <p>
            Personally identifiable information, such as your name, business name, job title, email address,
            telephone number, and billing address that you voluntarily provide to us when you sign up for an
            account, request a demo, or otherwise interact with SignalSource.
          </p>

          <h3>2.2 Derivative Data</h3>
          <p>
            Information our servers automatically collect when you access the Site, such as your IP
            address, your browser type, your operating system, your access times, and the pages you have
            viewed directly before and after accessing the Site.
          </p>

          <h3>2.3 Financial Data</h3>
          <p>
            We do not store full payment card numbers on our systems. Payments are processed by our
            third-party payment processor (such as Stripe), which collects and processes your payment
            information directly. We may receive limited information related to billing status (e.g., last 4 digits
            of card, card brand, and expiration month/year).
          </p>
        </div>

        <div className="legal-section">
          <h2>3. USE OF YOUR INFORMATION</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
          <ul>
            <li>3.1. Create and manage your account.</li>
            <li>3.2. Email you regarding your account or order.</li>
            <li>3.3. Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            <li>3.4. Increase the efficiency and operation of the Site.</li>
            <li>3.5. Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>3.6. Notify you of updates to the Site.</li>
            <li>3.7. Offer new products, services, and/or recommendations to you.</li>
            <li>3.8. Perform other business activities as needed.</li>
            <li>3.9. Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            <li>3.10. Process payments and refunds.</li>
            <li>3.11. Request feedback and contact you about your use of the Site.</li>
            <li>3.12. Resolve disputes and troubleshoot problems.</li>
            <li>3.13. Respond to product and customer service requests.</li>
            <li>3.14. Solicit support for the Site.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. DISCLOSURE OF YOUR INFORMATION</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          
          <h3>4.1 By Law or to Protect Rights</h3>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to
            investigate or remedy potential violations of our policies, or to protect the rights, property, and
            safety of others, we may share your information as permitted or required by any applicable law,
            rule, or regulation.
          </p>

          <h3>4.2 Third-Party Service Providers</h3>
          <p>
            We may share your information with third parties that perform services for us or on our behalf,
            including payment processing, data analysis, email delivery, hosting services, customer service,
            and marketing assistance.
          </p>

          <h3>4.3 Marketing Communications</h3>
          <p>
            With your consent, or with an opportunity for you to withdraw consent, we may share your
            information with third parties for marketing purposes, as permitted by law.
          </p>

          <h3>4.4 Business Transfers</h3>
          <p>
            We may share or transfer your information in connection with, or during negotiations of, any
            merger, sale of company assets, financing, or acquisition of all or a portion of our business to
            another company.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. TRACKING TECHNOLOGIES</h2>
          <h3>5.1 Cookies and Web Beacons</h3>
          <p>
            We may use cookies, web beacons, tracking technologies, and other tracking technologies on the Site
            to help customize the Site and improve your experience. We use privacy-focused analytics tools
            (such as Vercel Web Analytics) to understand how visitors use our site.
          </p>

          <h3>5.2 Website Analytics</h3>
          <p>
            We may also partner with selected third-party vendors to allow tracking technologies and
            remarketing services on the Site through the use of first party cookies and third-party cookies, to
            analyze and track users' use of the Site, determine the popularity of certain content, and better
            understand online activity.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. THIRD-PARTY WEBSITES</h2>
          <p>
            The Site may contain links to third-party websites and applications of interest, including
            advertisements and external services, that are not affiliated with us. Once you have used these
            links to leave the Site, any information you provide to these third parties is not covered by this
            Privacy Policy.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. SECURITY OF YOUR INFORMATION</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal
            information. While we have taken reasonable steps to secure the personal information you
            provide to us, please be aware that despite our efforts, no security measures are perfect or
            impenetrable.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. POLICY FOR CHILDREN</h2>
          <p>
            We do not knowingly solicit information from or market to children under the age of 13. If you
            become aware of any data we have collected from children under age 13, please contact us
            using the contact information provided below.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p>
            Most web browsers and some mobile operating systems include a Do-Not-Track ("DNT") feature
            or setting you can activate to signal your privacy preference not to have data about your online
            browsing activities monitored and collected.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. OPTIONS REGARDING YOUR INFORMATION</h2>
          <h3>10.1 Account Information</h3>
          <p>
            You may at any time review or change the information in your account or terminate your account
            by logging into your account settings and updating your account.
          </p>

          <h3>10.2 Emails and Communications</h3>
          <p>
            If you no longer wish to receive correspondence, emails, or other communications from us, you
            may opt-out by contacting us using the contact information provided below.
          </p>
        </div>

        <div className="legal-section">
          <h2>11. CONTACT US</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
          <p>
            Email: <a href="mailto:jcab@signaldatasource.com">jcab@signaldatasource.com</a><br />
            Website: <a href="https://www.signaldatasource.com">https://www.signaldatasource.com</a>
          </p>
        </div>
      </section>

      <style>{`
        .legal-page {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          gap: 3rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-secondary);
          font-weight: 700;
          width: fit-content;
        }

        .legal-content {
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          padding: 3rem;
          display: grid;
          gap: 2.5rem;
        }

        .legal-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border-default);
          padding-bottom: 0.5rem;
        }

        .legal-section h3 {
          font-size: 1.1rem;
          margin: 1.5rem 0 0.5rem 0;
          color: var(--color-text-primary);
        }

        .legal-section p {
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .legal-section ul {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 0.75rem;
        }

        .legal-section li {
          color: var(--color-text-secondary);
          line-height: 1.5;
          padding-left: 1rem;
          border-left: 2px solid var(--color-border-default);
        }

        .legal-section a {
          color: var(--color-accent-primary);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .legal-content {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPage;
