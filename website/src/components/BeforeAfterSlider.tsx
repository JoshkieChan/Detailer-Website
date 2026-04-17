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
    <section className="before-after-slider content-card reveal" data-reveal-delay="1">
      <div className="slider-topline">
        <div>
          <span className="eyebrow">Before / After Work</span>
          <h3 className="slider-title">{activeItem.title}</h3>
          <p className="section-copy">{activeItem.support}</p>
        </div>
        <div className="slider-controls">
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

      <div className="before-after-grid">
        <div className="gallery-card">
          <span className="support-pill slim">{activeItem.beforeLabel}</span>
          {activeItem.beforeImage ? (
            <img src={activeItem.beforeImage} alt={`${activeItem.title} before`} />
          ) : (
            <div className="gallery-placeholder">
              <strong>Before image slot</strong>
              <span>Add owner-provided work photos here.</span>
            </div>
          )}
        </div>
        <div className="gallery-card">
          <span className="support-pill slim">{activeItem.afterLabel}</span>
          {activeItem.afterImage ? (
            <img src={activeItem.afterImage} alt={`${activeItem.title} after`} />
          ) : (
            <div className="gallery-placeholder">
              <strong>After image slot</strong>
              <span>Slider is wired and ready for real before/after sets.</span>
            </div>
          )}
        </div>
      </div>

      <div className="slider-dots" role="tablist" aria-label="Before and after slides">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`slider-dot ${index === activeIndex ? 'active' : ''}`}
            aria-label={`Show ${item.title}`}
            aria-pressed={index === activeIndex}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
};
