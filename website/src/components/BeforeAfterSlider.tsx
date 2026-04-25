import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DetailingGalleryItem } from '../config/detailingGallery';

const DEFAULT_POSITION = 52;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getPointerPosition = (clientX: number, element: HTMLDivElement) => {
  const bounds = element.getBoundingClientRect();
  return clamp(((clientX - bounds.left) / bounds.width) * 100, 0, 100);
};

interface BeforeAfterSliderProps {
  items: DetailingGalleryItem[];
  showDetails?: boolean;
  ariaLabel?: string;
}

export const BeforeAfterSlider = ({
  items,
  showDetails = true,
  ariaLabel = 'Before and after gallery comparison',
}: BeforeAfterSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const safeIndex = items.length ? clamp(activeIndex, 0, items.length - 1) : 0;
  const activeItem = items[safeIndex];

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      if (!stageRef.current) return;
      setSliderPosition(getPointerPosition(event.clientX, stageRef.current));
    };

    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const selectIndex = (index: number) => {
    setActiveIndex(index);
    setSliderPosition(DEFAULT_POSITION);
  };

  const goPrev = () => selectIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  const goNext = () => selectIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    event.preventDefault();
    setSliderPosition(getPointerPosition(event.clientX, stageRef.current));
    setIsDragging(true);
  };

  const handleSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setSliderPosition((value) => clamp(value - 4, 0, 100));
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setSliderPosition((value) => clamp(value + 4, 0, 100));
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setSliderPosition(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      setSliderPosition(100);
    }
  };

  if (!activeItem) return null;

  return (
    <section className="before-after-slider">
      {items.length > 1 ? (
        <div className="before-after-slider__header">
          <span className="support-pill">{activeItem.serviceTag}</span>
          <div className="before-after-slider__controls">
            <button
              type="button"
              className="before-after-slider__arrow"
              onClick={goPrev}
              aria-label="Show previous comparison"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="before-after-slider__count">
              {activeIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              className="before-after-slider__arrow"
              onClick={goNext}
              aria-label="Show next comparison"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div
        ref={stageRef}
        className="before-after-slider__stage"
        onPointerDown={handlePointerDown}
        aria-label={ariaLabel}
        style={{ cursor: 'ew-resize', touchAction: 'none' }}
      >
        {/* Background: AFTER (Clean) */}
        <img
          src={activeItem.afterImage}
          alt={activeItem.afterAlt}
          className="before-after-slider__image"
          draggable={false}
        />
        
        {/* Overlay: BEFORE (Dirty) */}
        <div
          className="before-after-slider__after-layer"
          style={{ width: `${sliderPosition}%` }}
          aria-hidden="true"
        >
          <img
            src={activeItem.beforeImage}
            alt={activeItem.beforeAlt}
            className="before-after-slider__image"
            draggable={false}
          />
        </div>

        <span className="before-after-slider__badge before-after-slider__badge--before" style={{ pointerEvents: 'none' }}>
          {activeItem.beforeLabel}
        </span>
        <span className="before-after-slider__badge before-after-slider__badge--after" style={{ pointerEvents: 'none' }}>
          {activeItem.afterLabel}
        </span>

        <div
          className="before-after-slider__divider"
          style={{ left: `${sliderPosition}%` }}
          aria-hidden="true"
        >
          <div
            className="before-after-slider__handle"
            role="slider"
            tabIndex={0}
            aria-label="Adjust before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuetext={`${Math.round(sliderPosition)} percent of the before image shown`}
            onKeyDown={handleSliderKeyDown}
          >
            <span />
            <span />
          </div>
        </div>
      </div>

      {showDetails ? (
        <div className="before-after-slider__details">
          <div className="before-after-slider__copy">
            <h3>{activeItem.title}</h3>
            <p>{activeItem.summary}</p>
          </div>
          <ul className="package-bullets before-after-slider__points">
            {activeItem.detailPoints.map((point) => (
              <li key={point} className="feature-row">
                <span className="before-after-slider__point-mark" aria-hidden="true" />
                <span className="feature-text">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {items.length > 1 ? (
        <div className="before-after-slider__dots" aria-label="Gallery comparison selection">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectIndex(index)}
              className={`before-after-slider__dot ${index === activeIndex ? 'is-active' : ''}`}
              aria-label={`Show ${item.title}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
