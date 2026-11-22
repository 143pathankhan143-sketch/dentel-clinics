import { clinic, services } from '../data/clinic.js';

const slots = [
  { value: 'morning', label: '10:00 AM – 12:00 PM', start: 600, end: 720 },
  { value: 'midday', label: '12:00 PM – 2:00 PM', start: 720, end: 840 },
  { value: 'afternoon', label: '2:00 PM – 5:00 PM', start: 840, end: 1020 },
  { value: 'evening', label: '5:00 PM – 9:00 PM', start: 1020, end: 1260 },
];

export const appointmentTreatments = ['General consultation', ...services.map((service) => service.name), 'Other dental concern'];

export function indiaClock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function maxAppointmentDate(now = new Date()) {
  return indiaClock(new Date(now.getTime() + 90 * 86400000)).date;
}

export function isSunday(date) {
  return Boolean(date) && new Date(`${date}T12:00:00+05:30`).getUTCDay() === 0;
}

export function availableSlots(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const today = indiaClock(now);
  if (date < today.date || date > maxAppointmentDate(now)) return [];
  return slots.filter((slot) => (!isSunday(date) || slot.end <= 840)
    && (date !== today.date || slot.end > today.minutes));
}

export function normalisePhone(raw) {
  if (!/^[+\d\s()-]+$/.test(raw)) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

export function validateRequest(values, now = new Date()) {
  const errors = {};
  if (values.name.trim().length < 2 || values.name.trim().length > 80) errors.name = 'Please enter your full name (2–80 characters).';
  if (!normalisePhone(values.phone)) errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
  const today = indiaClock(now).date;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(values.date)
    && !Number.isNaN(Date.parse(`${values.date}T12:00:00+05:30`))
    && indiaClock(new Date(`${values.date}T12:00:00+05:30`)).date === values.date;
  if (!validDate) errors.date = 'Please choose a valid preferred date.';
  else if (values.date < today) errors.date = 'Please choose today or a future date.';
  else if (values.date > maxAppointmentDate(now)) errors.date = 'Please choose a date within the next 90 days.';
  if (!appointmentTreatments.includes(values.treatment)) errors.treatment = 'Please choose a treatment or general consultation.';
  if (!availableSlots(values.date, now).some((slot) => slot.value === values.time)) {
    errors.time = 'Please choose an available time window for this date.';
  }
  return errors;
}

export function formatAppointmentDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T12:00:00+05:30`));
}

export function appointmentMessage(values) {
  const slot = slots.find((item) => item.value === values.time);
  return [
    `Hello ${clinic.name}, I would like to request an appointment.`,
    '',
    `Name: ${values.name.trim()}`,
    `Mobile: +91 ${normalisePhone(values.phone)}`,
    `Enquiry: ${values.treatment}`,
    `Preferred date: ${formatAppointmentDate(values.date)}`,
    `Preferred time: ${slot?.label || ''} (IST)`,
    '',
    'Please confirm availability, the appointment time, and consultation fees. Thank you!',
  ].join('\n');
}

export function appointmentUrl(values) {
  return `${clinic.whatsapp}?text=${encodeURIComponent(appointmentMessage(values))}`;
}
