import React from 'react';

type PageHeroProps = {
  imageSrc: string;
  children: React.ReactNode;
};

export function PageHeroWithBackground({ imageSrc, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-20 text-white">
        {children}
      </div>
    </section>
  );
}
