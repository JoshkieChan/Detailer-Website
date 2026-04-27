import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, RefObject } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { PageHero } from '../components/PageHero';
import { fetchAvailability } from '../api/availability';
import {
  maintenancePlans,
  maintenancePlanById,
  type MembershipIntent,
} from '../data/maintenancePlans';
import {
  bookingPackages,
  calculateBookingFinancials,
  isBookingPackageId,
  isLocationType,
  isVehicleTypeId,
  vehicleTypeLabels,
  type BookingPackageId,
} from '../data/bookingPricing';
import {
  SERVICE_TIMING_RULES,
  buildBookingWindow,
  getHourlyStartSlots,
  getNextAvailableOpening,
  intervalsOverlap,
  timeToMinutes,
  type ScheduledInterval,
  type SlotBookingPackageId,
  type AddOnId,
  ADD_ON_DURATIONS,
} from '../config/scheduler';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function validateFullName(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return 'Please enter your full name.';
  if (trimmed.split(/\s+/).length < 2) return 'Please enter both first and last name.';
  return '';
}

function validatePhone(v: string) {
  const digits = v.replace(/\D/g, '');
  if (!digits || digits.length !== 10) return 'Please enter a valid US phone number (10 digits).';
  return '';
}

function validateEmail(v: string) {
  if (!v.trim() || !EMAIL_REGEX.test(v)) return 'Please enter a valid email address.';
  return '';
}

interface NominatimResult {
  display_name: string;
  place_id: number;
}

