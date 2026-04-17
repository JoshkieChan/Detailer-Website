import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Maximize2, Minimize2, PlusSquare, ShieldCheck } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import {
  clearStoredOwnerPasscode,
  getStoredOwnerPasscode,
  OwnerGate,
} from '../components/OwnerGate';
import { fetchOwnerSchedule } from '../api/availability';
import { createAvailabilityBlock, createManualBooking, verifyOwnerPasscode } from '../api/ownerSchedule';
import { bookingPackages, locationTypeLabels, vehicleTypeLabels, type BookingPackageId, type LocationType, type VehicleTypeId } from '../data/bookingPricing';
import { buildBookingWindow, getHourlyStartSlots, type SlotBookingPackageId } from '../config/scheduler';

const formatEventTime = (start: string, end: string) => `${start} to ${end}`;

const OwnerSchedulePage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isExpanded, setIsExpanded] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [isReady, setIsReady] = useState(Boolean(getStoredOwnerPasscode()));
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    packageId: 'maintenance' as BookingPackageId,
    vehicleType: 'sedan' as VehicleTypeId,
    locationType: 'garage' as LocationType,
    date: new Date().toISOString().slice(0, 10),
    startTime: '08:00',
    notes: '',
    paymentStatus: 'paid',
  });
  const [blockForm, setBlockForm] = useState({
    startAt: `${new Date().toISOString().slice(0, 10)}T08:00`,
    endAt: `${new Date().toISOString().slice(0, 10)}T09:00`,
    reason: '',
  });

  const ownerPasscode = getStoredOwnerPasscode();

  const loadSchedule = async () => {
    if (!ownerPasscode) return;
    const data = await fetchOwnerSchedule(ownerPasscode);
    setEvents(data);
    setIsReady(true);
  };

  useEffect(() => {
    loadSchedule().catch(() => {
      clearStoredOwnerPasscode();
      setIsReady(false);
    });
  }, []);

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate]
  );
  const markedDates = useMemo(
    () => Array.from(new Set(events.map((event) => event.date))),
    [events]
  );

  const currentSlots = getHourlyStartSlots(bookingForm.packageId as SlotBookingPackageId);

  if (!isReady) {
    return (
      <div className="page-shell owner-page">
        <OwnerGate onVerify={verifyOwnerPasscode}>
          <div />
        </OwnerGate>
      </div>
    );
  }

  return (
    <div className="page-shell owner-page">
      <section className="page-hero text-center reveal compact-hero">
        <span className="eyebrow">Owner Schedule</span>
        <h1 className="hero-title">Manual scheduling, blackout blocks, and booking visibility.</h1>
        <p className="hero-subtitle">
          Owner mode shows live bookings, blackout windows, notes, and payment state. Public users never see this data.
        </p>
      </section>

      {systemMessage ? <div className="content-card reveal is-visible">{systemMessage}</div> : null}

      <section className={`content-card owner-calendar-shell ${isExpanded ? 'expanded' : ''}`}>
        <div className="owner-calendar-topbar">
          <div className="support-pill">
            <CalendarDays size={16} />
            Calendar view
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isExpanded ? 'Return to normal size' : 'Expand calendar'}
          </button>
        </div>

        <BookingCalendar
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          unavailableDates={[]}
          markedDates={markedDates}
          disablePast={false}
          disableSundays={false}
        />

        <div className="owner-event-list">
          <h2 className="section-title">Entries for {selectedDate}</h2>
          {eventsForSelectedDate.length === 0 ? (
            <p className="section-copy">No bookings or blackout blocks on this date yet.</p>
          ) : (
            eventsForSelectedDate.map((event) => (
              <article className="owner-event-card" key={event.id}>
                <div className="owner-event-head">
                  <strong>{event.title}</strong>
                  <span>{formatEventTime(event.startTime, event.endTime)}</span>
                </div>
                <div className="owner-event-meta">
                  {event.details.map((detail: string) => (
                    <p key={detail}>{detail}</p>
                  ))}
                  <p>Payment state: {event.paymentStatus || 'n/a'}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card-grid two">
        <article className="content-card">
          <div className="support-pill">
            <PlusSquare size={16} />
            Manual in-person booking
          </div>
          <div className="owner-form-grid">
            <label>
              Customer name
              <input
                value={bookingForm.fullName}
                onChange={(event) => setBookingForm({ ...bookingForm, fullName: event.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={bookingForm.email}
                onChange={(event) => setBookingForm({ ...bookingForm, email: event.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={bookingForm.phone}
                onChange={(event) => setBookingForm({ ...bookingForm, phone: event.target.value })}
              />
            </label>
            <label>
              Package
              <select
                value={bookingForm.packageId}
                onChange={(event) =>
                  setBookingForm({
                    ...bookingForm,
                    packageId: event.target.value as BookingPackageId,
                    startTime: getHourlyStartSlots(event.target.value as SlotBookingPackageId)[0]?.value || '08:00',
                  })
                }
              >
                <option value="maintenance">{bookingPackages.maintenance.label}</option>
                <option value="deepReset">{bookingPackages.deepReset.label}</option>
              </select>
            </label>
            <label>
              Vehicle size
              <select
                value={bookingForm.vehicleType}
                onChange={(event) => setBookingForm({ ...bookingForm, vehicleType: event.target.value as VehicleTypeId })}
              >
                <option value="sedan">{vehicleTypeLabels.sedan}</option>
                <option value="smallSuv">{vehicleTypeLabels.smallSuv}</option>
                <option value="largeSuvTruck">{vehicleTypeLabels.largeSuvTruck}</option>
              </select>
            </label>
            <label>
              Location
              <select
                value={bookingForm.locationType}
                onChange={(event) => setBookingForm({ ...bookingForm, locationType: event.target.value as LocationType })}
              >
                <option value="garage">{locationTypeLabels.garage}</option>
                <option value="mobile">{locationTypeLabels.mobile}</option>
              </select>
            </label>
            <label>
              Date
              <input
                type="date"
                value={bookingForm.date}
                onChange={(event) => setBookingForm({ ...bookingForm, date: event.target.value })}
              />
            </label>
            <label>
              Start time
              <select
                value={bookingForm.startTime}
                onChange={(event) => setBookingForm({ ...bookingForm, startTime: event.target.value })}
              >
                {currentSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment state
              <select
                value={bookingForm.paymentStatus}
                onChange={(event) => setBookingForm({ ...bookingForm, paymentStatus: event.target.value })}
              >
                <option value="paid">paid</option>
                <option value="pending_payment">pending_payment</option>
                <option value="unpaid">unpaid</option>
                <option value="cancelled">cancelled</option>
              </select>
            </label>
            <label className="full-width">
              Address / location notes
              <input
                value={bookingForm.address}
                onChange={(event) => setBookingForm({ ...bookingForm, address: event.target.value })}
              />
            </label>
            <label className="full-width">
              Notes
              <textarea
                value={bookingForm.notes}
                onChange={(event) => setBookingForm({ ...bookingForm, notes: event.target.value })}
              />
            </label>
          </div>
          <button
            type="button"
            className="btn primary mt-1"
            onClick={async () => {
              const window = buildBookingWindow({
                date: bookingForm.date,
                packageId: bookingForm.packageId as SlotBookingPackageId,
                startTime: bookingForm.startTime,
              });
              await createManualBooking({
                passcode: ownerPasscode,
                payload: {
                  ...bookingForm,
                  endTime: window.endTime,
                  blockedUntil: window.blockedUntil,
                  serviceDurationMinutes: window.rule.durationMinutes,
                  bufferMinutes: window.rule.bufferMinutes,
                },
              });
              setSystemMessage('Manual booking saved.');
              await loadSchedule();
            }}
          >
            Save manual booking
          </button>
        </article>

        <article className="content-card">
          <div className="support-pill">
            <ShieldCheck size={16} />
            Blackout block
          </div>
          <div className="owner-form-grid">
            <label>
              Start
              <input
                type="datetime-local"
                value={blockForm.startAt}
                onChange={(event) => setBlockForm({ ...blockForm, startAt: event.target.value })}
              />
            </label>
            <label>
              End
              <input
                type="datetime-local"
                value={blockForm.endAt}
                onChange={(event) => setBlockForm({ ...blockForm, endAt: event.target.value })}
              />
            </label>
            <label className="full-width">
              Reason
              <input
                value={blockForm.reason}
                onChange={(event) => setBlockForm({ ...blockForm, reason: event.target.value })}
                placeholder="Travel, cleanup, lunch, in-person job, etc."
              />
            </label>
          </div>
          <button
            type="button"
            className="btn secondary mt-1"
            onClick={async () => {
              await createAvailabilityBlock({
                passcode: ownerPasscode,
                startAt: blockForm.startAt,
                endAt: blockForm.endAt,
                reason: blockForm.reason,
              });
              setSystemMessage('Blackout block saved.');
              await loadSchedule();
            }}
          >
            Save blackout block
          </button>
        </article>
      </section>
    </div>
  );
};

export default OwnerSchedulePage;
