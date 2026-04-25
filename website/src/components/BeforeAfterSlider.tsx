import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DetailingGalleryItem } from '../config/detailingGallery';

const DEFAULT_POSITION = 30;

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
  const [beforeSliderPosition, setBeforeSliderPosition] = useState(DEFAULT_POSITION);
  const [afterSliderPosition, setAfterSliderPosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingSlider, setDraggingSlider] = useState<'before' | 'after' | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const safeIndex = items.length ? clamp(activeIndex, 0, items.length - 1) : 0;
  const activeItem = items[safeIndex];

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      if (!stageRef.current) return;
      const position = getPointerPosition(event.clientX, stageRef.current);
      if (draggingSlider === 'before') {
        setBeforeSliderPosition(position);
      } else if (draggingSlider === 'after') {
        setAfterSliderPosition(position);
      }
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
    setBeforeSliderPosition(DEFAULT_POSITION);
    setAfterSliderPosition(DEFAULT_POSITION);
  };

  const goPrev = () => selectIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  const goNext = () => selectIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>, slider: 'before' | 'after') => {
    if (!stageRef.current) return;
    event.preventDefault();
    const position = getPointerPosition(event.clientX, stageRef.current);
    if (slider === 'before') {
      setBeforeSliderPosition(position);
    } else {
      setAfterSliderPosition(position);
    }
    setDraggingSlider(slider);
    setIsDragging(true);
  };

  const handleSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, slider: 'before' | 'after') => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (slider === 'before') {
        setBeforeSliderPosition((value: number) => clamp(value - 4, 0, 100));
      } else {
        setAfterSliderPosition((value: number) => clamp(value - 4, 0, 100));
      }
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (slider === 'before') {
        setBeforeSliderPosition((value: number) => clamp(value + 4, 0, 100));
      } else {
        setAfterSliderPosition((value: number) => clamp(value + 4, 0, 100));
      }
    }

    if (event.key === 'Home') {
      event.preventDefault();
      if (slider === 'before') {
        setBeforeSliderPosition(0);
      } else {
        setAfterSliderPosition(0);
      }
    }

    if (event.key === 'End') {
      event.preventDefault();
      if (slider === 'before') {
        setBeforeSliderPosition(100);
      } else {
        setAfterSliderPosition(100);
      }
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

      {/* Before Image Slider Stage */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
          Before Image Slider
        </div>
        <div
          ref={stageRef}
          className="before-after-slider__stage"
          onPointerDown={(e) => handlePointerDown(e, 'before')}
          aria-label="Before image slider"
          style={{ cursor: 'ew-resize', touchAction: 'none' }}
        >
          <img
            src={activeItem.beforeImage}
            alt={activeItem.beforeAlt}
            className="before-after-slider__image"
            draggable={false}
            style={{ transform: `scale(${1 + (beforeSliderPosition / 100)})`, transformOrigin: 'center' }}
          />
          <div
            className="before-after-slider__divider"
            style={{ left: `${beforeSliderPosition}%` }}
            aria-hidden="true"
          >
            <div
              className="before-after-slider__handle"
              role="slider"
              tabIndex={0}
              aria-label="Adjust before image zoom"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(beforeSliderPosition)}
              aria-valuetext={`${Math.round(beforeSliderPosition)} percent zoom`}
              onKeyDown={(e) => handleSliderKeyDown(e, 'before')}
            >
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* After Image Slider Stage */}
      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
          After Image Slider
        </div>
        <div
          className="before-after-slider__stage"
          onPointerDown={(e) => handlePointerDown(e, 'after')}
          aria-label="After image slider"
          style={{ cursor: 'ew-resize', touchAction: 'none' }}
        >
          <img
            src={activeItem.afterImage}
            alt={activeItem.afterAlt}
            className="before-after-slider__image"
            draggable={false}
            style={{ transform: `scale(${1 + (afterSliderPosition / 100)})`, transformOrigin: 'center' }}
          />
          <div
            className="before-after-slider__divider"
            style={{ left: `${afterSliderPosition}%` }}
            aria-hidden="true"
          >
            <div
              className="before-after-slider__handle"
              role="slider"
              tabIndex={0}
              aria-label="Adjust after image zoom"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(afterSliderPosition)}
              aria-valuetext={`${Math.round(afterSliderPosition)} percent zoom`}
              onKeyDown={(e) => handleSliderKeyDown(e, 'after')}
            >
              <span />
              <span />
            </div>
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
      
      <style>{`
        .before-after-slider {
          display: grid;
          gap: 1rem;
        }
        
        .before-after-slider__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid var(--color-border-default);
          border-radius: 16px;
          background: var(--color-background-surface);
        }
        
        .before-after-slider__controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .before-after-slider__arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--color-border-default);
          border-radius: 8px;
          background: var(--color-background-surface);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .before-after-slider__arrow:hover {
          background: var(--color-background-hover);
          border-color: var(--color-border-hover);
        }
        
        .before-after-slider__count {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
          min-width: 40px;
          text-align: center;
        }
        
        .before-after-slider__stage {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--color-border-default);
          background: transparent;
        }
        
        .before-after-slider__image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }
        
        .before-after-slider__after-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .before-after-slider__badge {
          position: absolute;
          top: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          z-index: 2;
        }
        
        .before-after-slider__badge--before {
          left: 1rem;
          background: rgba(239, 68, 68, 0.9);
        }
        
        .before-after-slider__badge--after {
          right: 1rem;
          background: rgba(34, 197, 94, 0.9);
        }
        
        .before-after-slider__divider {
          position: absolute;
          top: 0;
          height: 100%;
          width: 4px;
          background: white;
          transform: translateX(-50%);
          z-index: 3;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }
        
        .before-after-slider__handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--color-border-default);
          cursor: ew-resize;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .before-after-slider__handle span {
          width: 4px;
          height: 4px;
          background: var(--color-text-secondary);
          border-radius: 50%;
        }
        
        .before-after-slider__details {
          display: grid;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--color-border-default);
          border-radius: 16px;
          background: var(--color-background-surface);
        }
        
        .before-after-slider__copy h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .before-after-slider__copy p {
          margin: 0;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        
        .before-after-slider__points {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .before-after-slider__point-mark {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--color-lime);
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .before-after-slider__dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0;
        }
        
        .before-after-slider__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid var(--color-border-default);
          background: var(--color-background-surface);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .before-after-slider__dot.is-active {
          background: var(--color-text-primary);
          border-color: var(--color-text-primary);
        }
        
        @media (max-width: 768px) {
          .before-after-slider__stage {
            height: 300px;
          }
          
          .before-after-slider__header {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
          
          .before-after-slider__badge {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </section>
  );
};
