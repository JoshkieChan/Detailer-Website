import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent, RefObject } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  CalendarCheck,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { fetchBookedDates } from '../api/availability';
import { createDepositCheckout } from '../api/stripe';
import { servicePackages } from '../data/packages';
import { maintenancePlans } from '../data/maintenancePlans';
import { detailAddOns } from '../data/addOns';

const recaptchaEnv = import.meta.env as ImportMetaEnv & Record<string, string | undefined>;
const recaptchaSiteKey = (recaptchaEnv.VITE_RECAPTCHA_SITE_KEY ?? recaptchaEnv.RECAPTCHA_SITE_KEY)?.trim();
const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3';

const packageBestFor: Record<string, string> = {
  maintenance: 'Best for weekly drivers and routine upkeep.',
  'deep-reset': 'Best for neglected vehicles and full reset work.',
  'new-car': 'Best for newer vehicles or recently detailed cars needing gloss and protection.',
};

const planChoiceLabels: Record<string, string> = {
  quarterly: 'Interested in Quarterly Plan',
  monthly: 'Interested in Monthly Plan',
};

const loadRecaptchaScript = async (siteKey: string) => {
  if (window.grecaptcha) return;

  const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      if (window.grecaptcha) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script.')), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script.'));
    document.head.appendChild(script);
  });
};

