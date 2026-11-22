import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronDown, Copy, Phone, ShieldCheck } from 'lucide-react';
import { clinic } from '../data/clinic.js';
import { appointmentMessage, appointmentTreatments, appointmentUrl, availableSlots, formatAppointmentDate, indiaClock, isSunday, maxAppointmentDate, validateRequest } from '../lib/appointments.js';
import { WhatsAppMark } from './Icons.jsx';

export default function AppointmentForm({ initialTreatment = 'General consultation', compact = false }) {
  const id = useId();
  const formRef = useRef(null);
  const readyRef = useRef(null);
  const [values, setValues] = useState({ name: '', phone: '', date: '', time: '', treatment: initialTreatment });
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const dateSlots = availableSlots(values.date, clock);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (ready) readyRef.current?.focus();
  }, [ready]);

  function change(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value, ...(name === 'date' ? { time: '' } : {}) }));
    setErrors((previous) => ({ ...previous, [name]: '', ...(name === 'date' ? { time: '' } : {}) }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateRequest(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      window.requestAnimationFrame(() => formRef.current?.elements.namedItem(first)?.focus());
      return;
    }
    setReady(true);
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(appointmentMessage(values));
      setCopyStatus('Request copied. You can paste it into your message to the clinic.');
    } catch {
      setCopyStatus('Copy is unavailable in this browser. Please use the WhatsApp button or call the clinic.');
    }
  }

  const fieldProps = (name) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    onChange: change,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  const fieldError = (name) => errors[name] ? <span className="field-error" id={`${id}-${name}-error`}>{errors[name]}</span> : null;

  if (ready) {
    return (
      <div className="appointment-ready">
        <span className="ready-icon"><CheckCircle2 size={30} strokeWidth={1.6} /></span>
        <span className="eyebrow">YOUR REQUEST IS READY</span>
        <h3 ref={readyRef} tabIndex={-1}>One last step.<br />Let’s get in touch.</h3>
        <p>Send your request to the clinic on WhatsApp. <strong>This is not a confirmed booking.</strong></p>
        <dl className="request-summary">
          <div><dt>Name</dt><dd>{values.name.trim()}</dd></div>
          <div><dt>Enquiry</dt><dd>{values.treatment}</dd></div>
          <div><dt>Preferred date</dt><dd>{formatAppointmentDate(values.date)}</dd></div>
          <div><dt>Time · IST</dt><dd>{dateSlots.find((slot) => slot.value === values.time)?.label || 'Please reconfirm with the clinic'}</dd></div>
        </dl>
        <a className="button button-whatsapp" href={appointmentUrl(values)} target="_blank" rel="noopener noreferrer">
          <WhatsAppMark /> Send request on WhatsApp <ArrowRight size={17} />
        </a>
        <p className="confirmation-note"><ShieldCheck size={15} /> Your visit is confirmed only after the clinic responds.</p>
        <div className="request-actions">
          <button type="button" className="text-button" onClick={() => { setReady(false); setCopyStatus(''); }}>Edit request</button>
          <button type="button" className="text-button" onClick={copyRequest}><Copy size={14} /> Copy request</button>
        </div>
        <p className="copy-status" role="status">{copyStatus}</p>
        <a className="call-fallback" href={clinic.phoneHref}><Phone size={14} /> Prefer to call? {clinic.phone}</a>
      </div>
    );
  }

  return (
    <form className={`appointment-form ${compact ? 'appointment-form-compact' : ''}`} onSubmit={submit} noValidate ref={formRef}>
      <div className="form-intro">
        <span className="form-heading-icon"><CalendarDays size={23} strokeWidth={1.5} /></span>
        <div><h3>Let’s plan your visit.</h3><p>A little time for a healthier smile.</p></div>
      </div>
      <div className="form-fields">
        <div className="form-field">
          <label htmlFor={`${id}-name`}>Your name <span>*</span></label>
          <input {...fieldProps('name')} type="text" autoComplete="name" placeholder="Full name" maxLength={80} required />
          {fieldError('name')}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-phone`}>Mobile number <span>*</span></label>
          <div className="phone-input"><span>+91</span><input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Your mobile number" maxLength={18} required /></div>
          {fieldError('phone')}
        </div>
        <div className="form-field form-field-full">
          <label htmlFor={`${id}-treatment`}>What can we help you with? <span>*</span></label>
          <div className="select-wrap"><select {...fieldProps('treatment')} required>{appointmentTreatments.map((treatment) => <option key={treatment}>{treatment}</option>)}</select><ChevronDown size={16} /></div>
          {fieldError('treatment')}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-date`}>Preferred date <span>*</span></label>
          <input {...fieldProps('date')} type="date" min={indiaClock(clock).date} max={maxAppointmentDate(clock)} required />
          {fieldError('date')}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-time`}>Preferred time <span>*</span></label>
          <div className="select-wrap"><select {...fieldProps('time')} disabled={!values.date || !dateSlots.length} required>
            <option value="">{values.date ? 'Choose a time' : 'Choose a date first'}</option>
            {dateSlots.map((slot) => <option value={slot.value} key={slot.value}>{slot.label}</option>)}
          </select><ChevronDown size={16} /></div>
          {fieldError('time')}
        </div>
      </div>
      {values.date && isSunday(values.date) && <p className="schedule-note"><Check size={14} /> Sunday visits: 10:00 AM – 2:00 PM.</p>}
      {values.date && !dateSlots.length && <p className="schedule-note schedule-note-alert">No time windows are available for this date. Please choose a future date.</p>}
      <button className="button button-primary form-submit" type="submit">Prepare appointment request <ArrowRight size={18} /></button>
      <p className="form-privacy"><ShieldCheck size={15} /><span>Nothing is sent automatically. You’ll review your request, then send it on WhatsApp. The clinic will confirm availability.</span></p>
    </form>
  );
}
