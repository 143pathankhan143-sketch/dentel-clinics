import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChevronRight, Clock3, Heart, MapPin, Menu, MessageCircle, Phone, Plus, ShieldCheck, Sparkles, Star, Users, X } from 'lucide-react';
import AppointmentForm from './components/AppointmentForm.jsx';
import TreatmentCard from './components/TreatmentCard.jsx';
import './components/ClinicMedia.css';
import { GoogleMark, ToothMark, TreatmentIcon, WhatsAppMark } from './components/Icons.jsx';
import { clinic, faqs, filters, services } from './data/clinic.js';
import { indiaClock } from './lib/appointments.js';

const navItems = [
  ['home', 'Home'], ['services', 'Services'], ['about', 'About us'],
  ['reviews', 'Reviews'], ['faq', 'FAQs'], ['contact', 'Contact'],
];
const chatUrl = `${clinic.whatsapp}?text=${encodeURIComponent('Hello SARDA DENTAL CARE, I would like to know more about a dental appointment. Could you please help me?')}`;

function Brand({ light = false, onClick }) {
  return (
    <a href="#home" className={`brand ${light ? 'brand-light' : ''}`} aria-label="SARDA DENTAL CARE home" onClick={onClick}>
      <span className="brand-symbol"><ToothMark /></span>
      <span className="brand-words"><span className="brand-name">SARDA<span className="brand-dot">.</span></span><span className="brand-descriptor">DENTAL CARE</span></span>
    </a>
  );
}

function Stars({ className = '', size = 15 }) {
  return <span className={`stars ${className}`} role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} fill="currentColor" strokeWidth={0} aria-hidden="true" />)}</span>;
}

function LiveStatus() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const time = indiaClock(now);
  const closing = time.weekday === 'Sun' ? 840 : 1260;
  const open = time.minutes >= 600 && time.minutes < closing;
  const text = open ? `Open now · Until ${time.weekday === 'Sun' ? '2' : '9'} PM` : time.minutes < 600 ? 'Opens today at 10 AM' : 'Opens tomorrow at 10 AM';
  return <span className={`live-status ${open ? 'is-open' : ''}`}><span />{text}<span className="sr-only">, India Standard Time</span></span>;
}