const AddressAutocomplete = ({
  inputId,
  value,
  onChange,
  hasError,
}: {
  inputId: string;
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 4) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(nextValue), 400);
  };

  const handlePick = (name: string) => {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="address-autocomplete">
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="123 Oak St, Oak Harbor, WA"
        className={hasError ? 'input-error' : ''}
        autoComplete="off"
      />
      {open ? (
        <ul className="autocomplete-dropdown">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id} onMouseDown={() => handlePick(suggestion.display_name)}>
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const FieldError = ({ msg }: { msg: string }) =>
  msg ? (
    <span className="field-error-msg">
      <AlertCircle size={13} className="field-error-icon" />
      {msg}
    </span>
  ) : null;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const rawPackage = searchParams.get('package') || '';
  const packageIdParam: BookingPackageId | '' =
    rawPackage === 'maintenance' ? 'maintenance' : rawPackage === 'deep-reset' ? 'deepReset' : '';

  const [systemError, setSystemError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [availability, setAvailability] = useState<{
    unavailableDates: string[];
    intervalsByDate: Record<string, Array<{ startTime: string; blockedUntil: string; endTime: string }>>;
    nextAvailableOpening: { date: string; startTime: string; label: string; serviceLabel: string } | null;
  }>({
    unavailableDates: [],
    intervalsByDate: {},
    nextAvailableOpening: null,
  });

  const [fieldErrors, setFieldErrors] = useState({
    packageType: '',
    vehicleType: '',
    locationType: '',
    date: '',
    startTime: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });

  const [formData, setFormData] = useState({
    packageType: packageIdParam,
    vehicleType: '',
    locationType: '',
    date: '',
    startTime: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    membershipIntent: 'none' as MembershipIntent,
    selectedAddOns: [] as AddOnId[],
  });

  const packageRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const fieldRefs: Record<string, RefObject<HTMLDivElement | null>> = {
    packageType: packageRef,
    vehicleType: scheduleRef,
    locationType: detailsRef,
    date: scheduleRef,
    startTime: scheduleRef,
    fullName: detailsRef,
    phone: detailsRef,
    email: detailsRef,
    address: detailsRef,
  };

  const validPackage = isBookingPackageId(formData.packageType) ? formData.packageType : null;
  const validVehicle = isVehicleTypeId(formData.vehicleType) ? formData.vehicleType : null;
  const validLocation = isLocationType(formData.locationType) ? formData.locationType : null;
  const showNoSlots = Boolean(validPackage && validVehicle && validLocation);

  useEffect(() => {
    if (!validPackage) return;

    setAvailabilityError(null);
    fetchAvailability(
      validPackage as SlotBookingPackageId,
      validVehicle || 'sedan',
      formData.selectedAddOns
    )
      .then((data) => {
        setAvailability(data);
      })
      .catch(() => {
        setAvailabilityError('Could not load live availability right now.');
      });
  }, [validPackage, validVehicle, formData.selectedAddOns]);


  const hourlySlots = validPackage ? getHourlyStartSlots(validPackage as SlotBookingPackageId, validVehicle || 'sedan') : [];
  const selectedDayIntervals = formData.date ? availability.intervalsByDate[formData.date] || [] : [];

  const calendarIntervalsByDate = useMemo(() => {
    if (!validPackage) return undefined;
    const out: Record<string, ScheduledInterval[]> = {};
    for (const [date, list] of Object.entries(availability.intervalsByDate)) {
      out[date] = list.map((interval) => ({ ...interval, date }));
    }
    return out;
  }, [validPackage, availability.intervalsByDate]);

  const availableTimeSlots = useMemo(() => {
    if (!validPackage || !formData.date) return [];

    // Use Pacific time for today comparison
    const now = new Date();
    const pacificDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const todayStr = pacificDate; // 'YYYY-MM-DD'

    return hourlySlots.map((slot) => {
      const slotWindow = buildBookingWindow({
        date: formData.date,
        packageId: validPackage as SlotBookingPackageId,
        startTime: slot.value,
        vehicleType: validVehicle || 'sedan',
        selectedAddOns: formData.selectedAddOns,
      });
      const slotStart = timeToMinutes(slot.value);

      const pacificTimeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);
      const [h, m] = pacificTimeStr.split(':').map(Number);
      const currentMinutes = h * 60 + m;

      const isPastSlot = formData.date === todayStr && currentMinutes >= slotStart;
      const overlaps = selectedDayIntervals.some((interval) =>
        intervalsOverlap(
          slotWindow.startMinutes,
          slotWindow.blockedUntilMinutes,
          timeToMinutes(interval.startTime),
          timeToMinutes(interval.blockedUntil)
        )
      );

      return {
        ...slot,
        disabled: isPastSlot || overlaps,
      };
    });
  }, [formData.date, hourlySlots, selectedDayIntervals, validPackage]);

  useEffect(() => {
    if (!formData.startTime) return;
    const currentSlot = availableTimeSlots.find((slot) => slot.value === formData.startTime);
    if (!currentSlot || currentSlot.disabled) {
      setFormData((current) => ({ ...current, startTime: '' }));
    }
  }, [availableTimeSlots, formData.startTime]);

  const pricing =
    validPackage && validVehicle && validLocation
      ? calculateBookingFinancials({
          packageId: validPackage,
          vehicleType: validVehicle,
          locationType: validLocation,
          selectedAddOns: formData.selectedAddOns,
        })
      : null;

  const selectedPlan =
    formData.membershipIntent !== 'none' ? maintenancePlanById[formData.membershipIntent] : null;

  const selectedWindow =
    validPackage && formData.date && formData.startTime
      ? buildBookingWindow({
          date: formData.date,
          packageId: validPackage as SlotBookingPackageId,
          startTime: formData.startTime,
          vehicleType: validVehicle || 'sedan',
          selectedAddOns: formData.selectedAddOns,
        })
      : null;

  const nextAvailableOpening =
    validPackage
      ? availability.nextAvailableOpening ||
        getNextAvailableOpening({
          fromDate: new Date(),
          packageId: validPackage as SlotBookingPackageId,
          intervals:
            Object.entries(availability.intervalsByDate).flatMap(([date, intervals]) =>
              intervals.map((interval) => ({ ...interval, date }))
            ) || [],
          vehicleType: validVehicle || 'sedan',
          selectedAddOns: formData.selectedAddOns,
        })
      : null;

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files || [])]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSystemError(null);

    const newErrors = {
      packageType: formData.packageType ? '' : 'Choose a package first.',
      vehicleType: formData.vehicleType ? '' : 'Please select a vehicle size.',
      locationType: formData.locationType ? '' : 'Please choose Garage Studio or On-Island Mobile.',
      date: formData.date ? '' : 'Please select a preferred date.',
      startTime: formData.startTime ? '' : 'Please select a valid start time.',
      fullName: validateFullName(formData.fullName),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      address: formData.address.trim() ? '' : 'Address / location is required.',
    };

    setFieldErrors(newErrors);
    const firstErrorKey = Object.keys(newErrors).find((key) => newErrors[key as keyof typeof newErrors]);
    if (firstErrorKey) {
      fieldRefs[firstErrorKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!validPackage || !validVehicle || !validLocation || !pricing || !selectedWindow) {
      setSystemError('Please finish the package, vehicle size, location, date, and start time first.');
      return;
    }

    if (Math.abs(pricing.totalToday - pricing.helcimLink.amount) > 0.01) {
      setSystemError('We could not verify the deposit amount for this booking. Please contact SignalSource directly.');
      return;
    }

    try {
      setIsSubmitting(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          packageId: validPackage,
          vehicleType: validVehicle,
          locationType: validLocation,
          membershipIntent: formData.membershipIntent,
          selectedAddOns: formData.selectedAddOns,
          // Explicitly named fields for database compatibility
          service_date: formData.date,
          start_time: formData.startTime,
          end_time: selectedWindow.endTime,
          service_duration_minutes: selectedWindow.serviceDuration,
          buffer_minutes: selectedWindow.bufferMinutes,
          blocked_until: selectedWindow.blockedUntil,
          // Pricing and metadata
          base_price: pricing.basePrice,
          addons_price: pricing.addOnsPrice,
          calculated_price: pricing.subtotal,
          deposit_amount: pricing.depositAmount,
          tax_amount: pricing.taxAmount,
          total_today: pricing.totalToday,
          remaining_balance: pricing.remainingBalance,
          total_amount_cents: Math.round(pricing.totalToday * 100),
          helcim_deposit_url: pricing.helcimLink.url,
          booking_source: 'web',
          payment_status: 'pending_payment',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create booking.');
      }

      if (!data.helcimDepositUrl) {
        throw new Error('Booking record was created, but the payment redirect URL was not returned.');
      }

      window.location.href = data.helcimDepositUrl;
    } catch (error) {
      setSystemError(
        error instanceof Error
          ? error.message
          : 'We could not route your booking right now. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell booking-page">
      <PageHero
        eyebrow="Configure Your Detail"
        title="Build the appointment in four short steps."
        subtitle="Your 20% deposit secures the appointment and goes toward the final total. If scope or vehicle condition changes significantly, we confirm the updated price before work begins."
      >
        <div className="capacity-banner inline-block mb-05">
          <CalendarCheck size={16} /> Limited vehicles per day so your car isn't rushed, Monday-Saturday.
        </div>
        {nextAvailableOpening ? (
          <p className="section-note next-opening-pill mt-2">
            Next available opening: {nextAvailableOpening.date} at {nextAvailableOpening.startTime}
          </p>
        ) : null}
      </PageHero>

      {availabilityError ? <div className="content-card reveal is-visible">{availabilityError}</div> : null}
      {systemError ? (
        <div className="error-banner system-error reveal is-visible">
          <AlertCircle size={18} className="system-error-icon" />
          {systemError}
        </div>
      ) : null}

      <div className="booking-layout">
        <form className="booking-form content-card reveal" onSubmit={handleSubmit} noValidate>
          <section className="booking-step" ref={packageRef}>
            <span className="eyebrow">1. Choose Your Package</span>
            <h2>Start with the baseline your vehicle actually needs.</h2>
            <p className="field-help">Choose the service that matches the actual scope, then pick a start time that fits the full work window and built-in buffer.</p>
            <div className="package-card-grid">
              {(['maintenance', 'deepReset'] as BookingPackageId[]).map((packageId) => (
                <button
                  key={packageId}
                  type="button"
                  className={`package-choice-card ${formData.packageType === packageId ? 'selected' : ''}`}
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      packageType: packageId,
                      startTime: '',
                    }))
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong>{bookingPackages[packageId].label}</strong>
                  </div>
                  <span className="duration-label">
                    {SERVICE_TIMING_RULES[packageId as SlotBookingPackageId].approxLabel}
                  </span>
                  <p>{bookingPackages[packageId].bestFor}</p>
                </button>
              ))}
            </div>
            <FieldError msg={fieldErrors.packageType} />
          </section>

          <section className="booking-step" ref={scheduleRef}>
            <span className="eyebrow">2. Vehicle &amp; Schedule Details</span>
            <h2>Choose the vehicle, date, and exact start time.</h2>
            <div className="capacity-inline-note">
              <CalendarCheck size={15} />
              We schedule between 08:00 and 20:00 with a 1-hour buffer after every job.
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="vehicle-type">Vehicle size</label>
                <select
                  id="vehicle-type"
                  value={formData.vehicleType}
                  onChange={(event) => setFormData({ ...formData, vehicleType: event.target.value })}
                  className={fieldErrors.vehicleType ? 'input-error' : ''}
                >
                  <option value="">Select vehicle size</option>
                  <option value="sedan">Sedan</option>
                  <option value="smallSuv">Small SUV</option>
                  <option value="largeSuvTruck">Large SUV/Truck</option>
                </select>
                <FieldError msg={fieldErrors.vehicleType} />
              </div>

              <div className="input-group">
                <label htmlFor="location-type">Location</label>
                <select
                  id="location-type"
                  value={formData.locationType}
                  onChange={(event) => setFormData({ ...formData, locationType: event.target.value })}
                  className={fieldErrors.locationType ? 'input-error' : ''}
                >
                  <option value="">Select location</option>
                  <option value="garage">Garage Studio</option>
                  <option value="mobile">On-Island Mobile</option>
                </select>
                <FieldError msg={fieldErrors.locationType} />
              </div>

              <div className="input-group full-width">
                <label>Add-ons (optional)</label>
                <p className="field-help">Select any add-ons you'd like. These will add time to your booking and affect pricing.</p>
                <div className="addon-selector-list">
                  {ADD_ON_OPTIONS.map((addon) => {
                    const isSelected = formData.selectedAddOns.includes(addon.id);
                    const addOnDuration = validVehicle ? ADD_ON_DURATIONS[addon.id][validVehicle] : 0;
                    const durationHours = (addOnDuration / 60).toFixed(1);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        className={`addon-selector-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newAddOns = isSelected
                            ? formData.selectedAddOns.filter((id) => id !== addon.id)
                            : [...formData.selectedAddOns, addon.id];
                          setFormData({ ...formData, selectedAddOns: newAddOns });
                        }}
                        disabled={!validVehicle}
                      >
                        <div className="addon-selector-left">
                          <div className={`addon-check ${isSelected ? 'selected' : ''}`}>
                            {isSelected && <Check size={12} />}
                          </div>
                          <div className="addon-copy">
                            <div className="addon-selector-title">
                              <span>{addon.label}</span>
                              {validVehicle && (
                                <span className="addon-duration">+{durationHours}h</span>
                              )}
                            </div>
                            <p className="field-help">{addon.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="input-group full-width">
                <label>Preferred day</label>
                <div className="booking-calendar-panel">
                  <BookingCalendar
                    selectedDate={formData.date}
                    onChange={(date) => setFormData({ ...formData, date, startTime: '' })}
                    unavailableDates={availability.unavailableDates}
                    slotPackageId={validPackage ?? undefined}
                    slotVehicleType={validVehicle ?? 'sedan'}
                    slotSelectedAddOns={formData.selectedAddOns}
                    intervalsByDate={calendarIntervalsByDate}
                    showNoSlots={showNoSlots}
                  />
                </div>
                <FieldError msg={fieldErrors.date} />
              </div>

              <div className="input-group full-width">
                <p className="booking-field-label">Start time</p>
                <p className="field-help">Only start times that fit the full service window and 1-hour buffer remain selectable.</p>
                <div className="slot-grid">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      className={`slot-choice ${formData.startTime === slot.value ? 'selected' : ''}`}
                      disabled={slot.disabled}
                      onClick={() => setFormData({ ...formData, startTime: slot.value })}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                <FieldError msg={fieldErrors.startTime} />
              </div>
            </div>
          </section>

          <section className="booking-step" ref={detailsRef}>
            <span className="eyebrow">3. Contact &amp; Location Details</span>
            <h2>Tell us who you are and where service happens.</h2>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                  className={fieldErrors.fullName ? 'input-error' : ''}
                />
                <FieldError msg={fieldErrors.fullName} />
              </div>
              <div className="input-group">
                <label htmlFor="phone-number">Phone number</label>
                <input
                  id="phone-number"
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className={fieldErrors.phone ? 'input-error' : ''}
                />
                <FieldError msg={fieldErrors.phone} />
              </div>
              <div className="input-group">
                <label htmlFor="email-address">Email address</label>
                <input
                  id="email-address"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className={fieldErrors.email ? 'input-error' : ''}
                />
                <FieldError msg={fieldErrors.email} />
              </div>
              <div className="input-group full-width">
                <label htmlFor="service-location">Address / service location</label>
                <p className="field-help">Garage Studio bookings can still leave service notes here. Mobile bookings should enter the actual Whidbey address.</p>
                <AddressAutocomplete
                  inputId="service-location"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  hasError={!!fieldErrors.address}
                />
                <FieldError msg={fieldErrors.address} />
              </div>
            </div>
          </section>

          <section className="booking-step" ref={confirmationRef}>
            <span className="eyebrow">4. Notes &amp; Confirmation</span>
            <h2>Anything we should know before service day?</h2>
            <p className="field-help">Pet hair, stains, child seats, access notes, and special requests should go here.</p>
            <p className="field-help add-ons-notice">
              Interested in add-ons like paint correction, light engine bay cleaning, severe pet hair removal, or headlight restoration? For now, please text or call before booking so we can confirm scope, time, and updated pricing. You can also mention what you're considering in the notes below and attach photos.
            </p>
            <div className="form-grid">
              <div className="input-group full-width">
                <label htmlFor="booking-notes">Notes</label>
                <textarea
                  id="booking-notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  placeholder="Pet hair, stains, access notes, or anything else we should know."
                />
              </div>

              <div className="input-group full-width">
                <p className="booking-field-label">Plan interest (optional)</p>
                <p className="field-help">
                  Maintenance plans start after your baseline visit.{' '}
                  <Link to="/memberships" className="inline-text-link">
                    See Maintenance Plans
                  </Link>{' '}
                  for details.
                </p>
                <div className="plan-choice-list compact">
                  <button
                    type="button"
                    className={`plan-choice ${formData.membershipIntent === 'none' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, membershipIntent: 'none' })}
                  >
                    <strong>No plan right now</strong>
                  </button>
                  {maintenancePlans.map((plan) => (
                    <button
                      type="button"
                      key={plan.id}
                      className={`plan-choice ${formData.membershipIntent === plan.id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, membershipIntent: plan.id })}
                    >
                      <strong>{plan.bookingChoiceLabel}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group full-width file-upload">
                <label htmlFor="photo-upload">Upload photos (optional)</label>
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <label htmlFor="photo-upload" className="upload-dropzone">
                  <UploadCloud size={28} className="icon-lime" />
                  <p>Click to browse or drag and drop photos of the vehicle.</p>
                </label>
                {selectedFiles.length > 0 ? (
                  <div className="file-preview-grid mt-1">
                    {selectedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="file-preview-item">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)} aria-label="Remove file">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="notice-list">
              <div className="policy-text">
                Remove valuables, cash, documents, and heavy loose items before your appointment so we can work efficiently and avoid missing anything.
              </div>
              <div className="policy-text">
                If scope or vehicle condition changes significantly close to the appointment, time and final price may change. We&apos;ll confirm any changes before work starts.
              </div>
            </div>
          </section>

          <div className="form-footer">
            <button type="submit" className="btn primary btn-submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Routing to Helcim...'
                : `Pay 20% Deposit + Tax${pricing ? ` (${formatCurrency(pricing.totalToday)})` : ''} & Book`}
            </button>
            <div className="payment-secure-text">
              <ShieldCheck size={14} /> Your deposit (plus applicable tax) goes toward the final total.
            </div>
          </div>
        </form>

        <aside className="booking-sidebar reveal" data-reveal-delay="1">
          <div className="summary-card">
            <div className="summary-header-desktop">
              <span className="eyebrow">Your Detail Summary</span>
            </div>
            <button
              type="button"
              className="summary-toggle-mobile"
              onClick={() => setIsMobileSummaryOpen((current) => !current)}
            >
              <span className="eyebrow">Your Detail Summary</span>
              {isMobileSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <div className={`summary-content ${isMobileSummaryOpen ? 'open' : ''}`}>
              <div className="summary-row">
                <span>Package + vehicle type</span>
                <strong>
                  {validPackage && validVehicle
                    ? `${bookingPackages[validPackage].label} · ${vehicleTypeLabels[validVehicle]}`
                    : 'Choose a package and vehicle size'}
                </strong>
              </div>

              {selectedWindow ? (
                <div className="summary-row">
                  <span>Service window</span>
                  <strong>{`${selectedWindow.startTime} to ${selectedWindow.endTime}`}</strong>
                </div>
              ) : null}

              {selectedPlan ? (
                <div className="summary-block">
                  <span>Maintenance Plan</span>
                  <p className="section-note">
                    {selectedPlan.shortName} ({selectedPlan.summaryLine})
                  </p>
                </div>
              ) : null}

              {pricing && validPackage && validVehicle ? (
                <>
                  <div className="summary-row">
                    <span>{`${bookingPackages[validPackage].label} · ${vehicleTypeLabels[validVehicle]}`}</span>
                    <strong>{formatCurrency(pricing.packagePrice)}</strong>
                  </div>
                  {pricing.mobileFee > 0 ? (
                    <div className="summary-row">
                      <span>On-Island Mobile Fee</span>
                      <strong>{formatCurrency(pricing.mobileFee)}</strong>
                    </div>
                  ) : null}
                  <div className="summary-row">
                    <span>Subtotal (base)</span>
                    <strong>{formatCurrency(pricing.subtotal)}</strong>
                  </div>
                  {pricing.addOnsPrice > 0 ? (
                    <div className="summary-row">
                      <span>Add-ons selected</span>
                      <strong>{formatCurrency(pricing.addOnsPrice)}</strong>
                    </div>
                  ) : null}
                  <div className="summary-row">
                    <span>Tax</span>
                    <strong>{formatCurrency(pricing.taxAmount)}</strong>
                  </div>
                  <div className="summary-row highlight">
                    <span>Today&apos;s deposit (20%)</span>
                    <strong>{formatCurrency(pricing.depositAmount)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Today&apos;s total due</span>
                    <strong>{formatCurrency(pricing.totalToday)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Remaining after service</span>
                    <strong>{formatCurrency(pricing.remainingBalance)}</strong>
                  </div>
                </>
              ) : (
                <p className="section-note summary-empty-note">
                  Select a package, vehicle size, and location to see today&apos;s pricing.
                </p>
              )}

              <p className="section-note">
                Final total is confirmed before work begins if vehicle condition or selected scope changes.
              </p>
            </div>
          </div>

          <div className="sidebar-card">
            <span className="eyebrow">How booking works</span>
            <ol className="sidebar-steps">
              <li>Choose the exact package, date, and start time that fit the full service window.</li>
              <li>We hold hourly availability from 08:00 to 20:00 with a 1-hour buffer after every job.</li>
              <li>Pay the 20% deposit plus tax on Helcim to reserve the appointment.</li>
            </ol>
          </div>

          {nextAvailableOpening ? (
            <div className="sidebar-card next-opening-card">
              <span className="eyebrow">Next Open Slot</span>
              <h3>{nextAvailableOpening.date}</h3>
              <p className="section-copy">
                {nextAvailableOpening.label} for {nextAvailableOpening.serviceLabel}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
