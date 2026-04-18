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

  const activeItem = items[activeIndex];
  const goTo = (nextIndex: number) =>
    setActiveIndex((nextIndex + items.length) % items.length);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background/80 backdrop-blur-sm shadow-sm p-4 sm:p-6 reveal" data-reveal-delay="1">
      {/* Slider header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-semibold">{activeItem.title}</h3>
          <p className="text-sm text-muted-foreground">{activeItem.support}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="slider-icon-btn"
            onClick={() => setIsPlaying((current) => !current)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            className="slider-icon-btn"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="slider-icon-btn"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 overflow-hidden hover:bg-muted/60 hover:-translate-y-0.5 transition-all duration-300">
          <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
            {activeItem.beforeImage ? (
              <img src={activeItem.beforeImage} alt={`${activeItem.title} before`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Before image slot ready</p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-1">
              {activeItem.beforeLabel || 'Before'}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeItem.beforeImage ? 'Condition before detailing service.' : 'Add owner-provided work photos here.'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 overflow-hidden hover:bg-muted/60 hover:-translate-y-0.5 transition-all duration-300">
          <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            {activeItem.afterImage ? (
              <img src={activeItem.afterImage} alt={`${activeItem.title} after`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">After image slot ready</p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-1">
              {activeItem.afterLabel || 'After'}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeItem.afterImage ? 'Final result after detailing service.' : 'Slider is wired and ready for real before/after sets.'}
            </p>
          </div>
        </div>
      </div>

      {/* Slide selector dots */}
      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Before and after slides">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-accent-primary w-4' : 'bg-border hover:bg-muted-foreground'}`}
            aria-label={`Show ${item.title}`}
            aria-pressed={index === activeIndex}
            onClick={() => {
              goTo(index);
              setIsPlaying(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};
