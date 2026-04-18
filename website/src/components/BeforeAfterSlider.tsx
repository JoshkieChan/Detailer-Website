import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { DetailingGalleryItem } from '../config/detailingGallery';

const AUTOPLAY_INTERVAL_MS = 4500;

export const BeforeAfterSlider = ({ items }: { items: DetailingGalleryItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, items.length]);

  if (items.length === 0) return null;

  const activeSlide = items[activeIndex];
  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
    setIsPlaying(false);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  return (
    <div className="slideshow-root">
      {/* Hero Image Area */}
      <div className="relative group overflow-hidden rounded-2xl shadow-xl bg-muted border border-border aspect-[16/9]">
        <img
          src="/images/LinkedIn-Background.jpg"
          alt={activeSlide.title}
          className="h-full w-full object-cover transition-opacity duration-700"
          onError={(e) => {
            // Fallback if the requested image isn't there yet
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=1200';
          }}
        />

        {/* Overlaid Arrows */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-md text-white p-2.5 opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all duration-300 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-md text-white p-2.5 opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all duration-300 z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Subtle Slide Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Recent Work</p>
          <h3 className="text-white text-xl font-semibold">{activeSlide.title}</h3>
        </div>
      </div>

      {/* Navigation Controls (Dots) */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {items.map((_, index) => (
            <button
              key={items[index].id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'bg-accent-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>

        <button
          type="button"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-1 flex items-center gap-2"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <><Pause size={14} /> Pause Slideshow</>
          ) : (
            <><Play size={14} /> Resume Slideshow</>
          )}
        </button>
      </div>
    </div>
  );
};
