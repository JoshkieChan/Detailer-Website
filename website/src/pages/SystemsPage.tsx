import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ArrowUpRight, Brain, Zap, MessageSquare, LayoutDashboard } from 'lucide-react';

const CUSTOM_BUILD_INTAKE_URL = 'https://www.signaldatasource.com/intake';

const cases = [
  {
    title: 'Local Booking Brain',
    description: 'AI-powered intake and booking pipeline for a detailing shop. Captures leads, qualifies inquiries, and answers scheduling questions 24/7.',
    tag: 'Local Systems',
  },
  {
    title: 'PCS Income Tracker & Plan Board',
    description: 'A structured board that keeps income ideas, deadlines, and action items from living in your head.',
    tag: 'Life & Logistics',
  },
  {
    title: 'Opportunity Scanner',
    description: 'A clean daily digest that surfaces the highest-signal opportunities instead of forcing you to hunt through noise.',
    tag: 'Intelligence Tools',
  },
  {
    title: 'Client Follow-Up Sequencer',
    description: 'Timed messages after service completion to collect reviews, offer rebooking, and reduce churn.',
    tag: 'Back-office Automation',
  },
];

const SystemsPage = () => {
  const [activeCase, setActiveCase] = useState<string | null>('Local Booking Brain');

  return (
    <div className="page-shell systems-page">
      <Link to="/hub" className="back-link reveal">
        <ChevronLeft size={15} />
        Back to More
      </Link>

      <section className="hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Custom Builds</span>
          <h1 className="hero-title">Custom systems for operators who are tired of dropped leads and manual follow-up.</h1>
          <p className="hero-subtitle">
            These are secondary services. SignalSource is still a detailing business first in
            Oak Harbor. This side of the site is for people who want the same organized
            approach applied to operations and automation.
          </p>
          <div className="hero-actions">
            <a href={CUSTOM_BUILD_INTAKE_URL} className="btn primary">Start Short Intake</a>
          </div>
        </div>
        <div className="hero-visual reveal" data-reveal-delay="1" aria-hidden="true" />
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">What We Can Build</span>
          <h2 className="section-title">Lead follow-up, dashboards, reminders, and simple back-office tools.</h2>
          <p className="section-copy">
            Lead follow-up automations, booking flows, review requests, dashboards, reminder
            systems, intake routing, and simple back-office tools that remove repeat admin.
          </p>
        </div>

        <div className="card-grid two">
          {[
            {
              icon: <MessageSquare size={18} />,
              title: 'Local Booking Systems',
              text: '24/7 assistants that capture leads, qualify inquiries, and handle repetitive scheduling questions while you focus on the actual work.',
            },
            {
              icon: <LayoutDashboard size={18} />,
              title: 'Dashboards & Review Flows',
              text: 'Simple dashboards and follow-up sequences that keep bookings, reviews, reminders, and missed calls from slipping through.',
            },
            {
              icon: <Brain size={18} />,
              title: 'Audit + Build Paths',
              text: 'Some projects start with an audit, some go straight into a build, and some need ongoing monthly support after launch.',
            },
            {
              icon: <Zap size={18} />,
              title: 'Low-Friction Ops',
              text: 'The goal is not another bloated app. It is fewer manual handoffs, fewer missed opportunities, and less admin living in your head.',
            },
          ].map((item, index) => (
            <article className="content-card surface-card reveal" data-reveal-delay={String(index % 2)} key={item.title}>
              <div className="support-pill">{item.icon}{item.title}</div>
              <p className="section-copy">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header reveal">
          <span className="eyebrow">Example Systems</span>
          <h2 className="section-title">Use cases you can click into.</h2>
          <p className="section-copy">
            Start with the clearest example and expand from there.
          </p>
        </div>

        <div className="card-grid two">
          {cases.map((c, index) => (
            <article className="system-case-card reveal" data-reveal-delay={String(index % 2)} key={c.title}>
              <div className="support-pill">{c.tag}</div>
              <h3>{c.title}</h3>
              <p className="section-copy">{c.description}</p>
              {c.title === 'Local Booking Brain' ? (
                <button type="button" className="btn secondary case-button" onClick={() => setActiveCase(c.title)}>
                  View details <ArrowUpRight size={16} />
                </button>
              ) : (
                <a href={CUSTOM_BUILD_INTAKE_URL} className="btn secondary case-button">
                  Start with intake <ArrowUpRight size={16} />
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {activeCase === 'Local Booking Brain' && (
        <section className="content-card reveal is-visible">
          <span className="eyebrow">Local Booking Brain</span>
          <h2 className="section-title">A real example with scope, audience, and deliverable.</h2>
          <div className="card-grid three">
            <article className="detail-card">
              <h3>Who it&apos;s for</h3>
              <p className="section-copy">
                Local service businesses that handle inbound leads all day and keep missing
                calls while they are on jobs.
              </p>
            </article>
            <article className="detail-card">
              <h3>What problem it solves</h3>
              <p className="section-copy">
                It cuts down on missed inquiries, slow replies, and back-and-forth scheduling
                by capturing leads instantly and routing the right next step.
              </p>
            </article>
            <article className="detail-card">
              <h3>What the deliverable is</h3>
              <p className="section-copy">
                Starts with an intake and workflow audit, then moves into a custom build.
                Ongoing monthly support can be scoped if the system needs tuning after launch.
              </p>
            </article>
          </div>
          <div className="hero-actions mt-2">
            <a href={CUSTOM_BUILD_INTAKE_URL} className="btn primary">
              Start the intake
            </a>
          </div>
        </section>
      )}

      <section className="content-card reveal">
        <span className="eyebrow">How Custom Builds Work</span>
        <h2 className="section-title">Start with a short intake, then scope the right engagement.</h2>
        <p className="section-copy">
          You start with a short intake. From there, we scope whether the right fit is an
          audit, a one-time build, or a monthly support setup.
        </p>
      </section>

      <section className="content-card reveal">
        <h2 className="section-title">Want a custom build? Start with a short intake here.</h2>
        <a href={CUSTOM_BUILD_INTAKE_URL} className="btn primary">Start intake</a>
      </section>
    </div>
  );
};

export default SystemsPage;
