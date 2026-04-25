import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  hasAvailableSlot,
  type ScheduledInterval,
  type SlotBookingPackageId,
} from '../config/scheduler';

interface BookingCalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  unavailableDates: string[];
  markedDates?: string[];
  disablePast?: boolean;
  disableSundays?: boolean;
  /** When set with intervalsByDate, days with no valid start times match public availability logic. */
  slotPackageId?: SlotBookingPackageId;
  intervalsByDate?: Record<string, ScheduledInterval[]>;
  isExpanded?: boolean;
  showNoSlots?: boolean;
  dayBadges?: Record<string, string>;
}

export const BookingCalendar = ({
  selectedDate,
  onChange,
  unavailableDates,
  markedDates = [],
  disablePast = true,
  disableSundays = true,
  slotPackageId,
  intervalsByDate,
  isExpanded = false,
  showNoSlots = true,
  dayBadges = {},
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

  const now = new Date();

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
    const isUnavailable = showNoSlots && unavailableDates.includes(dateStr);
    const isMarked = markedDates.includes(dateStr);
    const noSlotsForPackage =
      showNoSlots && slotPackageId && intervalsByDate
        ? !hasAvailableSlot({
            date: dateStr,
            packageId: slotPackageId,
            intervals: intervalsByDate[dateStr] ?? [],
            now,
          })
        : false;
    const isDisabled = isPast || isSunday || (showNoSlots && isUnavailable);
    const isSelected = selectedDate === dateStr;
    const dayBadge = dayBadges[dateStr];

    days.push(
      <button
        key={i}
        type="button"
        className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
        disabled={isDisabled}
        onClick={() => {
          if (showNoSlots && noSlotsForPackage && !isSunday) {
            alert('This date is fully booked. No available time slots remain for the selected service package and vehicle configuration.');
          } else {
            onChange(dateStr);
          }
        }}
        aria-label={`${monthName} ${i}, ${year}`}
        title={
          showNoSlots && (isUnavailable || noSlotsForPackage)
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
        {dayBadge ? <small className="calendar-day-badge">{dayBadge}</small> : null}
        {(showNoSlots && noSlotsForPackage && !isSunday) ? (
          <div className="dot booked"></div>
        ) : null}
      </button>
    );
  }

  return (
    <div className={`calendar-container glass${isExpanded ? ' calendar-container-expanded' : ''}`}>
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
