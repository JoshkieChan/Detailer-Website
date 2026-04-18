import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CalendarCheck } from 'lucide-react';
import { PageSubtitle } from '../components/PageSubtitle';
import { PageHeroWithBackground } from '../components/PageHeroWithBackground';

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
          'We don’t offer multi‑year ceramic coating packages yet. Right now we use spray‑on protection products and ceramic glass treatment as part of the Deep Reset. Long‑term ceramic coatings will come later as separate protection packages.',
      },
      {
        question: 'Do you fix scratches, dents, or paint damage?',
        answer:
          'We offer light paint correction as an optional add‑on to reduce swirls and minor surface scratches in the clear coat. We do not repair dents, deep gouges through the paint, or bent metal, and we don’t perform body or collision repair.',
      },
      {
        question: 'Do you detail engine bays?',
        answer:
          'We offer light engine bay tidying as an add‑on: careful dusting and wipe‑down of accessible plastic covers with minimal moisture. We do not do heavy degreasing, pressure‑washing, or deep engine bay detailing.',
      },
      {
        question: 'How long does an appointment take?',
        answer: (
          <>
            <strong>Maintenance:</strong> typically around 3–4 hours depending on vehicle size and condition.{' '}
            <strong>Deep Reset:</strong> typically around 4–6 hours depending on size and condition. Times vary with how dirty the vehicle is.
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
      {
        question: 'Why are your prices higher than some other detailers?',
        answer:
          'Most lower prices you’ll see are for quicker, lighter services that try to squeeze as many cars as possible into a day. We limit how many vehicles we book, use interior steam where it matters (high‑touch areas, stains, pet hair, spills), and follow a documented system so the car is actually reset — not just made to look good for a week. If you just need the fastest or cheapest option, we’re probably not the best fit, and that’s okay.',
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
        question: 'Do you come to me or do I drop my car off?',
        answer:
          'You can choose between our Garage Studio drop-off or our On‑Island Mobile service (Oak Harbor and nearby areas only). Mobile service adds a flat $30 fee per visit.',
      },
      {
        question: 'What should I do before my appointment?',
        answer:
          'Please remove valuables, documents, cash, and heavy loose items so we can work efficiently and avoid missing anything. For mobile appointments, a safe parking spot and access to the vehicle are all we need.',
      },
      {
        question: 'What happens if it’s very hot or sunny the day of my appointment?',
        answer:
          'In extreme heat or full sun with no shade, certain Deep Reset steps—like iron remover, clay decontamination, and machine polishing—can be unsafe if panels can’t be kept cool and wet. In those cases we may adjust the visit to Maintenance‑level exterior only or reschedule the decontamination and polishing steps for a cooler/shaded day. We’ll always explain this before making changes.',
      },
      {
        question: 'Do you use my water and electricity for mobile appointments?',
        answer:
          'For most mobile appointments, yes. We use your on‑site water spigot and a standard electrical outlet for our equipment. Usage is minimal — typically less than you’d use for a normal home wash — and we’ll confirm access details when we schedule your booking. If you’re in an apartment or a spot with limited access, mention that in your booking notes and we’ll let you know what’s possible.',
      },
    ],
  },
  {
    title: 'Deposits and payments',
    items: [
      {
        question: 'What forms of payment do you accept?',
        answer:
          'Cards via Helcim. The booking process takes a 20% deposit (plus tax on the deposit if applicable) to reserve your slot. The remaining balance is due in person after the service is complete.',
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
  {
    title: 'Weather and service policies',
    items: [
      {
        question: 'What happens if it rains the day of my appointment?',
        answer: (
          <>
            <strong>Garage Studio:</strong> Light rain is okay. We’ll wash your vehicle in the driveway, then move it to a more sheltered position for drying and interior work. In severe weather (heavy rain, high winds, storms), we may reschedule your appointment; your deposit simply moves with your booking.
            <br /><br />
            <strong>On-Island Mobile:</strong> If weather makes a quality wash or safe drying impossible, we’ll reschedule your visit to the next dry slot. We don’t work mobile in storms or extreme conditions; your deposit is carried forward, not lost.
          </>
        ),
      },
      {
        question: 'What is your cancellation or rescheduling policy?',
        answer:
          'We appreciate at least 24\u201348 hours\u2019 notice for reschedules so we\u2019re not left with an empty day. Deposits are carried forward when you give reasonable notice. Same-day cancellations and no-shows may forfeit the deposit at our discretion.',
      },
    ],
  },
];

const FAQPage = () => {
  const [openId, setOpenId] = useState<string>('Packages and pricing-0');

  return (
    <div className="page-shell faq-page">
      <PageHeroWithBackground imageSrc="/images/hero-detailing.jpg">
        <div className="text-center reveal">
          <div className="capacity-banner inline-block border-white/20 bg-white/10 text-white">
            <CalendarCheck size={16} /> Currently accepting 2–3 customers per day, Monday–Saturday.
          </div>
          <span className="eyebrow block mt-4 text-slate-300">FAQ</span>
          <h1 className="hero-title text-white">Questions before you book? Start here.</h1>
          <PageSubtitle>
            <span className="text-slate-100">
              Everything most Oak Harbor and NAS Whidbey customers ask before scheduling,
              dropping off, or choosing mobile service.
            </span>
          </PageSubtitle>
        </div>
      </PageHeroWithBackground>

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
