import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { UploadCloud, CalendarCheck, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { BookingCalendar } from '../components/BookingCalendar';
import { fetchBookedDates } from '../api/availability';
import { createDepositCheckout } from '../api/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_TEST_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);
import { servicePackages } from '../data/packages';

// ─── Validation Helpers ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateFullName(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return 'Please enter your full name.';
  if (trimmed.split(/\s+/).length < 2) return 'Please enter both first and last name.';
  return '';
}

function validatePhone(v: string) {
  const digits = v.replace(/\D/g, '');
  if (!digits) return 'Please enter a valid US phone number (10 digits).';
  if (digits.length !== 10) return 'Please enter a valid US phone number (10 digits).';
  return '';
}

function validateEmail(v: string) {
  if (!v.trim()) return 'Please enter a valid email address.';
  if (!EMAIL_REGEX.test(v)) return 'Please enter a valid email address.';
  return '';
}

function validateVehicle(v: string) {
  if (v.trim().length < 3) return "Please enter your vehicle's make and model.";
  return '';
}

// ─── Address Autocomplete (Nominatim / OpenStreetMap) ────────────────────────
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
    if (query.length < 4) { setSuggestions([]); return; }
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
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 400);
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
        id="address-field"
      />
      {open && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((s) => (
            <li key={s.place_id} onMouseDown={() => handlePick(s.display_name)}>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Form Field Error Helper ──────────────────────────────────────────────────
const FieldError = ({ msg }: { msg: string }) =>
  msg ? (
    <span className="field-error-msg">
      <AlertCircle size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
      {msg}
    </span>
  ) : null;


// ─── Main Component ────────────────────────────────────────────────────────────
const BookingPage = () => {
  const [searchParams] = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Per-field validation errors
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

  const packageIdParam = searchParams.get('package') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    vehicleMake: '',
    vehicleYear: '',
    package: packageIdParam,
    locationType: '',
    date: '',
    time: '',
    notes: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for scroll-to-error
  const fullNameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const vehicleMakeRef = useRef<HTMLDivElement>(null);
  const packageRef = useRef<HTMLDivElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  const fieldRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSystemError(null);

    // ── Run all field validations ──────────────────────────────────────────
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      address: formData.address.trim() ? '' : 'Address / Location is required.',
      vehicleMake: validateVehicle(formData.vehicleMake),
      package: formData.package ? '' : 'Please select a package.',
      locationType: formData.locationType ? '' : 'Please select Garage Studio or Mobile.',
      date: formData.date ? '' : 'Please select a preferred date.',
      time: formData.time ? '' : 'Please select a preferred time.',
    };

    setFieldErrors(newErrors);

    // ── Find first error, scroll to it ─────────────────────────────────────
    const firstErrKey = Object.keys(newErrors).find(k => newErrors[k as keyof typeof newErrors]);
    if (firstErrKey) {
      const ref = fieldRefs[firstErrKey];
      ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ── All valid → call Edge Function ─────────────────────────────────────
    setIsSubmitting(true);

    try {
      const selectedPkg = servicePackages.find(p => p.id === formData.package);
      const basePrice = selectedPkg ? parseInt(selectedPkg.price) : 0;

      const session = await createDepositCheckout({
        packageId: formData.package,
        packageName: selectedPkg?.title || 'Vehicle Detail',
        packagePrice: basePrice,
        customerEmail: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        vehicleInfo: `${formData.vehicleYear} ${formData.vehicleMake}`.trim(),
        locationType: formData.locationType,
        serviceDate: formData.date,
        serviceTime: formData.time,
      });

      setClientSecret(session.clientSecret);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: unknown) {
      console.error('Booking submit error:', err);
      setSystemError(
        "We couldn't start the secure deposit process. Please try again or contact us directly."
      );
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  if (clientSecret) {
    return (
      <div className="booking-page container" style={{ padding: '8rem 1rem' }}>
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Complete Your Deposit</h2>
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px', margin: '0 auto', maxWidth: '800px', background: 'var(--color-bg-elevated)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="text-center mb-1">
          <div className="capacity-banner inline-block mb-3">
            <CalendarCheck size={16} /> Currently accepting one vehicle per day, Monday–Saturday.
          </div>
        </div>

        <div className="booking-header text-center">
          <h1>Configure Your Detail</h1>
          <p className="hook-text">Submit your request. A 20% deposit is required to secure your spot. The remaining balance is due after the service (cash, card, Cash App, or transfer).</p>
        </div>

        {/* System error banner (backend/Stripe failures only) */}
        {systemError && (
          <div className="error-banner system-error">
            <AlertCircle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
            {systemError}
          </div>
        )}

        <div className="booking-container flex-container mt-2">
          {/* Form */}
          <div className="form-column">
            <form className="booking-form glass" onSubmit={handleSubmit} noValidate>

              {/* ── Section 1: Personal Details ────────────────────────── */}
              <section className="form-section">
                <h3>1. Personal Details</h3>
                <div className="form-grid">

                  <div className="input-group" ref={fullNameRef}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className={fieldErrors.fullName ? 'input-error' : ''}
                      id="fullName-field"
                    />
                    <FieldError msg={fieldErrors.fullName} />
                  </div>

                  <div className="input-group" ref={phoneRef}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(XXX) XXX-XXXX"
                      className={fieldErrors.phone ? 'input-error' : ''}
                      id="phone-field"
                    />
                    <FieldError msg={fieldErrors.phone} />
                  </div>

                  <div className="input-group full-width" ref={emailRef}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => setFieldErrors({ ...fieldErrors, email: validateEmail(formData.email) })}
                      placeholder="john@example.com"
                      className={fieldErrors.email ? 'input-error' : ''}
                      id="email-field"
                    />
                    <FieldError msg={fieldErrors.email} />
                  </div>

                  <div className="input-group full-width" ref={addressRef}>
                    <label>Address / Location *</label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={v => setFormData({ ...formData, address: v })}
                      hasError={!!fieldErrors.address}
                    />
                    <FieldError msg={fieldErrors.address} />
                  </div>

                </div>
              </section>

              {/* ── Section 2: Vehicle Info ─────────────────────────────── */}
              <section className="form-section">
                <h3>2. Vehicle Information</h3>
                <div className="form-grid">
                  <div className="input-group" ref={vehicleMakeRef}>
                    <label>Vehicle Make &amp; Model *</label>
                    <input
                      type="text"
                      value={formData.vehicleMake}
                      onChange={e => setFormData({ ...formData, vehicleMake: e.target.value })}
                      onBlur={() => setFieldErrors({ ...fieldErrors, vehicleMake: validateVehicle(formData.vehicleMake) })}
                      placeholder="e.g. Ford F-150 / Tesla Model 3"
                      className={fieldErrors.vehicleMake ? 'input-error' : ''}
                      id="vehicle-field"
                    />
                    <FieldError msg={fieldErrors.vehicleMake} />
                  </div>
                  <div className="input-group">
                    <label>Vehicle Year</label>
                    <select
                      value={formData.vehicleYear}
                      onChange={e => setFormData({ ...formData, vehicleYear: e.target.value })}
                    >
                      <option value="">-- Select Year --</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* ── Section 3: Service Options ─────────────────────────── */}
              <section className="form-section">
                <h3>3. Service Options</h3>

                <div className="input-group full-width mb-1" ref={packageRef}>
                  <label>Select Package *</label>
                  <select
                    value={formData.package}
                    onChange={e => setFormData({ ...formData, package: e.target.value })}
                    className={fieldErrors.package ? 'input-error' : ''}
                    id="package-field"
                  >
                    <option value="">-- Choose a Package --</option>
                    {servicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.title} (From ${pkg.price})</option>
                    ))}
                  </select>
                  <FieldError msg={fieldErrors.package} />
                </div>

                <div className="input-group full-width mt-1 mb-1" ref={locationTypeRef}>
                  <label>Service Location *</label>
                  <div className={`location-toggle ${fieldErrors.locationType ? 'toggle-error' : ''}`}>
                    <button type="button" className={`toggle-btn ${formData.locationType === 'garage' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, locationType: 'garage' })}>
                      Garage Studio (Erie St)
                    </button>
                    <button type="button" className={`toggle-btn ${formData.locationType === 'mobile' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, locationType: 'mobile' })}>
                      Mobile (Your Driveway)
                    </button>
                  </div>
                  <FieldError msg={fieldErrors.locationType} />
                </div>
              </section>

              {/* ── Section 4: Appointment ─────────────────────────────── */}
              <section className="form-section">
                <h3>4. Appointment &amp; Details</h3>

                <div className="input-group full-width mb-2" ref={dateRef}>
                  <label>Select Availability *</label>
                  <BookingCalendar
                    selectedDate={formData.date}
                    onChange={date => setFormData({ ...formData, date })}
                    bookedDates={bookedDates}
                  />
                  <FieldError msg={fieldErrors.date} />
                </div>

                <div className="form-grid">
                  <div className="input-group" ref={timeRef}>
                    <label>Preferred Time *</label>
                    <select
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className={fieldErrors.time ? 'input-error' : ''}
                      id="time-field"
                    >
                      <option value="">-- Choose Time --</option>
                      <option value="morning">Morning (8am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 4pm)</option>
                    </select>
                    <FieldError msg={fieldErrors.time} />
                  </div>
                </div>

                <div className="input-group full-width mt-2">
                  <label>Additional Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific issues? (Pet hair, heavy staining, odors, etc.)"
                  ></textarea>
                </div>

                <div className="input-group full-width file-upload mt-2">
                  <label>Upload Photos (Optional)</label>
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
                    <UploadCloud size={32} className="icon-lime" />
                    <p>Click here to <span className="browse-text">Browse</span> or drag &amp; drop</p>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="file-preview-grid mt-1">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="file-preview-item">
                          <span>{file.name}</span>
                          <button type="button" onClick={() => removeFile(idx)} aria-label="Remove file">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <div className="form-footer mt-4 text-center">
                <button type="submit" className="btn primary btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Proceed to Secure 20% Deposit'}
                </button>
                <div className="stripe-secure-text mt-1">
                  <ShieldCheck size={14} /> Payments processed securely via Stripe.
                </div>
              </div>

            </form>
          </div>

          {/* Sidebar */}
          <div className="sidebar-column">
            <div className="sidebar-card glass">
              <h3>Next Steps</h3>
              <ol className="sidebar-steps">
                <li>Submit your vehicle details here.</li>
                <li>Pay the 20% non-refundable deposit via Stripe to instantly lock your slot.</li>
                <li>The remaining 80% is paid in-person after service completion.</li>
              </ol>
            </div>

            <div className="upsell-box mt-2">
              <h4>Maintenance Plan</h4>
              <p>Add a membership plan after your detail to effortlessly maintain gloss.</p>
              <div className="checkbox-wrap mt-1">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkbox-text">I'm interested in $60/mo upkeep</span>
                </label>
              </div>
            </div>

            <div className="policy-text mt-2">
              <p><strong>Cancellation Policy:</strong> A 20% deposit secures your slot. Cancellations within 24 hours forfeit the deposit.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-page { padding: 4rem 0; }
        .booking-header { margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto; }
        .booking-header h1 { font-size: 3.5rem; margin-bottom: 0.5rem; }
        .hook-text { font-size: 1.15rem; color: var(--color-text-muted); line-height: 1.6; }

        /* Error states */
        .error-banner { padding: 1.25rem 1.5rem; border-radius: var(--radius-md); max-width: 800px; margin: 0 auto 2rem; display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 600; }
        .system-error { background: rgba(220, 38, 38, 0.12); border: 1px solid #dc2626; color: #fca5a5; }
        [data-theme='light'] .system-error { background: #fee2e2; color: #991b1b; border-color: #ef4444; }
        
        input.input-error, select.input-error { border-color: #ef4444 !important; }
        .toggle-error .toggle-btn { border-color: #ef4444; }
        .field-error-msg { display: block; color: #f87171; font-size: 0.82rem; margin-top: 0.4rem; }
        [data-theme='light'] .field-error-msg { color: #dc2626; }

        /* Address autocomplete */
        .autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #0b1121; border: 1px solid var(--color-border); border-radius: var(--radius-md); list-style: none; margin: 2px 0 0; padding: 0; z-index: 9999; max-height: 240px; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .autocomplete-dropdown li { padding: 0.75rem 1rem; cursor: pointer; font-size: 0.9rem; color: var(--color-text-main); border-bottom: 1px solid var(--color-border); }
        .autocomplete-dropdown li:last-child { border-bottom: none; }
        .autocomplete-dropdown li:hover { background: rgba(158, 255, 0, 0.15); }
        [data-theme='light'] .autocomplete-dropdown { background: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
        [data-theme='light'] .autocomplete-dropdown li:hover { background: #f0f9df; }

        .flex-container { display: flex; gap: 3rem; align-items: flex-start; max-width: 1100px; margin: 0 auto; }
        .form-column { flex: 2; }
        .sidebar-column { flex: 1; position: sticky; top: 100px; }
        
        .booking-form { padding: 3rem; border-radius: var(--radius-lg); border-top: 4px solid var(--color-accent-lime); }
        
        .form-section { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--color-border); }
        .form-section:last-of-type { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .form-section h3 { font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--color-accent-lime); display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }
        [data-theme='light'] .form-section h3 { color: #559300; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .input-group { display: flex; flex-direction: column; }
        .full-width { grid-column: 1 / -1; }
        
        .location-toggle { display: flex; gap: 1rem; }
        .toggle-btn { flex: 1; padding: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: rgba(128,128,128,0.1); color: var(--color-text-muted); font-weight: 600; font-size: 1.05rem; transition: all 0.2s; }
        .toggle-btn.active { border-color: var(--color-accent-lime); background: rgba(158, 255, 0, 0.1); color: var(--color-text-main); }
        [data-theme='light'] .toggle-btn.active { background: #f4faeb; border-color: #559300; }
        
        .upsell-box { padding: 1.5rem; background: rgba(128,128,128,0.05); border: 1px solid var(--color-accent-lime); border-radius: var(--radius-md); }
        .upsell-box h4 { font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-accent-lime); }
        [data-theme='light'] .upsell-box h4 { color: #559300; }
        .upsell-box p { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.5; }
        
        .checkbox-label { display: flex; align-items: flex-start; gap: 1rem; cursor: pointer; margin: 0; }
        .checkbox-label input { width: 1.25rem; height: 1.25rem; margin-top: 0.1rem; accent-color: var(--color-accent-lime); }
        .checkbox-text { font-weight: 600; color: var(--color-text-main); }
        
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
        .upload-dropzone { border: 2px dashed rgba(128, 128, 128, 0.4); border-radius: var(--radius-md); padding: 3rem 2rem; text-align: center; background: rgba(128,128,128,0.05); cursor: pointer; transition: background var(--transition-fast), border-color var(--transition-fast); }
        .upload-dropzone:hover { background: rgba(158, 255, 0, 0.05); border-color: var(--color-accent-lime); }
        .browse-text { color: var(--color-accent-lime); text-decoration: underline; font-weight: 600; }
        [data-theme='light'] .browse-text { color: #559300; }
        .upload-dropzone p { margin-top: 1rem; color: var(--color-text-muted); }
        
        .file-preview-grid { display: grid; gap: 0.5rem; }
        .file-preview-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: rgba(128,128,128,0.1); border-radius: 4px; font-size: 0.9rem; color: var(--color-text-main); }
        .file-preview-item button { background: none; border: none; color: #ef4444; cursor: pointer; }

        .sidebar-card { padding: 2rem; border-radius: var(--radius-md); }
        .sidebar-card h3 { font-size: 1.25rem; margin-bottom: 1rem; color: var(--color-text-main); }
        .sidebar-steps { padding-left: 1.25rem; color: var(--color-text-muted); line-height: 1.6; }
        .sidebar-steps li { margin-bottom: 0.5rem; }
        
        .policy-text { font-size: 0.9rem; color: var(--color-text-muted); padding: 1rem; border-left: 3px solid rgba(128,128,128,0.2); background: rgba(128,128,128,0.05); }
        .policy-text strong { color: var(--color-text-main); }

        .btn-submit { width: 100%; font-size: 1.25rem; padding: 1.25rem; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .stripe-secure-text { color: var(--color-text-muted); font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 4px; }

        @media (max-width: 900px) {
          .flex-container { flex-direction: column-reverse; }
          .sidebar-column { width: 100%; position: static; }
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .location-toggle { flex-direction: column; }
          .booking-form { padding: 1.5rem; border-radius: var(--radius-md); }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
