const AboutPage = () => {
  return (
    <div className="about-page container">
      <div className="page-header text-center">
        <h1>About Us</h1>
        <p>Premium detailing and long-term protection in Oak Harbor.</p>
      </div>

      <div className="about-content glass">
        <div className="about-text">
          <h2>Our Story</h2>
          <p>
            Welcome to SIGNALSOURCE. We started with a simple belief: every driver deserves to experience that "new-car feeling" long after they’ve driven off the lot. Based right here on Erie Street in Oak Harbor, we’ve built our detailing studio to serve the local community with honesty, precision, and care.
          </p>
          <p>
            Detailing isn’t just about washing a car; it’s about protection, preservation, and pride of ownership. That’s why we use premium, eco-aware products and the latest techniques to ensure your vehicle looks stunning and stays protected against the harsh Pacific Northwest elements.
          </p>
          
          <h2>Serving NAS Whidbey & Beyond</h2>
          <p>
            As proud members of the Oak Harbor community, we have a deep respect for those who serve. We are committed to providing military-friendly scheduling and flexibility for the families at NAS Whidbey Island. 
          </p>
          <p>
            Whether you choose to drop off your vehicle at our fully equipped Garage Studio or prefer the convenience of our Mobile Unit coming straight to your driveway, you will receive the exact same standard of meticulous care.
          </p>

          <h2>Our Promise</h2>
          <ul className="promise-list">
            <li><strong>Complete Transparency:</strong> No hidden fees. The price you see is the price you pay.</li>
            <li><strong>Exceptional Quality:</strong> We don't cut corners. Period.</li>
            <li><strong>Unmatched Convenience:</strong> Online booking, mobile options, and subscription plans to fit your busy life.</li>
          </ul>
        </div>
      </div>

      <style>{`
        .about-page { padding: 4rem 1.5rem; max-width: 900px; }
        .page-header { margin-bottom: 4rem; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--color-text-muted); }
        
        .about-content { padding: 4rem; border-radius: var(--radius-lg); border-top: 4px solid var(--color-accent-lime); }
        .about-text h2 { font-size: 2.25rem; margin-top: 3rem; margin-bottom: 1.5rem; color: var(--color-accent-lime); }
        .about-text h2:first-child { margin-top: 0; }
        .about-text p { font-size: 1.15rem; line-height: 1.8; color: var(--color-text-main); margin-bottom: 1.5rem; }
        
        .promise-list { list-style: none; padding-left: 0; margin-top: 2rem; }
        .promise-list li { font-size: 1.15rem; margin-bottom: 1.5rem; padding-left: 2rem; position: relative; color: var(--color-text-muted); line-height: 1.6; }
        .promise-list li::before { content: "•"; position: absolute; left: 0; color: var(--color-accent-lime); font-size: 1.5rem; top: -5px; }
        .promise-list strong { color: var(--color-text-main); font-weight: 700; }

        @media (max-width: 768px) {
          .about-content { padding: 2.5rem 1.5rem; }
          .about-text h2 { font-size: 1.75rem; }
          .about-text p, .promise-list li { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
