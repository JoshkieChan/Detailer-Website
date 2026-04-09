import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CalendarCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: ReactNode;
}

const faqGroups: Array<{ title: string; items: FAQItem[] }> = [
  {
    title: 'Packages and pricing',
    items: [
      {
        question: "What's the difference between the Maintenance Detail and the Deep Reset Detail?",
        answer: (
          <>
            <strong>Maintenance Detail</strong> is regular upkeep: foam pre-wash and two-bucket contact wash, wheels and tires cleaned and dressed, door jambs wiped (light level), interior vacuum and light wipe-down of high-touch areas, and streak-free glass inside and out.
            {' '}<strong>Deep Reset Detail</strong> is a one-time intensive clean: iron remover and clay decontamination on paint, deep wheel and tire cleaning including inner barrels, full interior vacuum with crevice and brush work on plastics and seams, fabric seat and carpet cleaning with extraction where safe, interior plastic/trim protection, and glass deep clean plus ceramic glass treatment.
          </>
        ),
      },
      {
        question: 'Do you offer ceramic coating?',
        answer:
          'No full ceramic coating packages yet. The Deep Reset Detail includes spray-on protection products on paint and a ceramic glass treatment on the windows. True multi-year ceramic coatings will be a separate package later.',
      },
      {
        question: 'Do you fix scratches, dents, or paint damage?',
        answer:
          'Light paint correction (machine polishing to reduce swirls and minor surface scratches in the clear coat) is available as a case-by-case add-on after inspection. We do not repair dents, deep gouges through the paint, or bent metal, and we do not do body or collision work.',
      },
      {
        question: 'Do you detail engine bays?',
        answer:
          'We offer light engine bay tidying as an add-on only: careful dusting and wipe-down of accessible plastic covers with minimal moisture. We do not do heavy degreasing, pressure-washing, or deep engine bay detailing. If you need this, mention it in your booking notes and we will confirm what is realistic before your appointment.',
      },
      {
        question: 'How long does an appointment take?',
        answer: (
          <>
            <strong>Maintenance Detail:</strong> typically around 3–4 hours, depending on vehicle size and condition.{' '}
            <strong>Deep Reset Detail:</strong> typically around 4–6 hours, depending on size and condition. Times can vary based on the actual state of the vehicle when we start.
          </>
        ),
      },
      {
        question: 'Need extras like severe pet hair or headlight work?',
        answer:
          "Mention it in your booking notes. We'll review your photos and send updated pricing for approval before we start. This keeps the initial booking fast while ensuring you only pay for the specific labor your vehicle needs.",
      },
      {
        question: 'What if my vehicle is worse than I described?',
        answer:
          'If the actual condition changes the scope in a meaningful way, we confirm the updated time and price before work begins.',
      },
    ],
  },
  {
    title: 'Service area and location',
    items: [
      {
        question: 'What areas do you serve?',
        answer:
          'Oak Harbor, NAS Whidbey, and immediately surrounding areas on Whidbey Island only. Mobile service covers roughly a 25–30 mile radius of Oak Harbor, including Coupeville, Deception Pass, and nearby areas.',
      },
      {
        question: 'Can I drop my car off at your location?',
        answer:
          'Yes. Garage Studio drop-off is available near Erie Street in Oak Harbor. The exact address is shared after booking. Studio appointments are better for heavier resets, longer jobs, and anything needing controlled lighting or weather protection.',
      },
      {
        question: 'How do I choose mobile service?',
        answer:
          'Select mobile service during the booking flow. We serve most of Whidbey Island. You will need a safe parking spot and access to the vehicle. Note: no heavy machine polishing or multi-day jobs are available on mobile appointments.',
      },
      {
        question: 'What should I do before my appointment?',
        answer:
          'Please remove valuables, documents, cash, and heavy loose items so we can work efficiently and avoid missing anything. For mobile appointments, a safe parking spot and access to the vehicle are all we need.',
      },
      {
        question: 'What happens if it’s very hot or sunny the day of my appointment?',
        answer:
          'In extreme heat or full sun with no shade, we may adjust or reschedule the decontamination and polishing steps to protect your paint. We’ll always talk this through with you on the day of service.',
      },
    ],
  },
  {
    title: 'Deposits and payments',
    items: [
      {
        question: 'What does the 20% deposit cover?',
        answer: (
          <>
            It reserves your appointment time and is applied directly to your final invoice—not added on top. The{' '}
            <Link to="/pricing">Pricing page</Link> shows typical ranges by tier and vehicle size.
          </>
        ),
      },
      {
        question: 'What forms of payment do you accept?',
        answer:
          'Cards via Helcim. Oak Harbor, WA sales tax (9.1%) is applied to the deposit at booking, and any applicable convenience fees are disclosed before payment. The remaining balance is due in person after the service is complete.',
      },
      {
        question: 'What happens if the scope changes before my appointment?',
        answer:
          'If the selected scope changes significantly close to the appointment, required time and final price may change as well. Any changes are confirmed before work starts.',
      },
    ],
  },
  {
    title: 'Maintenance plans',
    items: [
      {
        question: 'Who should join a maintenance plan?',
        answer: (
          <>
            Drivers who already have a clean baseline and want guaranteed spots, predictable upkeep, and less mental load than booking one-off every time. If you are considering a plan, the{' '}
            <Link to="/memberships">Maintenance Plans page</Link> shows the current options and terms.
          </>
        ),
      },
      {
        question: 'Is a plan smarter than booking one detail at a time?',
        answer:
          'Usually yes, if the vehicle stays in steady use. Membership keeps you from waiting until the car feels trashed again and paying for bigger resets more frequently.',
      },
    ],
  },
  {
    title: 'Secondary offers',
    items: [
      {
        question: 'Are the systems and digital guides your main service?',
        answer: (
          <>
            No. Car Detailing & Protection is the main local offer. The guides and systems are
            secondary services for people who want the same systems mindset applied to moves,
            money, or operations. You can browse those secondary tools from the{' '}
            <Link to="/hub">Hub</Link>.
          </>
        ),
      },
    ],
  },
];

