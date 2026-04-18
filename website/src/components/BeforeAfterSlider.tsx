import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DetailingGalleryItem } from '../config/detailingGallery';

const AUTOPLAY_INTERVAL_MS = 5000;

export const BeforeAfterSlider = ({ items }: { items: DetailingGalleryItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  if (items.length === 0) return null;

  const activeSlide = items[activeIndex];
  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  return (
    <div className="slideshow-root">
      {/* Image Area */}
      <div className="relative group overflow-hidden rounded-2xl shadow-lg bg-muted aspect-[16/9]">
        <img
          src="/images/LinkedIn-Background.jpg"
          alt={activeSlide.title}
          className="h-full w-full object-cover transition-opacity duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=1200';
          }}
        />

        {/* Overlaid Arrows */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots under image */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={items[index].id}
            type="button"
            onClick={() => goTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-accent-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Caption */}
      <p className="mt-3 text-center text-sm font-medium text-muted-foreground tracking-wide">
        {activeSlide.title}
      </p>
    </div>
  );
};
