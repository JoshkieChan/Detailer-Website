import React from 'react';

type PageHeroWithBackgroundProps = {
  imageSrc: string;
  children: React.ReactNode;
};

export function PageHeroWithBackground({
  imageSrc,
  children,
}: PageHeroWithBackgroundProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background image layer */}
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
        />
        {/* Dark overlay to keep text readable in both themes */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Foreground content layer */}
      <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
        {children}
      </div>
    </section>
  );
}
