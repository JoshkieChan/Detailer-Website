import { useState } from 'react';
import { ChevronDown, CalendarCheck } from 'lucide-react';

const faqGroups = [
  {
    title: 'Packages and pricing',
    items: [
      {
        question: 'How do I know which tier to choose?',
        answer: 'Maintenance is for routine upkeep, Deep Reset is for vehicles that have slipped backward, and New Car Protection is for newer or already-clean vehicles that need gloss and protection.',
      },
      {
        question: 'Are add-ons required?',
        answer: 'No. Add-ons are optional upgrades for extra labor, extra correction, or extra convenience. The base packages are built to stand on their own.',
      },
      {
        question: 'What if my vehicle is worse than I described?',
        answer: 'If the actual condition changes the scope in a meaningful way, we confirm the updated time and price before work begins.',
      },
    ],
  },
  {
    title: 'Mobile and studio',
    items: [
      {
        question: 'Is On-Island Mobile Convenience required?',
        answer: 'No. It is an optional convenience upgrade for customers who want service at home or work instead of dropping off at the studio.',
      },
      {
        question: 'When is the studio a better choice?',
        answer: 'Garage Studio is better for heavier interior work, longer resets, controlled lighting needs, and anything that should not depend on driveway conditions or weather.',
      },
    ],
  },
  {
    title: 'Deposits and scheduling',
    items: [
      {
        question: 'What does the 20% deposit cover?',
        answer: 'It reserves your appointment time and is applied to the final invoice. It is not an extra fee added on top.',
      },
      {
        question: 'What happens if the scope changes before the appointment?',
        answer: 'If the selected scope changes significantly close to the appointment, required time and final price may change as well. Any changes are confirmed before work starts.',
      },
    ],
  },
  {
    title: 'Maintenance plans',
    items: [
      {
        question: 'Who should join a maintenance plan?',
        answer: 'Drivers who already have a clean baseline and want guaranteed spots, easier upkeep, and less mental load than ad-hoc booking.',
      },
      {
        question: 'Is it smarter than booking one detail at a time?',
        answer: 'Usually yes, if the vehicle stays in steady use. Membership keeps you from waiting until the car feels trashed again and paying for bigger resets.',
      },
    ],
  },
  {
    title: 'Secondary offers',
    items: [
      {
        question: 'Are the systems and digital guides your main service?',
        answer: 'No. Car Detailing & Protection is the main local offer. The guides and systems are secondary services for people who want the same systems mindset applied to moves, money, or operations.',
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
                  <button
                    type="button"
                    className={`faq-item ${isOpen ? 'active' : ''}`}
                    onClick={() => setOpenId(isOpen ? '' : id)}
                    key={item.question}
                  >
                    <div className="faq-question">
                      <h3>{item.question}</h3>
                      <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      <p>{item.answer}</p>
                    </div>
                  </button>
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
          text-align: left;
          width: 100%;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          padding: 1.15rem 1.25rem;
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

        .faq-answer p {
          overflow: hidden;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        .faq-answer.open {
          grid-template-rows: 1fr;
          margin-top: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
