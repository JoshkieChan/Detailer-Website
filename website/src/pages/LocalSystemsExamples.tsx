import { ChevronLeft, Brain, Zap, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const LocalSystemsExamples = () => {
  const examples = [
    {
      title: "24/7 AI Booking Agent",
      description: "An automated assistant that qualifies leads, sells high-ticket services, and syncs directly with your booking calendar.",
      icon: <MessageSquare size={24} />,
      status: "AI Agent"
    },
    {
      title: "Automated Follow-up Flow",
      description: "A trigger-based email and SMS system that reaches out to customers 48 hours and 30 days post-service to drive repeat business.",
      icon: <Zap size={24} />,
      status: "Automation"
    },
    {
      title: "Inventory Alert System",
      description: "A back-end 'brain' that tracks supply usage and sends a notification when it's time to re-order detailing chemicals.",
      icon: <Brain size={24} />,
      status: "Ops Engine"
    }
  ];

  return (
    <div className="examples-page">
      <div className="container py-6">
        <Link to="/systems" className="back-link mb-2 flex items-center">
          <ChevronLeft size={20} />
          <span>Back to Systems</span>
        </Link>

        <header className="page-header mb-6">
          <div className="badge-lime mb-1">Coming Soon</div>
          <h1>AI-Powered Local Systems</h1>
          <p className="subtitle">Example booking agents, follow-ups, and back-end automation for service businesses.</p>
        </header>

        <div className="examples-grid">
          {examples.map((example, index) => (
            <div key={index} className="example-card glass highlight-border">
              <div className="example-icon-wrapper mb-2">
                {example.icon}
              </div>
              <h3>{example.title}</h3>
              <p className="mb-2">{example.description}</p>
              <div className="flex items-center justify-between">
                <span className="example-status-tag">{example.status}</span>
                <span className="opacity-40 italic text-sm">Demo Video In Progress</span>
              </div>
            </div>
          ))}
        </div>

        <section className="cta-banner glass mt-6 text-center">
          <h3>Scale Your Business Automatically</h3>
          <p className="mb-4">I build intelligent systems that handle the busywork so you can focus on delivering high-end work.</p>
          <Link to="/systems" className="btn btn-primary">Let's Discuss Your System</Link>
        </section>
      </div>

      <style>{`
        .examples-page { padding-top: 4rem; min-height: 100vh; }
        .back-link { color: var(--color-text-muted); text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .back-link:hover { color: var(--color-accent-lime); }
        
        .examples-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 2rem; 
          margin-top: 3rem;
        }

        .example-card { 
          padding: 2.5rem; 
          border-radius: 20px; 
          transition: transform 0.3s ease, border-color 0.3s ease; 
        }
        .example-card:hover { 
          transform: translateY(-5px); 
          border-color: rgba(158, 255, 0, 0.4); 
        }

        .example-card.highlight-border {
          border: 1px solid rgba(158, 255, 0, 0.2);
        }

        .example-icon-wrapper { 
          width: 48px; 
          height: 48px; 
          background: rgba(158, 255, 0, 0.1); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: var(--color-accent-lime); 
        }

        .example-card h3 { font-size: 1.25rem; margin-bottom: 0.75rem; }
        .example-card p { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; }

        .example-status-tag { 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          font-weight: 800; 
          letter-spacing: 1px; 
          color: var(--color-accent-lime); 
          background: rgba(158, 255, 0, 0.1); 
          padding: 0.25rem 0.75rem; 
          border-radius: 4px; 
        }

        .cta-banner { padding: 4rem 2rem; border-radius: 24px; border: 1px dashed rgba(158, 255, 0, 0.3); }
        .cta-banner h3 { font-size: 2rem; font-weight: 900; margin-bottom: 1rem; }

        @media (max-width: 768px) {
          .examples-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default LocalSystemsExamples;