const getRecaptchaToken = async () => {
  if (!recaptchaSiteKey) {
    throw new Error('reCAPTCHA site key is missing in this environment.');
  }

  await loadRecaptchaScript(recaptchaSiteKey);

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA failed to initialize.');
  }

  return await new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(recaptchaSiteKey, { action: 'booking' })
        .then(resolve)
        .catch(() => reject(new Error('Failed to verify reCAPTCHA. Please try again.')));
    });
  });
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
  value,
  onChange,
  hasError,
}: {
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
    <div style={{ position: 'relative' }}>
      <input
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
      <AlertCircle size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
      {msg}
    </span>
  ) : null;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const packageIdParam = searchParams.get('package') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
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

  useEffect(() => {
    setSelectedAddOnIds((current) => {
      const hasMobileAddOn = current.includes('mobile-convenience');
      if (formData.locationType === 'mobile' && !hasMobileAddOn) {
        return [...current, 'mobile-convenience'];
      }
      if (formData.locationType !== 'mobile' && hasMobileAddOn) {
        return current.filter((id) => id !== 'mobile-convenience');
      }
      return current;
    });
  }, [formData.locationType]);

  const selectedPackage = servicePackages.find((pkg) => pkg.id === formData.package);
  const selectedAddOns = detailAddOns.filter((addOn) => selectedAddOnIds.includes(addOn.id));
  const selectedPlan = maintenancePlans.find((plan) => plan.id === formData.maintenancePlanId);
  const estimatedTotal = (selectedPackage ? Number(selectedPackage.price) : 0) + selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const depositAmount = Number((estimatedTotal * 0.2).toFixed(2));
  const remainingBalance = Number((estimatedTotal - depositAmount).toFixed(2));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAddOn = (addOnId: string) => {
    if (addOnId === 'mobile-convenience' && formData.locationType === 'mobile') return;
    setSelectedAddOnIds((current) =>
      current.includes(addOnId) ? current.filter((id) => id !== addOnId) : [...current, addOnId]
    );
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
      package: formData.package ? '' : 'Please choose a package.',
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
      const recaptchaToken = await getRecaptchaToken();

      const session = await createDepositCheckout({
        packageId: formData.package,
        packageName: selectedPackage?.title || 'Vehicle Detail',
        packagePrice: estimatedTotal,
        estimatedTotal,
        selectedAddOns: selectedAddOns.map((addOn) => addOn.name),
        maintenancePlanId: formData.maintenancePlanId !== 'none' ? formData.maintenancePlanId : undefined,
        notes: formData.notes,
        vehicleColor: formData.vehicleColor,
        recaptchaToken,
        customerEmail: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        vehicleInfo: `${formData.vehicleYear} ${formData.vehicleMake}`.trim(),
        locationType: formData.locationType,
        serviceDate: formData.date,
        serviceTime: formData.time,
      });

      if (session.sessionUrl) {
        window.location.href = session.sessionUrl;
      } else {
        throw new Error('Failed to generate checkout URL.');
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
          <AlertCircle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
          {systemError}
        </div>
      )}

      <div className="booking-layout">
        <form className="booking-form content-card reveal" onSubmit={handleSubmit} noValidate>
          <section className="booking-step" ref={packageRef}>
            <span className="eyebrow">1. Choose Your Package</span>
            <h2>Start with the baseline your vehicle actually needs.</h2>
            <p className="field-help">Pick the closest fit now. You can add optional upgrades in the next step.</p>
            <div className="booking-package-grid">
              {servicePackages.map((pkg) => (
                <button
                  type="button"
                  key={pkg.id}
                  className={`booking-package-card ${formData.package === pkg.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, package: pkg.id })}
                >
                  <div className="booking-package-head">
                    <h3>{pkg.title}</h3>
                    {formData.package === pkg.id && <span className="selected-chip">Selected</span>}
                  </div>
                  <p className="section-copy">{packageBestFor[pkg.id]}</p>
                  <div className="package-card-price">From ${pkg.price}</div>
                  <p className="package-card-note">{pkg.priceNote}</p>
                </button>
              ))}
            </div>
            <FieldError msg={fieldErrors.package} />
          </section>

          <section className="booking-step">
            <span className="eyebrow">2. Add Optional Upgrades</span>
            <h2>Add only what fits your vehicle.</h2>
            <p className="field-help">These are optional upgrades, not required extras.</p>
            <div className="addon-selector-list">
              {detailAddOns.map((addOn) => {
                const selected = selectedAddOnIds.includes(addOn.id);
                const lockedByLocation = addOn.id === 'mobile-convenience' && formData.locationType === 'mobile';

                return (
                  <button
                    type="button"
                    key={addOn.id}
                    className={`addon-selector-row ${selected ? 'selected' : ''}`}
                    onClick={() => toggleAddOn(addOn.id)}
                    disabled={lockedByLocation}
                  >
                    <div className="addon-selector-left">
                      <span className={`addon-check ${selected ? 'selected' : ''}`} aria-hidden="true">
                        {selected ? <CheckCircle2 size={15} className="icon-lime" /> : null}
                      </span>
                      <div className="addon-copy">
                        <div className="addon-selector-title">
                          <span>{addOn.name}</span>
                        </div>
                        <p className="field-help">
                          {addOn.id === 'mobile-convenience'
                            ? 'Optional convenience upgrade for mobile service, not part of the base price.'
                            : addOn.description}
                        </p>
                      </div>
                    </div>
                    <span className="addon-selector-price">+${addOn.price}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="booking-step">
            <span className="eyebrow">3. Vehicle &amp; Schedule Details</span>
            <h2>Tell us what we are working on and when.</h2>
            <div className="capacity-inline-note">
              <CalendarCheck size={15} />
              One vehicle per day means your selected date is held once the deposit is paid.
            </div>
            <div className="form-grid">
              <div className="input-group full-width" ref={vehicleMakeRef}>
                <label>Vehicle make and model</label>
                <input
                  type="text"
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  className={fieldErrors.vehicleMake ? 'input-error' : ''}
                  placeholder="Toyota RAV4 / Ford F-150 / Tesla Model 3"
                />
                <FieldError msg={fieldErrors.vehicleMake} />
              </div>

              <div className="input-group">
                <label>Vehicle year</label>
                <select value={formData.vehicleYear} onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}>
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Vehicle color</label>
                <input
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  placeholder="White / Gray / Black"
                />
              </div>

              <div className="input-group full-width" ref={addressRef}>
                <label>Address / service location</label>
                <p className="field-help">Needed for mobile bookings or service access notes.</p>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  hasError={!!fieldErrors.address}
                />
                <FieldError msg={fieldErrors.address} />
              </div>

              <div className="input-group full-width" ref={locationTypeRef}>
                <label>Garage Studio or On-Island Mobile</label>
                <p className="field-help">Studio is best for heavier work. Mobile is an optional convenience upgrade on Whidbey.</p>
                <div className="location-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.locationType === 'garage' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'garage' })}
                  >
                    Garage Studio
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.locationType === 'mobile' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'mobile' })}
                  >
                    On-Island Mobile
                  </button>
                </div>
                <FieldError msg={fieldErrors.locationType} />
              </div>

              <div className="input-group full-width" ref={dateRef}>
                <label>Preferred day</label>
                <BookingCalendar selectedDate={formData.date} onChange={(date) => setFormData({ ...formData, date })} bookedDates={bookedDates} />
                <FieldError msg={fieldErrors.date} />
              </div>

              <div className="input-group" ref={timeRef}>
                <label>Preferred time range</label>
                <select value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={fieldErrors.time ? 'input-error' : ''}>
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
                <label>Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={fieldErrors.fullName ? 'input-error' : ''}
                  placeholder="John Doe"
                />
                <FieldError msg={fieldErrors.fullName} />
              </div>

              <div className="input-group" ref={phoneRef}>
                <label>Phone number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={fieldErrors.phone ? 'input-error' : ''}
                  placeholder="(555) 555-5555"
                />
                <FieldError msg={fieldErrors.phone} />
              </div>

              <div className="input-group" ref={emailRef}>
                <label>Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={fieldErrors.email ? 'input-error' : ''}
                  placeholder="name@example.com"
                />
                <FieldError msg={fieldErrors.email} />
              </div>

              <div className="input-group full-width">
                <label>Notes</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Pet hair, stains, odors, child seats, access notes, or anything else that could affect time and scope."
                />
              </div>

              <div className="input-group full-width">
                <label>Plan interest (optional)</label>
                <p className="field-help">
                  Maintenance plans are for after a Deep Reset or New Car Protection.{' '}
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
                  >
                    <strong>No plan right now</strong>
                  </button>
                  {maintenancePlans.map((plan) => (
                    <button
                      type="button"
                      className={`plan-choice ${formData.maintenancePlanId === plan.id ? 'selected' : ''}`}
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, maintenancePlanId: plan.id })}
                    >
                      <strong>{planChoiceLabels[plan.id]}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group full-width file-upload">
                <label>Upload photos (optional)</label>
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={28} className="icon-lime" />
                  <p>Click to browse or drag and drop photos of the vehicle.</p>
                </div>
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
            <div className="stripe-secure-text">
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

              <div className="summary-block">
                <span>Add-ons</span>
                {selectedAddOns.length > 0 ? (
                  <ul className="summary-addon-list">
                    {selectedAddOns.map((addOn) => (
                      <li key={addOn.id}>
                        <span>{addOn.name}</span>
                        <strong>+{formatCurrency(addOn.price)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="section-note">None selected</p>
                )}
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
              <li>Choose the package and any optional upgrades.</li>
              <li>Pick the service mode, date, and time range that fit your week.</li>
              <li>Pay the 20% deposit to lock the appointment in.</li>
            </ol>
          </div>
        </aside>
      </div>

      <style>{`
        .booking-page {
          display: grid;
          gap: 2.25rem;
        }

        .compact-hero {
          max-width: 860px;
          margin: 0 auto;
        }

        .booking-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.8fr);
          gap: 1.5rem;
          align-items: start;
        }

        .booking-form {
          display: grid;
          gap: 1.75rem;
          padding: 1.5rem;
        }

        .booking-step {
          display: grid;
          gap: 0.95rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid var(--color-border-default);
        }

        .booking-step:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .booking-step h2 {
          font-size: 1.35rem;
        }

        .booking-package-grid,
        .plan-choice-list,
        .addon-selector-list {
          display: grid;
          gap: 0.85rem;
        }

        .booking-package-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .booking-package-card,
        .plan-choice,
        .addon-selector-row {
          padding: 1rem;
          text-align: left;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base),
            background-color var(--transition-base);
        }

        .booking-package-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
          border-color: var(--color-border-strong);
        }

        .booking-package-card.selected,
        .plan-choice.selected,
        .addon-selector-row.selected,
        .toggle-btn.active {
          border-color: var(--color-accent-primary);
          background: var(--color-selection-bg);
        }

        .booking-package-head,
        .addon-selector-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .booking-package-card h3 {
          font-size: 1.08rem;
        }

        .selected-chip {
          font-family: var(--font-label);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-accent-primary);
          white-space: nowrap;
        }

        .package-card-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .package-card-note {
          color: var(--color-text-secondary);
          font-size: 0.84rem;
          line-height: 1.55;
        }

        .addon-selector-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          width: 100%;
        }

        .addon-selector-row:hover {
          border-color: var(--color-accent-primary);
          background: color-mix(in srgb, var(--color-background-surface) 88%, var(--color-accent-primary) 12%);
        }

        .addon-selector-row:disabled {
          cursor: default;
          opacity: 1;
        }

        .addon-selector-left {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          flex: 1;
        }

        .addon-check {
          width: 18px;
          height: 18px;
          margin-top: 0.1rem;
          border-radius: 5px;
          border: 1px solid var(--color-border-strong);
          background: var(--color-background-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .addon-check.selected {
          border-color: var(--color-accent-primary);
          background: var(--color-selection-bg);
        }

        .addon-copy {
          display: grid;
          gap: 0.2rem;
        }

        .addon-selector-title span {
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .addon-selector-price {
          font-family: var(--font-label);
          color: var(--color-accent-primary);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .capacity-inline-note {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.8rem;
          width: fit-content;
          border-radius: 999px;
          border: 1px solid var(--color-border-default);
          background: var(--color-background-soft);
          color: var(--color-text-secondary);
          font-size: 0.84rem;
          font-weight: 700;
        }

        .location-toggle {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .toggle-btn {
          min-height: 48px;
          padding: 0.85rem 1rem;
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-input);
          background: var(--color-background-surface);
          color: var(--color-text-primary);
          font-weight: 700;
          transition:
            transform var(--transition-base),
            border-color var(--transition-base),
            box-shadow var(--transition-base),
            background-color var(--transition-base);
        }

        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .plan-choice-list.compact {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .plan-choice {
          min-height: 56px;
          display: flex;
          align-items: center;
        }

        .plan-choice strong {
          font-size: 0.94rem;
          color: var(--color-text-primary);
        }

        .inline-text-link {
          color: var(--color-accent-primary);
          font-weight: 700;
        }

        .booking-sidebar {
          position: sticky;
          top: 92px;
          display: grid;
          gap: 1rem;
        }

        .summary-card,
        .sidebar-card {
          padding: 1.1rem 1.2rem;
          display: grid;
          gap: 0.9rem;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-card);
        }

        .summary-header-desktop {
          display: block;
        }

        .summary-toggle-mobile {
          display: none;
        }

        .summary-content {
          display: grid;
          gap: 0.9rem;
        }

        .summary-row,
        .summary-block {
          display: grid;
          gap: 0.35rem;
          color: var(--color-text-secondary);
        }

        .summary-row {
          grid-template-columns: 1fr auto;
          align-items: baseline;
        }

        .summary-row strong,
        .summary-block strong {
          color: var(--color-text-primary);
        }

        .summary-row.highlight {
          padding: 0.8rem 0;
          border-top: 1px solid var(--color-border-default);
          border-bottom: 1px solid var(--color-border-default);
        }

        .summary-addon-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.5rem;
        }

        .summary-addon-list li {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.75rem;
          font-size: 0.92rem;
          color: var(--color-text-secondary);
        }

        .sidebar-steps {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--color-text-secondary);
          display: grid;
          gap: 0.55rem;
        }

        .notice-list {
          display: grid;
          gap: 0.8rem;
        }

        .policy-text {
          padding: 0.9rem 1rem;
          border-radius: 14px;
          border: 1px solid var(--color-border-default);
          background: var(--color-background-soft);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .form-footer {
          display: grid;
          gap: 0.7rem;
        }

        .btn-submit {
          width: 100%;
          min-height: 54px;
          font-size: 1rem;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .stripe-secure-text {
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }

        .error-banner {
          padding: 1rem 1.2rem;
          border-radius: 16px;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-weight: 700;
        }

        .system-error {
          background: var(--color-danger-soft);
          border: 1px solid var(--color-danger);
          color: var(--color-danger);
        }

        input.input-error,
        select.input-error {
          border-color: var(--color-danger) !important;
        }

        .field-error-msg {
          display: block;
          color: var(--color-danger);
          font-size: 0.82rem;
          margin-top: 0.4rem;
        }

        .autocomplete-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--color-background-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-input);
          list-style: none;
          margin: 0;
          padding: 0;
          z-index: 9999;
          max-height: 240px;
          overflow-y: auto;
          box-shadow: var(--shadow-hover);
        }

        .autocomplete-dropdown li {
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border-default);
        }

        .autocomplete-dropdown li:last-child {
          border-bottom: none;
        }

        .autocomplete-dropdown li:hover {
          background: var(--color-selection-bg);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .upload-dropzone {
          border: 1px dashed var(--color-border-strong);
          border-radius: var(--radius-input);
          padding: 1.75rem 1rem;
          text-align: center;
          background: var(--color-background-soft);
          cursor: pointer;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }

        .upload-dropzone:hover {
          border-color: var(--color-accent-primary);
          background: var(--color-selection-bg);
        }

        .upload-dropzone p {
          margin-top: 0.75rem;
          color: var(--color-text-secondary);
        }

        .file-preview-grid {
          display: grid;
          gap: 0.5rem;
        }

        .file-preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 0.55rem 0.85rem;
          background: var(--color-background-soft);
          border-radius: 12px;
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .file-preview-item button {
          background: none;
          border: none;
          color: var(--color-danger);
        }

        @media (max-width: 1080px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-sidebar {
            position: static;
          }
        }

        @media (max-width: 920px) {
          .booking-package-grid,
          .plan-choice-list.compact,
          .form-grid,
          .location-toggle {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1080px) {
          .summary-header-desktop {
            display: none;
          }

          .summary-toggle-mobile {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            background: transparent;
            border: none;
            padding: 0;
            color: var(--color-text-primary);
          }

          .summary-content {
            display: none;
          }

          .summary-content.open {
            display: grid;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
