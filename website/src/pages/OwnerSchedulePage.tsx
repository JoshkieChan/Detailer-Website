import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, PlusSquare, ShieldCheck } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { OwnerGate } from '../components/OwnerGate';
import { clearStoredOwnerPasscode, getStoredOwnerPasscode } from '../lib/ownerSession';
import { fetchOwnerSchedule, type OwnerScheduleEvent } from '../api/availability';
import { createAvailabilityBlock, createManualBooking, verifyOwnerPasscode, deleteOwnerEvent, deleteAllBookings, updateManualBooking } from '../api/ownerSchedule';
import {
  bookingPackages,
  calculateBookingFinancials,
  vehicleTypeLabels,
  type BookingPackageId,
  type LocationType,
  type VehicleTypeId,
} from '../data/bookingPricing';
import { buildBookingWindow, getHourlyStartSlots, type SlotBookingPackageId, type AddOnId, ADD_ON_DURATIONS, getTotalDuration } from '../config/scheduler';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

// Add-on options available for both Maintenance and Deep Reset
const ADD_ON_OPTIONS: Array<{ id: AddOnId; label: string; description: string }> = [
  {
    id: 'paintProtection',
    label: 'Light paint correction',
    description: 'Light machine polishing to boost gloss and reduce light swirls',
  },
  {
    id: 'petHairRemoval',
    label: 'Severe pet hair removal',
    description: 'Extra time and tools for heavy, embedded pet hair',
  },
  {
    id: 'engineBay',
    label: 'Light engine bay cleaning',
    description: 'Cleaning of accessible plastics and painted surfaces',
  },
  {
    id: 'headlightRestoration',
    label: 'Headlight restoration',
    description: 'Machine polishing of cloudy, oxidized headlight lenses',
  },
];

