import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  bookedDates: string[];
}

export const BookingCalendar = ({ selectedDate, onChange, bookedDates }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Prevent selecting dates before today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfMonth(year, month);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const days = [];
  
  // Padding for start of month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`pad-${i}`} className="calendar-day empty"></div>);
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    const dateStr = [
      year, 
      String(month + 1).padStart(2, '0'), 
      String(i).padStart(2, '0')
    ].join('-');
    
    // Check constraints
    const isToday = dateObj.getTime() === today.getTime();
    const isPast = dateObj < today || (isToday && new Date().getHours() >= 16);
    const isSunday = dateObj.getDay() === 0;
    const isBooked = bookedDates.includes(dateStr);
    const isDisabled = isPast || isSunday || isBooked;
    const isSelected = selectedDate === dateStr;

    days.push(
      <button
        key={i}
        type="button"
        className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
        disabled={isDisabled}
        onClick={() => onChange(dateStr)}
        aria-label={`${monthName} ${i}, ${year}`}
        title={isBooked ? 'Already booked' : isSunday ? 'Closed on Sundays' : isPast ? 'Past date' : 'Available'}
      >
        <span>{i}</span>
        {isBooked && <div className="dot booked"></div>}
      </button>
    );
  }

  return (
    <div className="calendar-container glass">
      <div className="calendar-header">
        <button type="button" onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
        <span className="month-label">{monthName} {year}</span>
        <button type="button" onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
      </div>
      
      <div className="calendar-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {days}
      </div>

      <div className="calendar-legend">
        <p>Only one vehicle per day. Dates shown in gray are fully booked.</p>
        <div className="legend-items">
          <div className="legend-item"><span className="swatch available"></span> Available</div>
          <div className="legend-item"><span className="swatch selected"></span> Selected</div>
          <div className="legend-item"><span className="swatch booked"></span> Booked</div>
        </div>
      </div>

      <style>{`
        .calendar-container { padding: 1.5rem; border-radius: var(--radius-md); border-top: 2px solid var(--color-accent-lime); width: 100%; }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .month-label { font-weight: 700; font-size: 1.2rem; color: var(--color-text-main); }
        .nav-btn { background: rgba(128,128,128,0.1); border: none; border-radius: 4px; color: var(--color-text-main); display: flex; padding: 0.25rem; transition: background 0.2s; }
        .nav-btn:hover { background: var(--color-accent-lime); color: #000; }
        
        .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 0.5rem; }
        .weekday { text-align: center; font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
        
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .calendar-day { display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 1; border: 1px solid var(--color-border); background: var(--color-bg-card-dark); color: var(--color-text-main); border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; position: relative; }
        .calendar-day:not(.disabled):hover { border-color: var(--color-accent-lime); }
        .calendar-day.selected { background: var(--color-accent-lime); color: #0f131f; border-color: var(--color-accent-lime); }
        .calendar-day.disabled { background: rgba(128,128,128,0.05); color: rgba(128,128,128,0.3); border-color: transparent; cursor: not-allowed; }
        .calendar-day.empty { background: transparent; border: none; pointer-events: none; }
        
        .dot { width: 4px; height: 4px; border-radius: 50%; margin-top: 2px; }
        .dot.booked { background: #ef4444; }

        .calendar-legend { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-muted); text-align: center; }
        .legend-items { display: flex; justify-content: center; gap: 1rem; margin-top: 0.75rem; }
        .legend-item { display: flex; align-items: center; gap: 0.25rem; }
        .swatch { width: 12px; height: 12px; border-radius: 2px; display: inline-block; border: 1px solid var(--color-border); }
        .swatch.available { background: var(--color-bg-card-dark); }
        .swatch.selected { background: var(--color-accent-lime); }
        .swatch.booked { background: rgba(128,128,128,0.05); border-color: transparent; }
      `}</style>
    </div>
  );
};
