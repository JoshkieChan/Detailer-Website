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
import { servicePackages } from '../data/packages';
import { maintenancePlans } from '../data/maintenancePlans';


const packageBestFor: Record<string, string> = {
  maintenance: 'Best for weekly drivers and routine upkeep.',
  'deep-reset': 'Best for neglected vehicles and full reset work.',
};

const planChoiceLabels: Record<string, string> = {
  quarterly: 'Interested in Quarterly Plan',
  monthly: 'Interested in Monthly Plan',
};


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

function validateVehicle(v: string) {
  if (v.trim().length < 3) return "Please enter your vehicle's make and model.";
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
  const packageIdParam = (rawPackage === 'maintenance' || rawPackage === 'deep-reset') ? rawPackage : '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    vehicleMake: '',
    address: '',
    package: '',
    locationType: '',
    date: '',
    time: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    vehicleMake: '',
    vehicleYear: '',
    vehicleColor: '',
    package: packageIdParam,
    locationType: '',
    date: '',
    time: '',
    notes: '',
    maintenancePlanId: 'none',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const vehicleMakeRef = useRef<HTMLDivElement>(null);
  const packageRef = useRef<HTMLDivElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  const fieldRefs: Record<string, RefObject<HTMLDivElement | null>> = {
    fullName: fullNameRef,
    phone: phoneRef,
    email: emailRef,
    address: addressRef,
    vehicleMake: vehicleMakeRef,
    package: packageRef,
    locationType: locationTypeRef,
    date: dateRef,
    time: timeRef,
  };

  useEffect(() => {
    fetchBookedDates().then(setBookedDates);
  }, []);


  const selectedPackage = servicePackages.find((pkg) => pkg.id === formData.package);
  const selectedPlan = maintenancePlans.find((plan) => plan.id === formData.maintenancePlanId);

  const BASE_PRICES: Record<string, number> = {
    maintenance: 225,
    'deep-reset': 400,
  };

  const basePrice = selectedPackage?.id ? BASE_PRICES[selectedPackage.id] || 0 : 0;
  const estimatedTotal = basePrice;
  const depositAmount = Math.round(estimatedTotal * 0.2);
  const remainingBalance = estimatedTotal - depositAmount;

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
      vehicleMake: validateVehicle(formData.vehicleMake),
      package: formData.package ? '' : 'Choose a package first, then pay your 20% deposit.',
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
      // Step 5: Process Booking Submission (Now Processor-Agnostic)
      // The Edge Function will handle DB inserts, Google Calendar, and reCAPTCHA.
      // TODO: Once Helcim is ready, inject the redirect or modal call here.
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing.');
      }

      // We call the generic 'create-booking' function (previously stripe-checkout)
      const functionUrl = `${supabaseUrl}/functions/v1/create-booking`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          ...formData,
          estimatedTotal,
          packageName: selectedPackage?.title
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create booking.');
      }

      if (data.bookingId) {
        // Stripe removal: Redirect directly to confirmation with the internal booking ID.
        window.location.href = `/booking/confirmation?booking_id=${data.bookingId}`;
      } else {
        throw new Error('Booking ID was not returned from the server.');
      }
    } catch (err: unknown) {
      console.error('Booking submit error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Possible payment processing error';
      setSystemError(`Technical issue: ${errorMessage}. Please try again or contact us directly.`);
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
            <div className="booking-package-grid">
              {servicePackages.map((pkg) => (
                <button
                  type="button"
                  key={pkg.id}
                  className={`booking-package-card ${formData.package === pkg.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, package: pkg.id })}
                  aria-pressed={formData.package === pkg.id}
                >
                  <div className="booking-package-head">
                    <h3>{pkg.title}</h3>
                    {formData.package === pkg.id && <span className="selected-chip">Selected</span>}
                  </div>
                  <p className="section-copy">{packageBestFor[pkg.id]}</p>
                  <div className="package-card-price">From {`$${pkg.price}`}</div>
                  <p className="package-card-note">{pkg.priceNote}</p>
                </button>
              ))}
            </div>
            <FieldError msg={fieldErrors.package} />
          </section>


          <section className="booking-step">
            <span className="eyebrow">2. Vehicle &amp; Schedule Details</span>
            <h2>Tell us what we are working on and when.</h2>
            <div className="capacity-inline-note">
              <CalendarCheck size={15} />
              One vehicle per day means your selected date is held once the deposit is paid.
            </div>
            <div className="form-grid">
              <div className="input-group full-width" ref={vehicleMakeRef}>
                <label htmlFor="vehicle-make-model">Vehicle make and model</label>
                <input
                  id="vehicle-make-model"
                  type="text"
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  className={fieldErrors.vehicleMake ? 'input-error' : ''}
                  placeholder="Toyota RAV4 / Ford F-150 / Tesla Model 3"
                />
                <FieldError msg={fieldErrors.vehicleMake} />
              </div>

              <div className="input-group">
                <label htmlFor="vehicle-year">Vehicle year</label>
                <select
                  id="vehicle-year"
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="vehicle-color">Vehicle color</label>
                <input
                  id="vehicle-color"
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  placeholder="White / Gray / Black"
                />
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
                  Maintenance plans are for after a Deep Reset.{' '}
                  <Link to="/memberships" className="inline-text-link">
                    See Maintenance Plans
                  </Link>{' '}
                  for full details.
                </p>
                <div className="plan-choice-list compact">
                  <button
                    type="button"
                    className={`plan-choice ${formData.maintenancePlanId === 'none' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, maintenancePlanId: 'none' })}
                    aria-pressed={formData.maintenancePlanId === 'none'}
                  >
                    <strong>No plan right now</strong>
                  </button>
                  {maintenancePlans.map((plan) => (
                    <button
                      type="button"
                      className={`plan-choice ${formData.maintenancePlanId === plan.id ? 'selected' : ''}`}
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, maintenancePlanId: plan.id })}
                      aria-pressed={formData.maintenancePlanId === plan.id}
                    >
                      <strong>{planChoiceLabels[plan.id]}</strong>
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
              {isSubmitting ? 'Processing...' : 'Pay 20% Deposit & Book'}
            </button>
            <div className="payment-secure-text">
              <ShieldCheck size={14} /> Your deposit goes toward the final total and is not an extra fee.
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
                <span>Package</span>
                <strong>{selectedPackage ? selectedPackage.title : 'Choose a package'}</strong>
              </div>


              {selectedPlan && (
                <div className="summary-block">
                  <span>Plan interest</span>
                  <p className="section-note">{planChoiceLabels[selectedPlan.id]}</p>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated total</span>
                <strong>{formatCurrency(estimatedTotal)}</strong>
              </div>

              <div className="summary-row highlight">
                <span>Today&apos;s deposit (20%)</span>
                <strong>{formatCurrency(depositAmount)}</strong>
              </div>

              <div className="summary-row">
                <span>Remaining after service</span>
                <strong>{formatCurrency(remainingBalance)}</strong>
              </div>

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
              <li>Pay the 20% deposit to lock the appointment in.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
