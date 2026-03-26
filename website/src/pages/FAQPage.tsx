import { useState } from 'react';
import { ChevronDown, ChevronUp, CalendarCheck } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What's included in a Maintenance Detail?",
      answer: "A Maintenance Detail provides a thorough inside-out refresh. It includes a plush foam hand wash, wheel and tire cleaning, wiping down the door jambs, a full interior vacuum with a light wipe-down, and streak-free glass inside and out."
    },
    {
      question: "What's included in a Deep Reset Detail?",
      answer: "Our signature Deep Reset restores your vehicle toward factory fresh. It includes a thorough two-bucket contact wash, iron/fallout and clay decontamination on the paint, followed by a protective sealant. Inside, it involves crevice work, thorough vacuuming, and stain treatment on seats and carpets (as safely possible). Please note that final results depend heavily on the starting condition of the vehicle."
    },
    {
      question: "What's included in a New Car Protection service?",
      answer: "Perfect for new or newly-detailed vehicles, this adds gloss and protection against the PNW elements. It includes a deep exterior clean, decontamination, a light one-step gloss enhancement polish (no heavy correction), and a durable 1-year paint sealant applied to painted surfaces. Wheel faces and glass are also protected."
    },
    {
      question: "What is the difference between Garage Studio and Mobile Detail?",
      answer: "Garage Studio is a drop-off service at my home studio on Erie Street featuring controlled lighting, power, and weather—best for full details like Deep Reset and New Car Protection. Mobile Detailing means I come to your driveway (within my service radius) and use the exact same process, adapted for your location. Mobile is best for Maintenance and lighter services, as no heavy machine polishing or multi-day jobs are performed on mobile appointments."
    },
    {
      question: "Do you offer paint correction, ceramic coatings, or PPF?",
      answer: "Right now I focus on premium detailing and 1-year sealant protection. Advanced paint correction, ceramic coatings, and PPF are planned for the future as I expand the studio."
    },
    {
      question: "How long does a typical appointment take?",
      answer: "A Maintenance Detail normally takes between 1.5 to 2.5 hours. A Deep Reset or New Car Protection service can take between 4 to 6 hours, depending on the condition and size of your vehicle."
    },
    {
      question: "How far do you travel for mobile detailing?",
      answer: "We operate within a roughly 30-mile radius of our Erie Street, Oak Harbor location, proudly serving NAS Whidbey and the surrounding island communities."
    },
    {
      question: "What is your deposit and cancellation policy?",
      answer: "Yes, we require a 20% deposit to secure your booking slot. Cancellations or reschedules made within 24 hours of the appointment will forfeit the deposit due to the time blocked off for your service."
    },
    {
      question: "Do you work on heavily stained or pet-hair interiors?",
      answer: "Yes! The Deep Reset package includes intensive stain treatment and pet hair removal up to a reasonable limit. If the vehicle is exceptionally soiled, an additional fee may apply, but we will always communicate this before starting work."
    },
    {
      question: "Do you detail trucks / SUVs / minivans?",
      answer: "Absolutely. We service all sizes of passenger vehicles. Please ensure you select the correct make and model during the booking process so we can accurately block off the required time."
    },
    {
      question: "How often should I get my car detailed?",
      answer: "We recommend a Deep Reset once or twice a year to maintain protection, and a Maintenance Detail every 4 to 6 weeks to consistently keep the vehicle looking sharp."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, Apple Pay, and Google Pay via our secure online invoicing system, as well as cash upon completion of the detail."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page container">
      <div className="text-center mb-1">
        <div className="capacity-banner inline-block mb-3">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
      </div>

      <div className="page-header text-center">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know before booking your detail.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item glass ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleFaq(index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              {openIndex === index ? <ChevronUp className="icon-lime" size={24} /> : <ChevronDown className="icon-lime" size={24} />}
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .faq-page { padding: 4rem 1.5rem; max-width: 900px; }
        .page-header { margin-bottom: 4rem; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--color-text-muted); }
        
        .faq-list { display: flex; flex-direction: column; gap: 1rem; }
        .faq-item { border-radius: var(--radius-md); padding: 1.5rem 2rem; cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--color-border); }
        .faq-item:hover { background: rgba(128,128,128,0.02); }
        .faq-item.active { border-color: var(--color-accent-lime); background: rgba(158, 255, 0, 0.03); }
        [data-theme='light'] .faq-item.active { background: #f4faeb; border-color: #559300; }
        
        .faq-question { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
        .faq-question h3 { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--color-text-main); }
        .icon-lime { color: var(--color-accent-lime); flex-shrink: 0; }
        [data-theme='light'] .icon-lime { color: #559300; }
        
        .faq-answer { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
        .faq-answer p { color: var(--color-text-muted); font-size: 1.1rem; line-height: 1.7; margin: 0; }
        
        @media (max-width: 768px) {
          .faq-item { padding: 1.25rem 1.5rem; }
          .faq-question h3 { font-size: 1.15rem; }
          .faq-answer p { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
