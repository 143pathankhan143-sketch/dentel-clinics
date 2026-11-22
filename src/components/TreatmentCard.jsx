import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import './TreatmentCard.css';

export default function TreatmentCard({ service, onExplore }) {
  const [flipped, setFlipped] = useState(false);
  const panelId = useId();
  const frontButton = useRef(null);
  const backHeading = useRef(null);
  const interacted = useRef(false);

  useEffect(() => {
    if (!interacted.current) return;
    const frame = requestAnimationFrame(() => {
      (flipped ? backHeading.current : frontButton.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [flipped]);

  function flip(value) {
    interacted.current = true;
    setFlipped(value);
  }

  return (
    <article
      className={`treatment-card treatment-${service.theme} ${flipped ? 'is-flipped' : ''}`}
      aria-label={`${service.name} treatment card`}
      data-service-card
      data-service-id={service.id}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && flipped) {
          event.stopPropagation();
          flip(false);
        }
      }}
    >
      <div className="treatment-card-inner">
        <div className="treatment-front" aria-hidden={flipped} inert={flipped ? true : undefined}>
          <div className="treatment-photo">
            <img src={service.image} alt={service.imageAlt} width="800" height="460" loading="lazy" decoding="async" />
            <span className="treatment-photo-shade" aria-hidden="true" />
            <span className="treatment-label">{service.typeLabel}</span>
            <span className="treatment-number" aria-hidden="true">{service.number}</span>
            <span className="treatment-emoji" aria-hidden="true">{service.emoji}</span>
          </div>
          <div className="treatment-front-copy">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <button
              ref={frontButton}
              type="button"
              className="treatment-flip-button"
              aria-label={`Explore ${service.name}`}
              aria-expanded={flipped}
              aria-controls={panelId}
              onClick={() => flip(true)}
            >
              <span>Flip to explore</span>
              <span className="treatment-flip-icon"><RotateCcw size={16} strokeWidth={1.6} /></span>
            </button>
          </div>
        </div>

        <div id={panelId} className="treatment-back" aria-hidden={!flipped} inert={!flipped ? true : undefined}>
          <div className="treatment-back-top">
            <span className="treatment-label treatment-label-outline">{service.typeLabel}</span>
            <button type="button" className="treatment-return" onClick={() => flip(false)} aria-label={`Show ${service.name} overview`}>
              <ArrowLeft size={15} /><span>Back</span>
            </button>
          </div>
          <h3 ref={backHeading} tabIndex={-1}>{service.name}</h3>
          <p className="treatment-back-summary">{service.backSummary}</p>
          <dl className="treatment-metrics">
            {service.metrics.map((metric) => (
              <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>
            ))}
          </dl>
          <div className="treatment-tags" role="group" aria-label="What to discuss">
            {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <p className="treatment-individual-note">Your dentist will confirm suitability and your individual care plan.</p>
          <button type="button" className="treatment-learn-button" onClick={() => onExplore(service)} aria-label={`Learn about ${service.name}`}>
            Learn more <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
