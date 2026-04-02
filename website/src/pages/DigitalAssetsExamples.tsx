import { ChevronLeft, FileText, CheckCircle, Shield, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

const DigitalAssetsExamples = () => {
  const pdfs = [
    {
      title: "The Weekend Wash Blueprint",
      description: "A step-by-step checklist to perfectly wash your car safely at home without scratching the paint. Includes what products to use and the exact order of operations.",
      icon: <Droplets size={24} />,
      price: "$15",
      link: "https://signaldatasource.gumroad.com"
    },
    {
      title: "Military PCS Cleaning Guide",
      description: "How to prep your vehicle for a smooth, damage-free transfer. Essential for military families shipping vehicles overseas or across the country.",
      icon: <CheckCircle size={24} />,
      price: "$20",
      link: "https://signaldatasource.gumroad.com"
    },
    {
      title: "Ceramic Coating Aftercare",
      description: "Maximize the lifespan of your coating with these core principles. Know exactly what chemicals to avoid and how to maintain the hydrophobic layer.",
      icon: <Shield size={24} />,
      price: "$10",
      link: "https://signaldatasource.gumroad.com"
    },
    {
      title: "Detailer's Chemical Cheatsheet",
      description: "Exactly what chemicals to use, when, and on what surfaces safely. A quick-reference guide to avoid costly mistakes on sensitive interior and exterior trims.",
      icon: <FileText size={24} />,
      price: "$15",
      link: "https://signaldatasource.gumroad.com"
    }
  ];

  return (
    <div className="examples-page">
      <div className="container py-8 max-w-5xl mx-auto">
        <Link to="/hub" className="back-link mb-12 inline-flex items-center text-sm opacity-60 hover:opacity-100 transition-opacity">
          <ChevronLeft size={16} className="mr-1" />
          Back to Hub
        </Link>

        <header className="page-header mb-10 text-center">
          <div className="badge-lime mb-3">Downloadable PDFs</div>
          <h1 className="text-4xl font-black mb-4">Digital Guides & Playbooks</h1>
          <p className="subtitle text-lg text-gray-400 max-w-2xl mx-auto">
            Practical, easy-to-follow checklists and frameworks designed to save you time and prevent costly mistakes.
          </p>
        </header>

        <div className="examples-grid">
          {pdfs.map((pdf, index) => (
            <div key={index} className="example-card glass flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="example-icon-wrapper">
                  {pdf.icon}
                </div>
                <div className="price-tag font-bold text-lime-400">{pdf.price}</div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">{pdf.title}</h3>
              <p className="text-gray-400 mb-6 flex-grow">{pdf.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-800">
                <a 
                  href={pdf.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary w-full flex justify-center py-3"
                >
                  Buy on Gumroad
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .examples-page { padding-top: 4rem; padding-bottom: 6rem; min-height: 100vh; }
        .back-link { color: var(--color-text-muted); text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .back-link:hover { color: var(--color-accent-lime); }
        
        .badge-lime { 
          display: inline-block; 
          background: var(--color-accent-lime); 
          color: #000; 
          padding: 0.25rem 0.75rem; 
          border-radius: 4px; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          font-size: 0.8rem;
        }
        
        .examples-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 2rem; 
          margin-top: 3rem;
        }

        .example-card { 
          padding: 2.5rem; 
          border-radius: 16px; 
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
        }
        .example-card:hover { 
          transform: translateY(-4px); 
          border-color: rgba(158, 255, 0, 0.2); 
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
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

        @media (max-width: 768px) {
          .examples-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default DigitalAssetsExamples;