const OwnerSchedulePage = () => {
  const [events, setEvents] = useState<OwnerScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [systemMessage, setSystemMessage] = useState('');
  const [sessionOk, setSessionOk] = useState(() => Boolean(getStoredOwnerPasscode()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    paymentStatus: '',
    notes: '',
    startTime: '',
  });

  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    packageId: 'maintenance' as BookingPackageId,
    vehicleType: 'sedan' as VehicleTypeId,
    locationType: 'garage' as LocationType,
    startTime: '08:00',
    notes: '',
    paymentStatus: 'pending_payment',
    selectedAddOns: [] as AddOnId[],
    testMode: false,
  });

  const [blockForm, setBlockForm] = useState({
    startAt: `${new Date().toISOString().slice(0, 10)}T08:00`,
    endAt: `${new Date().toISOString().slice(0, 10)}T09:00`,
    reason: '',
  });

  const ownerPasscode = getStoredOwnerPasscode();

  const loadSchedule = useCallback(async () => {
    const pass = getStoredOwnerPasscode();
    if (!pass) return;
    const data = await fetchOwnerSchedule(pass);
    setEvents(data);
  }, []);

  useEffect(() => {
    if (!sessionOk) return;
    const frame = requestAnimationFrame(() => {
      void loadSchedule().catch(() => {
        clearStoredOwnerPasscode();
        setSessionOk(false);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [sessionOk, loadSchedule]);

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate]
  );

  const bookingEventsForSelectedDay = useMemo(
    () => eventsForSelectedDate.filter((event) => event.eventType === 'booking'),
    [eventsForSelectedDate]
  );

  const blockEventsForSelectedDay = useMemo(
    () => eventsForSelectedDate.filter((event) => event.eventType === 'blackout'),
    [eventsForSelectedDate]
  );

  const markedDates = useMemo(() => Array.from(new Set(events.map((event) => event.date))), [events]);

  const dayBadges = useMemo(() => {
    const byDate: Record<string, string[]> = {};
    for (const event of events) {
      byDate[event.date] = byDate[event.date] || [];
      byDate[event.date].push(event.startTime);
    }
    const labels: Record<string, string> = {};
    for (const [date, times] of Object.entries(byDate)) {
      const sorted = [...times].sort();
      labels[date] = sorted.length <= 2 ? sorted.join(', ') : `${sorted.length} items`;
    }
    return labels;
  }, [events]);

  const currentSlots = getHourlyStartSlots(bookingForm.packageId as SlotBookingPackageId);

  const manualPricing = useMemo(
    () =>
      calculateBookingFinancials({
        packageId: bookingForm.packageId,
        vehicleType: bookingForm.vehicleType,
        locationType: bookingForm.locationType,
      }),
    [bookingForm.packageId, bookingForm.vehicleType, bookingForm.locationType]
  );

  if (!sessionOk) {
    return (
      <div className="page-shell owner-page">
        <OwnerGate onVerify={verifyOwnerPasscode} onUnlocked={() => setSessionOk(true)}>
          <div />
        </OwnerGate>
      </div>
    );
  }

  const allTimeRevenue = events
    .filter(e => e.eventType === 'booking' && e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + (e.calculatedPrice || 0), 0);
  
  const pendingRevenue = events
    .filter(e => e.eventType === 'booking' && e.paymentStatus !== 'paid')
    .reduce((sum, e) => sum + (e.remainingBalance || 0), 0);

  const packageCounts = events
    .filter(e => e.eventType === 'booking')
    .reduce((acc, e) => {
      const pkg = e.packageLabel || 'Unknown';
      acc[pkg] = (acc[pkg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const popularPackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="page-shell owner-page">
      <section className="page-hero text-center reveal compact-hero">
        <span className="eyebrow">Owner Schedule</span>
        <h1 className="hero-title">Manual scheduling, blackout blocks, and booking visibility.</h1>
        <p className="hero-subtitle">
          Owner mode shows live bookings, blackout windows, notes, and payment state. Public users never see this data.
        </p>
        <p className="field-help" style={{ marginTop: '0.5rem' }}>
          <strong>Owner capacity rules:</strong> The system books 08:00–20:00 with a 12-hour max per day. Every job's time is base package + add-ons by vehicle size. Any booking 10+ hours becomes a single-car day, and Deep Reset Large SUV/Truck can auto-span two days if total time exceeds 12 hours.
        </p>
      </section>

      {systemMessage ? <div className="content-card reveal is-visible">{systemMessage}</div> : null}

      <section className="card-grid three reveal">
        <article className="content-card" style={{ padding: '1.5rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Paid Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(allTimeRevenue)}</div>
        </article>
        <article className="content-card" style={{ padding: '1.5rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Pending Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning)' }}>{formatCurrency(pendingRevenue)}</div>
        </article>
        <article className="content-card" style={{ padding: '1.5rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Popular Package</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{popularPackage}</div>
        </article>
      </section>

      <section className="content-card owner-calendar-shell expanded reveal">
        <div className="owner-calendar-topbar">
          <div className="support-pill">
            <CalendarDays size={16} />
            Calendar view (expanded)
          </div>
        </div>

        <BookingCalendar
          selectedDate={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setBookingForm((current) => ({ ...current, startTime: '', notes: current.notes }));
            setBlockForm((current) => ({
              ...current,
              startAt: `${date}T08:00`,
              endAt: `${date}T09:00`,
            }));
          }}
          unavailableDates={[]}
          markedDates={markedDates}
          dayBadges={dayBadges}
          disablePast={false}
          disableSundays={false}
          isExpanded
        />
      </section>

      <section className="card-grid two owner-detail-layout">
        <article className="content-card owner-day-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Appointments on {selectedDate}</h2>
            <button 
              className="btn outline-lime" 
              disabled={isSubmitting}
              style={{ minHeight: '36px', padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete ALL bookings from the system? This cannot be undone.')) {
                  setIsSubmitting(true);
                  try {
                    await deleteAllBookings({ passcode: ownerPasscode || '' });
                    setSystemMessage('All bookings deleted.');
                    await loadSchedule();
                  } catch (e: unknown) {
                    setSystemMessage('Failed to delete booking: ' + (e instanceof Error ? e.message : 'Unknown error'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }
              }}
            >
              {isSubmitting ? 'Deleting all...' : 'Delete all bookings'}
            </button>
          </div>

          {eventsForSelectedDate.length === 0 ? (
            <p className="section-copy">No appointments on this day yet.</p>
          ) : (
            <>
              {bookingEventsForSelectedDay.length > 0 ? (
                <div className="owner-detail-block">
                  <h3>Bookings ({bookingEventsForSelectedDay.length})</h3>
                  {bookingEventsForSelectedDay.map((event) => (
                    <article className={`owner-event-card booking-card ${event.testMode ? 'test-booking' : ''}`} key={event.id}>
                      {event.testMode && (
                        <div className="test-badge">TEST</div>
                      )}
                      {editingId === event.id ? (
                        <div className="owner-edit-form">
                          <h4 style={{ marginBottom: '1rem' }}>Edit Booking</h4>
                          <div className="owner-form-grid">
                            <label>
                              Payment status
                              <select
                                value={editForm.paymentStatus}
                                onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                              >
                                <option value="pending_payment">pending_payment</option>
                                <option value="paid">paid</option>
                              </select>
                            </label>
                            <label className="full-width">
                              Notes
                              <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              />
                            </label>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                              className="btn primary"
                              disabled={isSubmitting}
                              onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                  await updateManualBooking({
                                    passcode: ownerPasscode || '',
                                    id: event.id,
                                    updates: {
                                      payment_status: editForm.paymentStatus,
                                      notes: editForm.notes,
                                    },
                                  });
                                  setSystemMessage('Booking updated.');
                                  setEditingId(null);
                                  await loadSchedule();
                                } catch (err: any) {
                                  setSystemMessage(err.message || 'Update failed');
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                            >
                              {isSubmitting ? 'Saving...' : 'Save changes'}
                            </button>
                            <button className="btn ghost" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="owner-event-card-header">
                            <div className="owner-event-card-time">
                              {event.startTime && event.endTime
                                ? `${event.startTime}–${event.endTime}`
                                : event.startTime
                                  ? `Start: ${event.startTime}`
                                  : null}
                            </div>
                            <div className="owner-event-card-summary">
                              {event.packageLabel || event.packageId || 'n/a'} · {event.locationType || 'n/a'} · {event.vehicleType || event.vehicleInfo || 'n/a'}
                            </div>
                            <div className={`owner-event-card-status ${event.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                              {event.paymentStatus || 'n/a'}
                            </div>
                          </div>
                          <div className="owner-event-card-meta">
                            <strong>{event.customerName || 'n/a'}</strong>
                            <span className="owner-event-card-source">{event.bookingSource || 'web'}</span>
                          </div>
                          <div className="owner-event-card-details">
                            <div>
                              Phone: {event.phone || 'n/a'} | Email: {event.email || 'n/a'}
                            </div>
                            <div>Notes: {event.notes || 'None'}</div>
                          </div>
                          <div className="owner-event-card-pricing">
                            Pricing: {formatCurrency(event.calculatedPrice || 0)} subtotal · {formatCurrency(event.depositAmount || 0)} deposit · {formatCurrency(event.remainingBalance || 0)} remaining
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border-default)', paddingTop: '1rem' }}>
                            <button 
                              className="btn ghost"
                              style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-soft)', padding: '0.4rem 0.8rem', minHeight: '32px', fontSize: '0.85rem' }}
                              onClick={() => {
                                setEditingId(event.id);
                                setEditForm({
                                  paymentStatus: event.paymentStatus || 'pending_payment',
                                  notes: event.notes || '',
                                  startTime: event.startTime || '08:00',
                                });
                              }}
                            >
                              Edit booking
                            </button>
                            <button 
                              className="btn ghost" 
                              disabled={isSubmitting}
                              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-soft)', padding: '0.4rem 0.8rem', minHeight: '32px', fontSize: '0.85rem' }}
                              onClick={async () => {
                                if (window.confirm('Delete this booking?')) {
                                  setIsSubmitting(true);
                                  try {
                                    await deleteOwnerEvent({ passcode: ownerPasscode || '', id: event.id, type: 'booking' });
                                    setSystemMessage('Booking deleted.');
                                    await loadSchedule();
                                  } catch (err: unknown) {
                                    setSystemMessage('Failed to delete booking: ' + (err instanceof Error ? err.message : 'Unknown error'));
                                  } finally {
                                    setIsSubmitting(false);
                                  }
                                }
                              }}
                            >
                              {isSubmitting ? 'Deleting...' : 'Delete booking'}
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              ) : null}

              {blockEventsForSelectedDay.length > 0 ? (
                <div className="owner-detail-block">
                  <h3>Blackout blocks ({blockEventsForSelectedDay.length})</h3>
                  {blockEventsForSelectedDay.map((event) => (
                    <article className="owner-event-card blackout-card" key={event.id}>
                      <div className="owner-event-card-header">
                        <div className="owner-event-card-time">
                          {event.startTime && event.endTime ? `${event.startTime}–${event.endTime}` : null}
                        </div>
                        <div className="owner-event-card-summary">Blackout block</div>
                        <div className="owner-event-card-status blackout-status">Block</div>
                      </div>
                      <div className="owner-event-card-details">
                        <div>Reason: {event.reason || 'Owner block'}</div>
                      </div>
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border-default)', paddingTop: '1rem' }}>
                        <button 
                          className="btn ghost" 
                          disabled={isSubmitting}
                          style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-soft)', padding: '0.4rem 0.8rem', minHeight: '32px', fontSize: '0.85rem' }}
                          onClick={async () => {
                            if (window.confirm('Delete this blackout block?')) {
                              setIsSubmitting(true);
                              try {
                                await deleteOwnerEvent({ passcode: ownerPasscode || '', id: event.id, type: 'blackout' });
                                setSystemMessage('Blackout block deleted.');
                                await loadSchedule();
                              } catch (e: unknown) {
                                setSystemMessage('Failed to delete blackout: ' + (e instanceof Error ? e.message : 'Unknown error'));
                              } finally {
                                setIsSubmitting(false);
                              }
                            }
                          }}
                        >
                          {isSubmitting ? 'Deleting...' : 'Delete block'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}

          <div className="support-pill mt-2">
            <PlusSquare size={16} />
            Create manual booking for {selectedDate}
          </div>
          <article className="content-card owner-manual-booking-card">
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
                <option value="garage">Studio</option>
                <option value="mobile">On-Island Mobile</option>
              </select>
            </label>
            <label className="full-width">
              Add-ons (optional)
              <div className="addon-selector-list">
                {ADD_ON_OPTIONS.map((addon) => {
                  const isSelected = bookingForm.selectedAddOns.includes(addon.id);
                  const addOnDuration = ADD_ON_DURATIONS[addon.id][bookingForm.vehicleType];
                  const durationHours = (addOnDuration / 60).toFixed(1);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      className={`addon-selector-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        const newAddOns = isSelected
                          ? bookingForm.selectedAddOns.filter((id) => id !== addon.id)
                          : [...bookingForm.selectedAddOns, addon.id];
                        setBookingForm({ ...bookingForm, selectedAddOns: newAddOns });
                      }}
                    >
                      <div className="addon-selector-left">
                        <div className={`addon-check ${isSelected ? 'selected' : ''}`}>
                          {isSelected && <span>✓</span>}
                        </div>
                        <div className="addon-copy">
                          <div className="addon-selector-title">
                            <span>{addon.label}</span>
                            <span className="addon-duration">+{durationHours}h</span>
                          </div>
                          <p className="field-help">{addon.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="field-help" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                Estimated total time: {(getTotalDuration({
                  packageId: bookingForm.packageId as SlotBookingPackageId,
                  vehicleType: bookingForm.vehicleType,
                  selectedAddOns: bookingForm.selectedAddOns,
                }) / 60).toFixed(1)} hours (base + add-ons). Bookings 10+ hours block the full day; Deep Large SUV/Truck may reserve two days.
              </p>
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
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={bookingForm.testMode}
                onChange={(event) => setBookingForm({ ...bookingForm, testMode: event.target.checked })}
              />
              <span>Create as test booking (does not affect availability)</span>
            </label>
            <label>
              Payment status
              <select
                value={bookingForm.paymentStatus}
                onChange={(event) => setBookingForm({ ...bookingForm, paymentStatus: event.target.value })}
              >
                <option value="pending_payment">pending_payment</option>
                <option value="paid">paid</option>
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
            <div className="owner-pricing-readout full-width">
              <p className="field-help">Deposit pricing (same rules as public booking)</p>
              <p>Subtotal {formatCurrency(manualPricing.subtotal)}</p>
              <p>Deposit (20%) {formatCurrency(manualPricing.depositAmount)}</p>
              <p>Tax on deposit {formatCurrency(manualPricing.taxAmount)}</p>
              <p>
                <strong>Due today {formatCurrency(manualPricing.totalToday)}</strong> (
                {Math.round(manualPricing.totalToday * 100)} cents)
              </p>
            </div>
          </div>
          </article>

          <button
            type="button"
            className="btn primary mt-1"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const window = buildBookingWindow({
                  date: selectedDate,
                  packageId: bookingForm.packageId as SlotBookingPackageId,
                  startTime: bookingForm.startTime,
                  vehicleType: bookingForm.vehicleType,
                  selectedAddOns: bookingForm.selectedAddOns,
                });
                await createManualBooking({
                  passcode: ownerPasscode,
                  payload: {
                    ...bookingForm,
                    date: selectedDate,
                    endTime: window.endTime,
                    testMode: bookingForm.testMode,
                    blockedUntil: window.blockedUntil,
                    serviceDurationMinutes: window.serviceDuration,
                    bufferMinutes: window.bufferMinutes,
                    base_price: manualPricing.basePrice,
                    addons_price: manualPricing.addOnsPrice,
                    calculated_price: manualPricing.subtotal,
                    deposit_amount: manualPricing.depositAmount,
                    tax_amount: manualPricing.taxAmount,
                    total_today: manualPricing.totalToday,
                    remaining_balance: manualPricing.remainingBalance,
                    total_amount_cents: Math.round(manualPricing.totalToday * 100),
                  },
                });
                setSystemMessage('Manual booking saved.');
                await loadSchedule();
              } catch (err: unknown) {
                setSystemMessage('Failed to create manual booking: ' + (err instanceof Error ? err.message : 'Unknown error'));
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save manual booking'}
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
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await createAvailabilityBlock({
                  passcode: ownerPasscode,
                  startAt: blockForm.startAt,
                  endAt: blockForm.endAt,
                  reason: blockForm.reason,
                });
                setSystemMessage('Blackout block saved.');
                await loadSchedule();
              } catch (err: unknown) {
                setSystemMessage('Failed to create blackout: ' + (err instanceof Error ? err.message : 'Unknown error'));
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save blackout block'}
          </button>
        </article>
      </section>

      <style>{`
        .owner-calendar-shell {
          width: 100%;
          overflow: visible;
        }

        .calendar-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overflow-y: visible;
        }

        .calendar-weekdays,
        .calendar-grid {
          width: 100%;
          min-width: 0;
        }

        .calendar-day {
          min-width: 0;
        }

        .owner-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .owner-form-grid label {
          display: grid;
          gap: 0.35rem;
          width: 100%;
        }

        .owner-form-grid input,
        .owner-form-grid select,
        .owner-form-grid textarea {
          width: 100%;
          min-width: 0;
        }

        .owner-form-grid .full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 960px) {
          .owner-form-grid {
            grid-template-columns: 1fr;
          }

          .calendar-container {
            padding: 1rem;
          }

          .calendar-weekdays,
          .calendar-grid {
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerSchedulePage;
