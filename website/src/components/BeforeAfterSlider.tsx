import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DetailingGalleryItem } from '../config/detailingGallery';

export const BeforeAfterSlider = ({ items }: { items: DetailingGalleryItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const goPrev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  const goTo = (index: number) => setActiveIndex(index);

  return (
    <div className="w-full">
      {/* Image Container */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl shadow-lg bg-muted aspect-[16/9]">
          <img
            src="/images/LinkedIn-Background.jpg"
            alt={items[activeIndex].title}
            className="h-full w-full object-cover transition-opacity duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=1200';
            }}
          />
        </div>

        {/* BOTTOM-CENTER Arrows (Inside Image) */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full bg-black/60 text-white p-2 hover:bg-black/80 transition flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-black/60 text-white p-2 hover:bg-black/80 transition flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Dots and Navigation Indicator below image */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Caption centered at the bottom */}
      <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
        {items[activeIndex].title}
      </p>
    </div>
  );
};
