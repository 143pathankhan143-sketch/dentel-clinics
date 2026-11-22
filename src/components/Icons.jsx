export function ToothMark({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 48 52" fill="none" className={className} aria-hidden="true" {...props}>
      <path d="M23.8 10.7C17.3 5 6.4 8.3 6.4 18.2c0 7 3.7 10.7 5 18.5 1.3 8.3 5.4 12.1 8 2.3l2.2-8.1c.7-2.8 3.8-2.8 4.6 0l2.2 8.1c2.6 9.8 6.7 6 8-2.3 1.3-7.8 5-11.5 5-18.5 0-9.9-10.9-13.2-17.6-7.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.6 10c2 2.3 4.5 3.4 8.7 3.4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38.5 2v8M34.5 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function GoogleMark({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5L18.7 4.6A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z" />
    </svg>
  );
}

export function WhatsAppMark({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" {...props}>
      <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.3-4.8a8.5 8.5 0 1 1 16.2-4.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9.2 7.7-.7-.1c-.3 0-.6.1-.8.4-.5.5-.7 1.2-.5 1.9.6 2.5 2.5 4.5 5 5.3.8.3 1.7.4 2.5-.1.3-.2.7-.7.7-1.2l-.1-.6-2-.9-.9 1c-1.3-.5-2.3-1.5-2.9-2.8l.8-1-1.1-1.9Z" fill="currentColor" />
    </svg>
  );
}

export function TreatmentIcon({ type = 'checkup', className = '' }) {
  const tooth = 'M31 19c-7-5-18-1-18 9 0 7 4 10 5 18 1 7 5 10 8 1l3-8c1-3 4-3 5 0l3 8c3 9 7 6 8-1 1-8 5-11 5-18 0-10-11-14-19-9Z';
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {type === 'implant' ? <>
        <path d="M21 28v-9c0-7 22-7 22 0v9H21Z" fill="currentColor" fillOpacity=".05" />
        <path d="M25 29v20l7 7 7-7V29M22 35h20M22 41h20M25 47h14M28 53h8M19 28h26" />
        <path d="M32 7V3M14 15l-4-3M50 15l4-3" opacity=".45" />
      </> : <>
        <path d={tooth} fill="currentColor" fillOpacity=".04" />
        <path d="M25 19c2 2 5 3 9 3" opacity=".45" />
        {type === 'root' && <>
          <path d="M24 30c2-6 13-6 15 0 1 5-6 7-6 12v5M29 35c-1 3-4 5-5 10" stroke="#69a0c9" />
          <circle cx="32" cy="29" r="3" fill="#69a0c9" fillOpacity=".2" stroke="none" />
        </>}
        {type === 'braces' && <>
          <path d="M13 30c11 5 26 5 37 0" />
          <rect x="19" y="28" width="6" height="7" rx="1" fill="#f5f9ff" />
          <rect x="29" y="29" width="6" height="7" rx="1" fill="#f5f9ff" />
          <rect x="39" y="28" width="6" height="7" rx="1" fill="#f5f9ff" />
        </>}
        {type === 'whitening' && <>
          <path d="m47 6 1.9 5.1L54 13l-5.1 1.9L47 20l-1.9-5.1L40 13l5.1-1.9L47 6ZM8 31v8M4 35h8M52 41v6M49 44h6" />
          <path d="m25 27 3 3 6-7" strokeWidth="2" opacity=".7" />
        </>}
        {type === 'cleaning' && <>
          <path d="m40 12 7-7 8 8-7 7M44 9l8 8M40 12l8 8M45 17 30 32" strokeWidth="2.6" />
          <path d="M8 44v6M5 47h6M53 30v6M50 33h6" opacity=".65" />
        </>}
        {type === 'checkup' && <>
          <circle cx="45" cy="15" r="7" fill="#f0f6ff" />
          <path d="m40 21-9 13M43 12a3 3 0 0 1 5 1M7 29v6M4 32h6" />
        </>}
      </>}
    </svg>
  );
}