function Modal({ label, className = '', onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const previousFocus = document.activeElement;
    const initialWidth = document.documentElement.clientWidth;
    const node = dialog.current;
    document.body.style.overflow = 'hidden';
    const widthChange = document.documentElement.clientWidth - initialWidth;
    if (widthChange > 0) {
      const padding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${padding + widthChange}px`;
    }
    node?.showModal();
    return () => {
      node?.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function keepFocusInDialog(event) {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  return (
    <dialog ref={dialog} className={`modal ${className}`} aria-label={label} onKeyDown={keepFocusInDialog} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-inner">
        <button type="button" className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}><X size={21} /></button>
        {children}
      </div>
    </dialog>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(0);
  const [modal, setModal] = useState(null);
  const filteredServices = activeFilter === 'all' ? services : services.filter((service) => service.category === activeFilter);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    navItems.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  function bookVisit(treatment = 'General consultation') {
    setMobileOpen(false);
    setModal({ type: 'booking', treatment });
  }

  function goToSection(id) {
    setMobileOpen(false);
    setActiveSection(id);
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="topbar">
        <div className="container topbar-inner">
          <a href={clinic.maps} target="_blank" rel="noopener noreferrer"><MapPin size={13} /> Signal Camp, Latur, Maharashtra</a>
          <span className="topbar-message">A little care. A lifetime of happy smiles.</span>
          <span><Clock3 size={13} /> Mon–Sat: 10 AM–9 PM <span className="topbar-divider">|</span> Sun: 10 AM–2 PM</span>
        </div>
      </div>
      <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-inner">
          <Brand onClick={() => goToSection('home')} />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map(([id, label]) => <a href={`#${id}`} key={id} className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'location' : undefined} onClick={() => goToSection(id)}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <a className="header-phone" href={clinic.phoneHref} aria-label={`Call SARDA DENTAL CARE on ${clinic.phone}`}><Phone size={18} strokeWidth={1.7} /><span>70207 51388</span></a>
            <button className="button button-primary header-book" onClick={() => bookVisit()}>Book a visit <ArrowUpRight size={17} /></button>
          </div>
          <button className="mobile-menu-toggle icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileOpen && <>
          <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            {navItems.map(([id, label]) => <a href={`#${id}`} key={id} onClick={() => goToSection(id)}>{label}<ChevronRight size={17} /></a>)}
            <button className="button button-primary" onClick={() => bookVisit()}>Book an appointment <ArrowUpRight size={18} /></button>
            <a href={clinic.phoneHref} className="mobile-nav-call"><Phone size={16} /> {clinic.phone}</a>
          </nav>
        </>}
      </header>

      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-wash" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> YOUR SMILE, OUR PRIORITY</span>
              <h1 id="hero-title">A little care.<br />A lifetime of<br /><span className="hero-highlight"><em>happy smiles.</em><svg viewBox="0 0 500 18" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12C111 2 303 1 494 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg></span></h1>
              <p className="hero-description">Your neighbourhood dental clinic in Signal Camp, Latur. Let’s make a little time for a healthier, more confident you.</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => bookVisit()}>Book an appointment <ArrowUpRight size={19} /></button>
                <a className="button button-outline" href={clinic.phoneHref}><Phone size={17} /> Let’s talk</a>
              </div>
              <div className="hero-reassurance"><span className="reassurance-icon"><CalendarDays size={21} strokeWidth={1.5} /></span><div><strong>Here for your smile. All 7 days.</strong><span>Evening appointments, Monday to Saturday.</span></div></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-backdrop" aria-hidden="true" />
              <figure className="hero-image clinic-portrait"><button className="clinic-photo-trigger" aria-label="View the supplied portrait" onClick={() => setModal({ type: 'photo', src: './images/clinic/clinic-portrait-full.webp', alt: 'Portrait supplied for SARDA Dental Care', title: 'A personal approach to your smile', caption: 'Photograph supplied for SARDA DENTAL CARE.' })}><img src="./images/clinic/clinic-portrait.webp" alt="Portrait supplied for SARDA Dental Care" width="770" height="773" fetchPriority="high" /><span className="clinic-photo-expand" aria-hidden="true"><ArrowUpRight size={17} /></span></button><figcaption>Care that feels personal.</figcaption></figure>
              <div className="care-stamp" aria-hidden="true">
                <svg viewBox="0 0 120 120" className="stamp-text"><defs><path id="stamp-path" d="M60,60m-43,0a43,43 0 1,1 86,0a43,43 0 1,1 -86,0" /></defs><text><textPath href="#stamp-path" startOffset="1%">HAPPY SMILES · HEALTHY LIVES · </textPath></text></svg>
                <ToothMark className="stamp-tooth" />
              </div>
              <Sparkles className="hero-sparkle" size={34} strokeWidth={1.2} aria-hidden="true" />
              <div className="hero-rating"><GoogleMark /><div><div className="hero-rating-top"><strong>5.0</strong><Stars size={13} /></div><span>Loved in 101 Google reviews</span></div><BadgeCheck size={20} className="rating-verified" /></div>
              <span className="hero-location"><MapPin size={14} /> A little closer to a happier smile.</span>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Clinic at a glance">
          <div className="container trust-grid">
            <div className="trust-item"><span className="trust-icon"><Star size={23} strokeWidth={1.5} /></span><div><strong>5.0 on Google</strong><span>A little love from our community</span></div></div>
            <div className="trust-item"><span className="trust-icon"><Users size={23} strokeWidth={1.5} /></span><div><strong>101 five-star reviews</strong><span>101 reasons to get to know us</span></div></div>
            <div className="trust-item"><span className="trust-icon"><Clock3 size={23} strokeWidth={1.5} /></span><div><strong>Open all 7 days</strong><span>Care that fits into your week</span></div></div>
            <div className="trust-item"><span className="trust-icon"><MapPin size={23} strokeWidth={1.5} /></span><div><strong>Signal Camp, Latur</strong><span>Your neighbourhood dental clinic</span></div></div>
          </div>
        </section>

        <section className="section services-section" id="services" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading split-heading">
              <div><span className="eyebrow"><span className="eyebrow-line" /> EXPLORE DENTAL CARE</span><h2 id="services-title">Care for every<br /><em>kind of smile.</em></h2></div>
              <div className="section-heading-aside"><p>From everyday dental questions to a smile you feel more confident about, start by exploring your options.</p><button className="text-link" onClick={() => bookVisit()}>Not sure where to start? Let’s talk <ArrowUpRight size={17} /></button></div>
            </div>
            <div className="treatment-filters" role="group" aria-label="Filter dental treatments">{filters.map((filter) => <button key={filter.id} className={activeFilter === filter.id ? 'selected' : ''} aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}{activeFilter === filter.id && <span className="filter-dot" />}</button>)}</div>
            <p className="sr-only" role="status">{filteredServices.length} treatments shown</p>
            <div className="services-grid treatment-grid" data-card-count={filteredServices.length}>
              {filteredServices.map((service) => <TreatmentCard key={`${activeFilter}-${service.id}`} service={service} onExplore={(selectedService) => setModal({ type: 'service', service: selectedService })} />)}
            </div>
            <p className="treatment-disclaimer"><ShieldCheck size={16} /> Common treatments are shown for information. Please call to confirm availability, suitability and fees.</p>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-title">
          <div className="container about-grid">
            <div className="about-visual clinic-visual">
              <figure className="about-image"><button className="clinic-photo-trigger" aria-label="View full clinic photo" onClick={() => setModal({ type: 'photo', src: './images/clinic/clinic-exterior-full.webp', alt: 'SARDA DENTAL CARE entrance and illuminated clinic sign', title: 'SARDA DENTAL CARE · Signal Camp, Latur', caption: 'Clinic exterior photograph supplied for this website.' })}><img src="./images/clinic/clinic-exterior.webp" alt="SARDA DENTAL CARE entrance and illuminated clinic sign" width="1200" height="1008" loading="lazy" /><span className="clinic-photo-expand" aria-hidden="true"><span>View full photo</span><ArrowUpRight size={16} /></span></button><figcaption>SARDA DENTAL CARE · Signal Camp, Latur</figcaption></figure>
              <div className="clinic-specialists" role="group" aria-label="Clinician details from the supplied clinic sign">{clinic.clinicians.map((clinician) => <article className="clinic-specialist" key={clinician.name}><h3>{clinician.name}</h3><p className="clinician-qualification">{clinician.qualification}</p><p>{clinician.focus}</p></article>)}</div>
              <div className="about-corner" aria-hidden="true"><Sparkles size={31} strokeWidth={1.2} /></div>
            </div>
            <div className="about-copy">
              <span className="eyebrow"><span className="eyebrow-line" /> HELLO, WE’RE SARDA DENTAL CARE</span>
              <h2 id="about-title">Right here in Latur.<br /><em>Right here for you.</em></h2>
              <p>Good dental care starts with a conversation. Whether it’s time for a check-up or there’s something about your smile you’d like to discuss, take that first step with us.</p>
              <p>You’ll find SARDA DENTAL CARE in Signal Camp, near Shri Deshikendra High School Playground. Familiar surroundings. A convenient next step for your smile.</p>
              <div className="about-features">
                <div><span><CalendarDays size={19} /></span><div><h3>A little easier to make time</h3><p>Open every day, with evening hours Monday to Saturday.</p></div></div>
                <div><span><MapPin size={19} /></span><div><h3>A little closer to home</h3><p>Easy to locate in the Signal Camp neighbourhood.</p></div></div>
                <div><span><MessageCircle size={19} /></span><div><h3>A simple place to start</h3><p>Call or WhatsApp to discuss your visit and current fees.</p></div></div>
              </div>
              <button className="button button-primary" onClick={() => bookVisit()}>Let’s talk about your smile <ArrowUpRight size={18} /></button>
            </div>
          </div>
        </section>

        <section className="section visit-section" aria-labelledby="visit-title">
          <div className="container">
            <div className="section-heading centered-heading"><span className="eyebrow">SMALL STEPS. A HEALTHIER YOU.</span><h2 id="visit-title">Your next visit, <em>made simple.</em></h2><p>No complicated sign-ups. Just a conversation with your clinic.</p></div>
            <div className="visit-steps">
              <article><div className="step-icon"><CalendarDays size={27} strokeWidth={1.5} /><span>01</span></div><h3>Make a little time</h3><p>Choose your preferred date and tell us what you’d like to discuss.</p></article>
              <article><div className="step-icon"><WhatsAppMark /><span>02</span></div><h3>Say hello on WhatsApp</h3><p>Review your appointment request and send it directly to the clinic.</p></article>
              <article><div className="step-icon"><Check size={29} strokeWidth={1.6} /><span>03</span></div><h3>Get your visit confirmed</h3><p>The clinic will confirm availability, fees and a convenient time with you.</p></article>
            </div>
          </div>
        </section>

        <section className="section reviews-section" id="reviews" aria-labelledby="reviews-title">
          <div className="container reviews-grid">
            <div className="reviews-copy"><span className="eyebrow"><span className="eyebrow-line" /> A LITTLE LOVE FROM LATUR</span><h2 id="reviews-title">Good words.<br /><em>Even better smiles.</em></h2><p>A 5.0 rating from 101 Google reviews. Explore what patients have shared and get to know your neighbourhood dental clinic.</p><a href={clinic.maps} className="text-link" target="_blank" rel="noopener noreferrer">Read the reviews on Google <ArrowUpRight size={18} /></a><span className="review-snapshot">Based on the shared Google listing snapshot.<br />Ratings and review counts may change.</span></div>
            <div className="google-review-card">
              <div className="review-card-header"><span><GoogleMark /> Google reviews</span><span className="google-tag"><BadgeCheck size={13} /> Patient ratings</span></div>
              <div className="review-breakdown"><div className="review-score"><span>5.0<span>/5</span></span><Stars size={20} /><p>Based on 101 reviews</p></div><div className="review-bars">{[5, 4, 3, 2, 1].map((rating) => <div className="review-bar-row" key={rating}><span>{rating}</span><Star size={11} fill="currentColor" strokeWidth={0} aria-hidden="true" /><span className="review-bar"><span style={{ width: rating === 5 ? '100%' : '0%' }} /></span><span className="review-bar-count">{rating === 5 ? '101' : '0'}</span></div>)}</div></div>
              <div className="review-card-footer"><span><Heart size={17} /> 101 reviews. 101 five-star ratings.</span><a href={clinic.maps} aria-label="View SARDA DENTAL CARE on Google Maps" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={20} /></a></div>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="faq-copy"><span className="eyebrow"><span className="eyebrow-line" /> GOOD QUESTIONS. SIMPLE ANSWERS.</span><h2 id="faq-title">A little clarity.<br /><em>A lot less worry.</em></h2><p>A few things you might like to know before we say hello.</p><div className="faq-help"><span><MessageCircle size={25} strokeWidth={1.5} /></span><div><strong>Still have something on your mind?</strong><a href={chatUrl} target="_blank" rel="noopener noreferrer">We’re a message away <ArrowUpRight size={15} /></a></div></div></div>
            <div className="faq-list">{faqs.map((faq, index) => <article className={`faq-item ${openFaq === index ? 'faq-open' : ''}`} key={faq.question}><h3><button id={`faq-question-${index}`} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.question}</span><span className="faq-toggle"><Plus size={18} /></span></button></h3><div id={`faq-answer-${index}`} className="faq-answer" role="region" aria-labelledby={`faq-question-${index}`} hidden={openFaq !== index}><p>{faq.answer}</p></div></article>)}</div>
          </div>
        </section>

        <section className="section contact-section" id="contact" aria-labelledby="contact-title">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-copy"><span className="eyebrow"><span className="eyebrow-line" /> LET’S MAKE YOU SMILE</span><h2 id="contact-title">Make a little time<br /><em>for your smile.</em></h2><p>Have a question? Ready for a visit? We’re just a call or a message away.</p>
                <div className="contact-details">
                  <div className="contact-detail"><span className="contact-icon"><Phone size={21} strokeWidth={1.5} /></span><div><span className="detail-label">LET’S TALK</span><a className="contact-phone" href={clinic.phoneHref}>{clinic.phone}</a><a href={chatUrl} className="subtle-link" target="_blank" rel="noopener noreferrer">Or say hello on WhatsApp <ArrowUpRight size={14} /></a></div></div>
                  <div className="contact-detail"><span className="contact-icon"><MapPin size={22} strokeWidth={1.5} /></span><div><span className="detail-label">COME SAY HELLO</span><p>Near Shri Deshikendra High School Playground,<br />Signal Camp, Latur, Maharashtra — 413531</p><a href={clinic.directions} className="subtle-link" target="_blank" rel="noopener noreferrer">Get directions <ArrowUpRight size={14} /></a></div></div>
                  <div className="contact-detail"><span className="contact-icon"><Clock3 size={22} strokeWidth={1.5} /></span><div className="hours-detail"><span className="detail-label">A TIME THAT WORKS FOR YOU</span><dl><div><dt>Monday – Saturday</dt><dd>10 AM – 9 PM</dd></div><div><dt>Sunday</dt><dd>10 AM – 2 PM</dd></div></dl><LiveStatus /><span className="hours-note">All times in IST. Please call ahead on public holidays.</span></div></div>
                </div>
              </div>
              <div className="booking-card"><AppointmentForm /></div>
            </div>
            <div className="map-card"><div className="map-card-info"><span className="eyebrow">A LITTLE CLOSER TO HOME</span><h3>We’re in your<br /><em>neighbourhood.</em></h3><p>Signal Camp, Latur<br />Near Shri Deshikendra<br />High School Playground</p><a className="button button-outline" href={clinic.directions} target="_blank" rel="noopener noreferrer"><MapPin size={16} /> Get directions <ArrowUpRight size={16} /></a></div><div className="map-embed"><iframe title="SARDA DENTAL CARE location in Signal Camp, Latur" src="https://maps.google.com/maps?q=18.3971121%2C76.5697103&z=16&output=embed" width="850" height="340" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /><a className="map-open-link" href={clinic.maps} target="_blank" rel="noopener noreferrer">Open in Google Maps <ArrowUpRight size={14} /></a></div></div>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title"><div className="container"><div className="closing-card"><ToothMark className="closing-tooth" /><div><span className="eyebrow">ONE SMALL STEP. SO MUCH TO SMILE ABOUT.</span><h2 id="closing-title">Your next chapter?<br /><em>A healthier smile.</em></h2></div><div className="closing-actions"><button className="button button-white" onClick={() => bookVisit()}>Let’s book your visit <ArrowUpRight size={19} /></button><a href={clinic.phoneHref}><Phone size={16} /> {clinic.phone}</a><span>Here for you, all 7 days a week.</span></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Brand /><p>A little care. A lifetime of happy smiles.<br />Your neighbourhood dental clinic<br />in Signal Camp, Latur.</p><div className="footer-socials"><a href={chatUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with SARDA DENTAL CARE on WhatsApp"><WhatsAppMark /></a><a href={clinic.phoneHref} aria-label="Call SARDA DENTAL CARE"><Phone size={18} /></a><a href={clinic.maps} target="_blank" rel="noopener noreferrer" aria-label="Find SARDA DENTAL CARE on Google Maps"><MapPin size={19} /></a></div></div><div className="footer-column"><h3>Around the clinic</h3><a href="#about">About us</a><a href="#services">Explore dental care</a><a href="#reviews">Google reviews</a><a href="#faq">Your questions, answered</a><a href="#contact">Find us</a></div><div className="footer-column"><h3>Let’s care for your smile</h3>{services.slice(0, 4).map((service) => <button key={service.id} onClick={() => setModal({ type: 'service', service })}>{service.name}</button>)}<button onClick={() => bookVisit()}>Request an appointment <ArrowUpRight size={13} /></button></div><div className="footer-column footer-visit"><h3>Come say hello</h3><p>Near Shri Deshikendra High School Playground, Signal Camp,<br />Latur, Maharashtra — 413531</p><a href={clinic.phoneHref} className="footer-phone">{clinic.phone}</a><span>Mon–Sat · 10 AM–9 PM<br />Sunday · 10 AM–2 PM</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SARDA DENTAL CARE. All rights reserved.</span><span>Made for healthier, happier smiles. <Heart size={12} /></span><button onClick={() => setModal({ type: 'privacy' })}>Privacy notice</button></div><p className="footer-disclaimer">Clinic photographs were supplied for this website. Treatment images are illustrative, not SARDA patient results. Dental information is general; your dentist will confirm the care appropriate for you.</p></div></footer>

      <a className="floating-chat" href={chatUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with SARDA DENTAL CARE on WhatsApp"><span className="floating-chat-icon"><WhatsAppMark /></span><span>Let’s talk<span>on WhatsApp</span></span><ArrowUpRight size={16} className="chat-arrow" /></a>
      <div className="mobile-bottom-bar"><a href={clinic.phoneHref}><Phone size={18} /> Call the clinic</a><button onClick={() => bookVisit()}><CalendarDays size={18} /> Book a visit <ArrowUpRight size={15} /></button></div>

      {modal?.type === 'photo' && <Modal key="photo" label={modal.title} className="photo-modal" onClose={() => setModal(null)}><figure className="clinic-lightbox"><img src={modal.src} alt={modal.alt} /><figcaption><span className="eyebrow">{modal.title}</span><p>{modal.caption}</p></figcaption></figure></Modal>}
      {modal?.type === 'booking' && <Modal key="booking" label="Request an appointment at SARDA DENTAL CARE" className="booking-modal" onClose={() => setModal(null)}><span className="modal-eyebrow eyebrow">A LITTLE TIME FOR YOUR SMILE</span><AppointmentForm initialTreatment={modal.treatment} compact /></Modal>}
      {modal?.type === 'service' && <Modal key="service" label={`About ${modal.service.name}`} className="service-modal" onClose={() => setModal(null)}><span className="service-modal-icon"><TreatmentIcon type={modal.service.icon} /></span><span className="eyebrow">UNDERSTANDING YOUR OPTIONS</span><h2>{modal.service.name}</h2><p>{modal.service.detail}</p><ul>{modal.service.points.map((point) => <li key={point}><Check size={16} /> {point}</li>)}</ul><div className="service-modal-note"><ShieldCheck size={20} /><p>This is general dental information, not a confirmed service listing. The clinic will confirm availability, suitability, treatment details and fees.</p></div><button className="button button-primary" onClick={() => bookVisit(modal.service.name)}>Ask about this treatment <ArrowUpRight size={17} /></button><a className="service-modal-call" href={clinic.phoneHref}><Phone size={14} /> Or call {clinic.phone}</a></Modal>}
      {modal?.type === 'privacy' && <Modal key="privacy" label="Privacy notice" className="privacy-modal" onClose={() => setModal(null)}><ShieldCheck size={34} className="privacy-icon" /><span className="eyebrow">YOUR DETAILS, YOUR CHOICE</span><h2>A little note<br /><em>about privacy.</em></h2><p>The appointment form prepares a message in your browser. This website does not save appointment details to a server or submit them automatically.</p><p>When you choose “Send request on WhatsApp”, WhatsApp opens with your draft message. Nothing is sent to the clinic until you send the message yourself. WhatsApp’s privacy policy applies when you use that service.</p><p>The Google Maps embed and external Google links connect to Google. Google’s privacy policy applies to those services. Fonts and website images are hosted with this website. No analytics or advertising trackers have been added.</p><p>For questions about information you have shared directly with the clinic, call <a href={clinic.phoneHref}>{clinic.phone}</a>.</p></Modal>}
    </>
  );
}

export default App;