const FAQPage = () => {
  const [openId, setOpenId] = useState<string>('Packages and pricing-0');

  return (
    <div className="page-shell faq-page">
      <section className="page-hero text-center reveal">
        <div className="capacity-banner inline-block">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
        <span className="eyebrow">FAQ</span>
        <h1 className="hero-title">Questions before you book? Start here.</h1>
        <p className="hero-subtitle">
          Everything most Oak Harbor and NAS Whidbey customers ask before scheduling,
          dropping off, or choosing mobile service.
        </p>
      </section>

      <div className="faq-group-list">
        {faqGroups.map((group, groupIndex) => (
          <section className="faq-group reveal" data-reveal-delay={String(groupIndex % 2)} key={group.title}>
            <div className="section-header">
              <span className="eyebrow">{group.title}</span>
              <h2 className="section-title">{group.title}</h2>
            </div>
            <div className="faq-list">
              {group.items.map((item, itemIndex) => {
                const id = `${group.title}-${itemIndex}`;
                const isOpen = openId === id;

                return (
                  <article className={`faq-item ${isOpen ? 'active' : ''}`} key={item.question}>
                    <button
                      type="button"
                      className="faq-trigger"
                      onClick={() => setOpenId(isOpen ? '' : id)}
                    >
                      <div className="faq-question">
                        <h3>{item.question}</h3>
                        <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'open' : ''}`} />
                      </div>
                    </button>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      <div className="faq-answer-inner">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .faq-page {
          display: grid;
          gap: 2.5rem;
        }

        .faq-group-list {
          display: grid;
          gap: 1.75rem;
        }

        .faq-group {
          display: grid;
          gap: 1rem;
        }

        .faq-list {
          display: grid;
          gap: 0.85rem;
        }

        .faq-item {
          width: 100%;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          padding: 0;
          transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
        }

        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
          border-color: var(--color-border-strong);
        }

        .faq-item.active {
          border-color: var(--color-accent-primary);
        }

        .faq-trigger {
          width: 100%;
          background: transparent;
          border: none;
          padding: 1.15rem 1.25rem;
          text-align: left;
          color: inherit;
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .faq-question h3 {
          font-size: 1.05rem;
          line-height: 1.35;
        }

        .faq-chevron {
          color: var(--color-accent-primary);
          transition: transform var(--transition-base);
          flex-shrink: 0;
        }

        .faq-chevron.open {
          transform: rotate(180deg);
        }

        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows var(--transition-base);
        }

        .faq-answer-inner {
          overflow: hidden;
          padding: 0 1.25rem;
        }

        .faq-answer p {
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin: 0;
        }

        .faq-answer p a {
          color: var(--color-accent-primary);
          font-weight: 700;
        }

        .faq-answer.open {
          grid-template-rows: 1fr;
          margin-top: -0.1rem;
        }

        .faq-answer.open .faq-answer-inner {
          padding-bottom: 1.15rem;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
