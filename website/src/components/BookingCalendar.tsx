import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  unavailableDates: string[];
  markedDates?: string[];
  disablePast?: boolean;
  disableSundays?: boolean;
}

export const BookingCalendar = ({
  selectedDate,
  onChange,
  unavailableDates,
  markedDates = [],
  disablePast = true,
  disableSundays = true,
}: BookingCalendarProps) => {
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
    const isPast = disablePast && dateObj < today;
    const isSunday = disableSundays && dateObj.getDay() === 0;
    const isUnavailable = unavailableDates.includes(dateStr);
    const isMarked = markedDates.includes(dateStr);
    const isDisabled = isPast || isSunday || isUnavailable;
    const isSelected = selectedDate === dateStr;

    days.push(
      <button
        key={i}
        type="button"
        className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
        disabled={isDisabled}
        onClick={() => onChange(dateStr)}
        aria-label={`${monthName} ${i}, ${year}`}
        title={
          isUnavailable
            ? 'No valid slots left'
            : isMarked
              ? 'Has scheduled items'
              : isSunday
                ? 'Closed on Sundays'
                : isPast
                  ? 'Past date'
                  : 'Available'
        }
      >
        <span>{i}</span>
        {(isUnavailable || isMarked) && <div className={`dot ${isUnavailable ? 'booked' : 'selected'}`}></div>}
      </button>
    );
  }

  return (
    <div className="calendar-container glass">
      <div className="calendar-header">
        <button
          type="button"
          onClick={prevMonth}
          className="nav-btn"
          aria-label="Go to previous month"
          title="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="month-label">{monthName} {year}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="nav-btn"
          aria-label="Go to next month"
          title="Next month"
        >
          <ChevronRight size={20} />
        </button>
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
        <p>Dates shown in gray have no remaining valid start times after service duration and buffer are applied.</p>
        <div className="legend-items">
          <div className="legend-item"><span className="swatch available"></span> Available</div>
          <div className="legend-item"><span className="swatch selected"></span> Selected</div>
          <div className="legend-item"><span className="swatch booked"></span> No slots left</div>
        </div>
      </div>
    </div>
  );
};
