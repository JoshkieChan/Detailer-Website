import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent, RefObject } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  CalendarCheck,
  X,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { fetchBookedDates } from '../api/availability';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


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

  const fetchSuggestions = useCallback(async (query: string) => {
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
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
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
      {open && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id} onMouseDown={() => handlePick(suggestion.display_name)}>
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    vehicleType: '',
    address: '',
    packageType: '',
    locationType: '',
    date: '',
    time: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    vehicleType: '',
    packageType: packageIdParam,
    locationType: '',
    date: '',
    time: '',
    notes: '',
    membershipIntent: 'none' as MembershipIntent,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const vehicleTypeRef = useRef<HTMLDivElement>(null);
  const packageRef = useRef<HTMLDivElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  const fieldRefs: Record<string, RefObject<HTMLDivElement | null>> = {
    fullName: fullNameRef,
    phone: phoneRef,
    email: emailRef,
    address: addressRef,
    vehicleType: vehicleTypeRef,
    packageType: packageRef,
    locationType: locationTypeRef,
    date: dateRef,
    time: timeRef,
  };

  useEffect(() => {
    fetchBookedDates()
      .then(setBookedDates)
      .catch((err) => {
        console.error('Initialization fetch failed:', err);
      });
  }, []);

  const selectedPlan =
    formData.membershipIntent !== 'none' ? maintenancePlanById[formData.membershipIntent] : null;

  const validPackage = isBookingPackageId(formData.packageType) ? formData.packageType : null;
  const validVehicle = isVehicleTypeId(formData.vehicleType) ? formData.vehicleType : null;
  const validLocation = isLocationType(formData.locationType) ? formData.locationType : null;

  const pricing =
    validPackage && validVehicle && validLocation
      ? calculateBookingFinancials({
          packageId: validPackage,
          vehicleType: validVehicle,
          locationType: validLocation,
        })
      : null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSystemError(null);

    const newErrors = {
      fullName: validateFullName(formData.fullName),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      address: formData.address.trim() ? '' : 'Address / location is required.',
      vehicleType: formData.vehicleType ? '' : 'Please select your vehicle type (Sedan, Small SUV, or Large SUV / Truck).',
      packageType: formData.packageType ? '' : 'Choose a package first, then pay your 20% deposit.',
      locationType: formData.locationType ? '' : 'Please choose Garage Studio or On-Island Mobile.',
      date: formData.date ? '' : 'Please select a preferred date.',
      time: formData.time ? '' : 'Please select a preferred time range.',
    };

    setFieldErrors(newErrors);

    const firstErrKey = Object.keys(newErrors).find((key) => newErrors[key as keyof typeof newErrors]);
    if (firstErrKey) {
      fieldRefs[firstErrKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!validPackage || !validVehicle || !validLocation || !pricing) {
        throw new Error('Please finish the package, vehicle type, and location selections before booking.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

      if (!supabaseUrl) {
        throw new Error('ACTION REQUIRED: VITE_SUPABASE_URL is missing in production. Ensure it is set in Vercel project settings.');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/create-booking`;
      console.log('Initiating booking fetch to:', functionUrl);
      console.log('Payload Data:', {
        ...formData,
        package: validPackage,
        vehicleType: validVehicle,
        locationType: validLocation,
      });
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          package: validPackage,
          packageId: validPackage,
          packageName: bookingPackages[validPackage].label,
          vehicleType: validVehicle,
          vehicleTypeLabel: vehicleTypeLabels[validVehicle],
          locationType: validLocation,
          mobileFeeApplied: validLocation === 'mobile',
          membershipIntent: formData.membershipIntent,
          calculatedPrice: pricing.subtotal,
          estimatedTotal: pricing.subtotal,
          depositAmount: pricing.depositAmount,
          taxAmount: pricing.taxAmount,
          totalToday: pricing.totalToday,
          remainingBalance: pricing.remainingBalance,
          date: formData.date,
          time: formData.time,
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create booking.');
      }

      if (data.helcimDepositUrl) {
        console.log('Booking successful! Redirecting to Helcim:', data.helcimDepositUrl);
        window.location.href = data.helcimDepositUrl;
        return; // Ensure no further code executes
      } else {
        console.error('Missing expected response data:', data);
        throw new Error('Booking record was created, but the payment redirect URL was not returned.');
      }
    } catch (err: any) {
      console.error('CRITICAL SUBMISSION ERROR:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/create-booking`;
      
      setSystemError(`Technical issue while connecting to ${functionUrl}: ${errorMessage}. If you see this, please check your network connection or verify that VITE_SUPABASE_URL is set in Vercel.`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell booking-page">
      <section className="page-hero text-center reveal compact-hero">
        <div className="capacity-banner inline-block">
          <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
        </div>
        <span className="eyebrow">Configure Your Detail</span>
        <h1 className="hero-title">Build the appointment in four short steps.</h1>
        <p className="hero-subtitle">
          Your 20% deposit secures the appointment and goes toward the final total. If scope
          or vehicle condition changes significantly, we confirm the updated price before work begins.
        </p>
      </section>

      {systemError && (
        <div className="error-banner system-error reveal is-visible">
          <AlertCircle size={18} className="system-error-icon" />
          {systemError}
        </div>
      )}

      <div className="booking-layout">
        <form className="booking-form content-card reveal" onSubmit={handleSubmit} noValidate>
          <section className="booking-step" ref={packageRef}>
            <span className="eyebrow">1. Choose Your Package</span>
            <h2>Start with the baseline your vehicle actually needs.</h2>
            <p className="field-help">Pick the closest fit now. Extras are quoted from your notes and photos before the appointment.</p>
            <div className="location-toggle booking-package-toggle">
              <button
                type="button"
                className={`toggle-btn ${formData.packageType === 'maintenance' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, packageType: 'maintenance' })}
                aria-pressed={formData.packageType === 'maintenance'}
              >
                {bookingPackages.maintenance.label}
              </button>
              <button
                type="button"
                className={`toggle-btn ${formData.packageType === 'deepReset' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, packageType: 'deepReset' })}
                aria-pressed={formData.packageType === 'deepReset'}
              >
                {bookingPackages.deepReset.label}
              </button>
            </div>
            <FieldError msg={fieldErrors.packageType} />
          </section>


          <section className="booking-step">
            <span className="eyebrow">2. Vehicle &amp; Schedule Details</span>
            <h2>Tell us what we are working on and when.</h2>
            <div className="capacity-inline-note">
              <CalendarCheck size={15} />
              One vehicle per day means your selected date is held once the deposit is paid.
            </div>
            <div className="form-grid">
              <div className="input-group full-width" ref={vehicleTypeRef}>
                <label htmlFor="vehicle-type">Vehicle type</label>
                <select
                  id="vehicle-type"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className={fieldErrors.vehicleType ? 'input-error' : ''}
                >
                  <option value="">Select vehicle type</option>
                  <option value="sedan">Sedan</option>
                  <option value="smallSuv">Small SUV</option>
                  <option value="largeSuvTruck">Large SUV / Truck</option>
                </select>
                <FieldError msg={fieldErrors.vehicleType} />
              </div>

              <div className="input-group full-width" ref={addressRef}>
                <label htmlFor="service-location">Address / service location</label>
                <p className="field-help">Needed for mobile bookings or service access notes.</p>
                <AddressAutocomplete
                  inputId="service-location"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  hasError={!!fieldErrors.address}
                />
                <FieldError msg={fieldErrors.address} />
              </div>

              <div className="input-group full-width" ref={locationTypeRef}>
                <p className="booking-field-label">Garage Studio or On-Island Mobile</p>
                <p className="field-help">Studio is best for heavier work. Mobile is an optional convenience upgrade on Whidbey.</p>
                <div className="location-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.locationType === 'garage' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'garage' })}
                    aria-pressed={formData.locationType === 'garage'}
                  >
                    Garage Studio
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.locationType === 'mobile' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'mobile' })}
                    aria-pressed={formData.locationType === 'mobile'}
                  >
                    On-Island Mobile
                  </button>
                </div>
                <FieldError msg={fieldErrors.locationType} />
              </div>

              <div className="input-group full-width" ref={dateRef}>
                <p className="booking-field-label">Preferred day</p>
                <BookingCalendar selectedDate={formData.date} onChange={(date) => setFormData({ ...formData, date })} bookedDates={bookedDates} />
                <FieldError msg={fieldErrors.date} />
              </div>

              <div className="input-group" ref={timeRef}>
                <label htmlFor="preferred-time-range">Preferred time range</label>
                <select
                  id="preferred-time-range"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={fieldErrors.time ? 'input-error' : ''}
                >
                  <option value="">Choose a time range</option>
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 4pm)</option>
                </select>
                <FieldError msg={fieldErrors.time} />
              </div>
            </div>
          </section>

          <section className="booking-step">
            <span className="eyebrow">4. Notes &amp; Confirmation</span>
            <h2>Anything we should know before service day?</h2>
            <p className="field-help">Pet hair, stains, child seats, access notes, or anything that could affect time and scope.</p>

            <div className="form-grid">
              <div className="input-group full-width" ref={fullNameRef}>
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={fieldErrors.fullName ? 'input-error' : ''}
                  placeholder="John Doe"
                />
                <FieldError msg={fieldErrors.fullName} />
              </div>

              <div className="input-group" ref={phoneRef}>
                <label htmlFor="phone-number">Phone number</label>
                <input
                  id="phone-number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={fieldErrors.phone ? 'input-error' : ''}
                  placeholder="(555) 555-5555"
                />
                <FieldError msg={fieldErrors.phone} />
              </div>

              <div className="input-group" ref={emailRef}>
                <label htmlFor="email-address">Email address</label>
                <input
                  id="email-address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={fieldErrors.email ? 'input-error' : ''}
                  placeholder="name@example.com"
                />
                <FieldError msg={fieldErrors.email} />
              </div>

              <div className="input-group full-width">
                <label htmlFor="booking-notes">Notes</label>
                <p className="field-help mb-05">
                  If you want extras (engine bay, heavy pet hair, headlight work, etc.), include it in your booking notes or DM us with your booking number. We&apos;ll confirm any additional cost before your appointment.
                </p>
                <textarea
                  id="booking-notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Pet hair, stains, odors, child seats, access notes, or anything else that could affect time and scope."
                />
              </div>

              <div className="input-group full-width">
                <p className="booking-field-label">Plan interest (optional)</p>
                <p className="field-help">
                  Maintenance plans start after your baseline Deep Reset or first maintenance visit.{' '}
                  <Link to="/memberships" className="inline-text-link">
                    See Maintenance Plans
                  </Link>{' '}
                  for full details.
                </p>
                <div className="plan-choice-list compact">
                  <button
                    type="button"
                    className={`plan-choice ${formData.membershipIntent === 'none' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, membershipIntent: 'none' })}
                    aria-pressed={formData.membershipIntent === 'none'}
                  >
                    <strong>No plan right now</strong>
                  </button>
                  {maintenancePlans.map((plan) => (
                    <button
                      type="button"
                      className={`plan-choice ${formData.membershipIntent === plan.id ? 'selected' : ''}`}
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, membershipIntent: plan.id })}
                      aria-pressed={formData.membershipIntent === plan.id}
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
                  ref={fileInputRef}
                />
                <label htmlFor="photo-upload" className="upload-dropzone">
                  <UploadCloud size={28} className="icon-lime" />
                  <p>Click to browse or drag and drop photos of the vehicle.</p>
                </label>
                {selectedFiles.length > 0 && (
                  <div className="file-preview-grid mt-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="file-preview-item">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => removeFile(idx)} aria-label="Remove file">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              {isSubmitting ? 'Processing...' : `Pay 20% Deposit + Tax${pricing ? ` (${formatCurrency(pricing.totalToday)})` : ''} & Book`}
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
                    : 'Choose a package and vehicle type'}
                </strong>
              </div>

              {selectedPlan && (
                <div className="summary-block">
                  <span>Maintenance Plan</span>
                  <p className="section-note">
                    {selectedPlan.shortName} ({selectedPlan.summaryLine})
                  </p>
                </div>
              )}

              {pricing === null || !validPackage || !validVehicle || !validLocation ? (
                <p className="section-note summary-empty-note">
                  Select a package, vehicle type, and location to see today&apos;s pricing.
                </p>
              ) : (
                <>
                  <div className="summary-row">
                    <span>{`${bookingPackages[validPackage].label} · ${vehicleTypeLabels[validVehicle]}`}</span>
                    <strong>{formatCurrency(pricing.packagePrice)}</strong>
                  </div>

                  {pricing.mobileFee > 0 && (
                    <div className="summary-row">
                      <span>On-Island Mobile Fee</span>
                      <strong>{formatCurrency(pricing.mobileFee)}</strong>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(pricing.subtotal)}</strong>
                  </div>

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
              )}

              <p className="section-note">
                Final total is confirmed before work begins if vehicle condition or selected scope changes.
              </p>
            </div>
          </div>

          <div className="sidebar-card">
            <span className="eyebrow">How booking works</span>
            <ol className="sidebar-steps">
              <li>Choose the package, add notes about any extras, and upload photos.</li>
              <li>Pick the service mode, date, and time range that fit your week.</li>
              <li>Pay the 20% deposit (plus applicable tax) to lock the appointment in. Your deposit is applied toward the final total.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
