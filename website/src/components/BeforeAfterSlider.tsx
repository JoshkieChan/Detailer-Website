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

  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  return (
    <div className="slideshow-root flex flex-col items-center w-full">
      {/* Image Area with Horizontal Slide */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-muted aspect-[16/9]">
        <div 
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="h-full w-full flex-shrink-0 relative">
              <img
                src="/images/slideshow-placeholder.png"
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=1200';
                }}
              />
              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 pt-12">
                <p className="text-white text-lg font-medium text-center tracking-wide">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Centered at the bottom */}
      <div className="mt-8 flex items-center gap-6">
        <button
          type="button"
          onClick={goPrev}
          className="group flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border p-2.5 hover:bg-background/80 hover:border-accent-primary transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="text-muted-foreground group-hover:text-accent-primary transition-colors" />
        </button>

        <div className="flex items-center gap-3">
          {items.map((_, index) => (
            <button
              key={items[index].id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeIndex 
                  ? 'bg-accent-primary w-8' 
                  : 'bg-muted-foreground/20 hover:bg-muted-foreground/40 w-1.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="group flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border p-2.5 hover:bg-background/80 hover:border-accent-primary transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="text-muted-foreground group-hover:text-accent-primary transition-colors" />
        </button>
      </div>
    </div>
  );
};
