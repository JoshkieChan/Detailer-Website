import { ChevronLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="page-shell legal-page">
      <Link to="/hub" className="back-link reveal">
        <ChevronLeft size={15} />
        Back to Hub
      </Link>

      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Legal Requirements</span>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">
            Effective Date: April 4, 2026. Please read these terms carefully before using our services.
          </p>
          <div className="hero-actions">
            <a href="/terms.pdf" download className="btn primary">
              <Download size={18} />
              Download PDF
            </a>
          </div>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      {/*
        Safety: ensure the legal body is visible even if the IntersectionObserver-based
        reveal logic is blocked by the browser / extensions / CSP.
      */}
      <section className="section-stack legal-content reveal is-visible">
        <div className="legal-section">
          <h2>1. ACCEPTANCE OF TERMS</h2>
          <p>
            By accessing and using <a href="https://www.signaldatasource.com">https://www.signaldatasource.com</a> (the "Service"), 
            you accept and agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, you must not access or use the Service.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. DESCRIPTION OF SERVICE</h2>
          <p>
            SignalSource provides local car detailing and protection services in Oak Harbor, WA,
            as well as downloadable digital guides and playbooks through our website. The
            specific features and offerings are subject to change without notice.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. USER REGISTRATION</h2>
          <ul>
            <li>3.1. You may be required to register with the Service to access certain features.</li>
            <li>3.2. You agree to keep your password confidential and will be responsible for all use of your account and password.</li>
            <li>3.3. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. USER OBLIGATIONS</h2>
          <p>You agree not to:</p>
          <ul>
            <li>4.1. Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>4.2. Make any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
            <li>4.3. Use the Service to advertise or offer to sell goods and services.</li>
            <li>4.4. Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
            <li>4.5. Engage in unauthorized framing of or linking to the Service.</li>
            <li>4.6. Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>4.7. Make improper use of our support services or submit false reports of abuse or misconduct.</li>
            <li>4.8. Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
            <li>4.9. Interfere with, disrupt, or create an undue burden on the Service or the networks or services connected to the Service.</li>
            <li>4.10. Attempt to impersonate another user or person or use the username of another user.</li>
            <li>4.11. Sell or otherwise transfer your profile.</li>
            <li>4.12. Use any information obtained from the Service in order to harass, abuse, or harm another person.</li>
            <li>4.13. Use the Service as part of any effort to compete with us or otherwise use the Service and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
            <li>4.14. Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Service.</li>
            <li>4.15. Attempt to bypass any measures of the Service designed to prevent or restrict access to the Service, or any portion of the Service.</li>
            <li>4.16. Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Service to you.</li>
            <li>4.17. Delete the copyright or other proprietary rights notice from any Content.</li>
            <li>4.18. Copy or adapt the Service's software.</li>
            <li>4.19. Upload or transmit viruses, Trojan horses, or other material, including excessive use of capital letters and spamming.</li>
            <li>4.20. Upload or transmit any material that acts as a passive or active information collection or transmission mechanism.</li>
            <li>4.21. Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Service.</li>
            <li>4.22. Use the Service in a manner inconsistent with any applicable laws or regulations.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. INTELLECTUAL PROPERTY RIGHTS</h2>
          <p>
            5.1. The Service and its entire contents, features, and functionality (including but not limited to
            all information, software, text, displays, images, video, and audio, and the design, selection, and
            arrangement thereof) are owned by SignalSource, its licensors, or other providers of such
            material and are protected by international copyright, trademark, patent, trade secret, and other
            intellectual property or proprietary rights laws.
          </p>
          <p>
            5.2. These Terms permit you to use the Service for your personal, non-commercial use only. You
            must not reproduce, distribute, modify, create derivative works of, publicly display, publicly
            perform, republish, download, store, or transmit any of the material on our Service, except as
            follows:
          </p>
          <ul>
            <li>a. Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
            <li>b. You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
            <li>c. You may print or download one copy of a reasonable number of pages of the Service for your own personal, non-commercial use.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. SUBMISSIONS</h2>
          <p>
            You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or
            other information regarding the Service ("Submissions") provided by you to us are
            non-confidential and shall become our sole property.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. THIRD-PARTY WEBSITES AND CONTENT</h2>
          <p>
            The Service may contain links to other websites ("Third-Party Websites") as well as articles,
            photographs, text, graphics, and other content or items belonging to or originating from third parties.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. ADVERTISERS</h2>
          <p>
            We allow advertisers to display their advertisements and other information in certain areas of
            the Service, such as sidebar advertisements or banner advertisements.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. SERVICE MANAGEMENT</h2>
          <p>
            We reserve the right, but not the obligation, to monitor the Service for violations of these Terms, 
            take appropriate legal action, and manage the Service in a manner designed to protect our rights 
            and property.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. PRIVACY POLICY</h2>
          <p>
            We care about data privacy and security. Please review our Privacy Policy 
            <Link to="/privacy">https://www.signaldatasource.com/privacy</Link>. 
            By using the Service, you agree to be bound by our Privacy Policy, which is incorporated into these Terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>11. TERM AND TERMINATION</h2>
          <p>
            These Terms shall remain in full force and effect while you use the Service. 
            We reserve the right to deny access to the Service to any person for any reason at our sole discretion.
          </p>
        </div>

        <div className="legal-section">
          <h2>12. MODIFICATIONS AND INTERRUPTIONS</h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Service at any time 
            for any reason at our sole discretion without notice.
          </p>
        </div>

        <div className="legal-section">
          <h2>13. GOVERNING LAW</h2>
          <p>
            These Terms shall be governed by the laws of the State of Washington, United States. 
            Any dispute will be resolved exclusively in the state and federal courts located in Washington.
          </p>
        </div>

        <div className="legal-section">
          <h2>14. DISPUTE RESOLUTION</h2>
          <p>
            The Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days 
            before initiating arbitration.
          </p>
        </div>

        <div className="legal-section">
          <h2>15. CORRECTIONS</h2>
          <p>
            There may be information on the Service that contains typographical errors, inaccuracies, or
            omissions. We reserve the right to correct any errors and to update information at any time without prior notice.
          </p>
        </div>

        <div className="legal-section">
          <h2>16. DISCLAIMER</h2>
          <p>
            THE SERVICE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT
            YOUR USE OF THE SERVICE WILL BE AT YOUR SOLE RISK.
          </p>
        </div>

        <div className="legal-section">
          <h2>17. LIMITATIONS OF LIABILITY</h2>
          <p>
            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO
            YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
          </p>
        </div>

        <div className="legal-section">
          <h2>18. INDEMNIFICATION</h2>
          <p>
            You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, 
            or claim arising out of your use of the Service or breach of these Terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>19. USER DATA</h2>
          <p>
            We will maintain certain data that you transmit to the Service for the purpose of managing the
            performance of the Service.
          </p>
        </div>

        <div className="legal-section">
          <h2>20. ELECTRONIC COMMUNICATIONS</h2>
          <p>
            Visiting the Service, sending us emails, and completing online forms constitute electronic
            communications.
          </p>
        </div>

        <div className="legal-section">
          <h2>21. CALIFORNIA USERS</h2>
          <p>
            California residents may contact the Complaint Assistance Unit of the Division of Consumer 
            Services of the California Department of Consumer Affairs.
          </p>
        </div>

        <div className="legal-section">
          <h2>22. REFUNDS</h2>
          <p>
            Subscriptions and digital product downloads are non-refundable. 
          </p>
        </div>

        <div className="legal-section">
          <h2>23. CANCELLATIONS, RESCHEDULING, AND WEATHER</h2>
          <p>
            23.1. Deposits are reserved for your specific slot and represent a commitment of time.
          </p>
          <p>
            23.2. Bad Weather Policy: Deposits are never forfeited due to weather conditions. If severe 
            weather (heavy rain, high winds, extreme temperatures) makes a quality service or safe mobile 
            operation impossible, we will reschedule your appointment to the next available slot. Your 
            deposit remains valid and carries forward to the rescheduled date.
          </p>
          <p>
            23.3. Personal Rescheduling: We appreciate at least 48 hours' notice for personal
            reschedules. When you provide reasonable notice, your deposit is carried forward to
            the new date. Same-day cancellations, no-shows, or repeated last-minute reschedules
            may result in forfeiture of the deposit at our discretion.
          </p>
        </div>

        <div className="legal-section">
          <h2>24. CONTACT US</h2>
          <p>If you have questions or comments about these Terms of Service, please contact us at:</p>
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

export default TermsPage;
