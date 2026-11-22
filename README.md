# SARDA DENTAL CARE

A responsive dental-clinic website for **SARDA DENTAL CARE, Signal Camp, Latur**. Built with React, Vite, local fonts, custom SVG artwork, and an optimized hero photograph.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development server binds to `0.0.0.0:5173` and permits the Arena preview host.

## Build and deploy

```sh
npm run build
npm run preview
```

### Live on GitHub Pages (automatic)

This repository includes `.github/workflows/deploy.yml`. Every push to `main` builds the site and publishes it to:

**https://143pathankhan143-sketch.github.io/dentel-clinics/**

One-time setting: GitHub repo → **Settings → Pages → Source: GitHub Actions**. You can also redeploy manually from the **Actions** tab → *Deploy website to GitHub Pages* → **Run workflow**.

### Other hosts (Netlify / Vercel / Cloudflare Pages)

Import the repo and use build command `npm run build` with output directory `dist`. Because `vite.config.js` uses `base: './'`, the build works at a domain root or in a sub-folder.

Deploy the contents of **`dist/`** to any static web host. No database, API key, server, environment variables, or paid service is required for the current appointment-request flow. No site has been published to a production domain.

For a clinic-owned domain, set a real canonical URL and absolute social-sharing image URL in `index.html` before going live. There is deliberately no invented website URL in the SEO metadata.

## Included

- Responsive header, accessible mobile menu, mobile call/booking bar, floating WhatsApp link.
- Supplied clinic photographs, full-size photo lightboxes, seven filterable photo-backed 3D treatment flip cards, treatment-information dialogs, clinician text from the supplied clinic sign, about section, appointment steps, Google-rating summary, FAQ accordion, contact information, map, and footer.
- Click-to-call, correct WhatsApp destination, Google listing link, and coordinate-based directions.
- Appointment-request form with name/mobile validation, India Standard Time, a 90-day booking-request horizon, Sunday-only morning/midday windows, expired-window filtering, and a review step.
- Native, keyboard-accessible dialogs; focus return; Escape support; reduced-motion support; skip link; labelled inputs.
- Local fonts, a roughly 81 KB WebP hero image, and no analytics or advertising trackers.

## How appointment requests work

1. A visitor enters their details and preferred date/time.
2. The browser validates the form and shows a request summary.
3. The visitor chooses **Send request on WhatsApp**.
4. WhatsApp opens a prefilled draft to **+91 70207 51388**. The visitor must send it themselves.
5. **The clinic must confirm the appointment.** The website does not claim the visit is booked.

Form data stays in page memory. It is not stored in a database, local storage, or a backend. Copy Request uses the browser clipboard when available. Google Maps and WhatsApp are external services with their own privacy policies.

A true real-time appointment calendar, SMS reminders, admin dashboard, email delivery, or patient-record system would require a separate backend and clinic approval. Those integrations are not represented as implemented.

## Business details and verification

Business information was supplied in the project brief; it was not independently fetched from Google Places during this build. The referenced `data/leads.json` was not present in this workspace.

- Name: SARDA DENTAL CARE
- Phone: +91 70207 51388
- Address: Near Shri Deshikendra High School Playground, Signal Camp, Latur, Maharashtra 413531
- Coordinates: 18.3971121, 76.5697103
- Google listing CID: `3344108636029607667` (a CID, not an API Place ID)
- Hours: Monday–Saturday 10:00 AM–9:00 PM; Sunday 10:00 AM–2:00 PM
- Supplied Google snapshot: 5.0 / 101 reviews; all 101 are five-star

The supplied clinic-sign photograph additionally displays **Dr. Nishant Sarda — MDS (Gold Medal), Root Canal and Smile Designing**, and **Dr. Prerana Sarda — MDS, Gum Surgery and Implant Specialist**. The on-page text follows this sign, not facial identification or an independent registration check. The people in the supplied portrait have not been named or individually identified.

The schedule amounts to **70 listed hours/week**, not 66: six 11-hour days plus four hours on Sunday. The website avoids an hours/week claim.

### Confirm before a public launch

- Clinic-owner approval of the branding, website copy, contact number and Google rating snapshot.
- Confirm the clinician names/qualifications transcribed from the supplied sign, current registration details, photo-use permissions, actual facilities and establishment year. No identities have been assigned to the people in the portrait.
- Actual treatment list, consultation fees, and any special holiday hours.
- Whether this number supports WhatsApp and which team member will handle requests.
- Confirm reuse rights for the generic treatment photographs from the supplied reference, or replace them with clinic-owned/licensed treatment photographs.

No doctor names, qualifications, treatment prices, business revenue, patient totals, years of experience, equipment claims, consultation offers, or fabricated testimonial quotes have been invented. General dental treatments are clearly marked as informational; availability and suitability must be confirmed with the clinic. Do not remove that caveat until the service list is verified.

## Edit content

- `src/data/clinic.js`: contact data, general dental-treatment information, FAQ content.
- `src/App.jsx`: page sections, navigation, dialogs and business presentation.
- `src/components/AppointmentForm.jsx`: form and request-review UI.
- `src/components/TreatmentCard.jsx` and `TreatmentCard.css`: seven photo-backed, colour-coded front/back cards and keyboard/touch interactions.
- `src/components/ClinicMedia.css`: supplied photo presentation, clinician text cards and full-size lightboxes.
- `src/lib/appointments.js`: dates, India timezone, phone validation, time windows, WhatsApp message builder.
- `src/styles.css`: local font declarations, color palette, desktop/mobile styles.
- `index.html`: title, metadata and factual Dentist structured data. Keep contact/hours changes consistent with this file.

Google rating totals are a static snapshot, not a live Google Places integration. They are deliberately not embedded in aggregate-rating structured data. Update the visible counts when the clinic provides a current snapshot.

## Design and assets

- User-supplied reference: https://www.kodgidentalclinic.com/
- The reference informs the blue/white dental-care layout and booking-led structure. This implementation has original SARDA branding, copy and SVG elements; it does not reuse the reference clinic's logo, doctor photographs, credentials or patient videos.
- `public/images/clinic/clinic-portrait.webp`: crop/WebP conversion of the supplied `download.jpg`. No facial retouching or identity assignment has been performed. A full-size version opens in a keyboard-accessible lightbox.
- `public/images/clinic/clinic-exterior.webp`: crop/WebP conversion of the supplied `download-2.jpg`. The full photograph, including the clinic sign, is available in its lightbox.
- Original supplied photographs are preserved in this workspace under `uploads/` and `design-source/client-photos/`.
- `public/images/treatments/`: optimized versions of the generic treatment photographs used in the user-supplied reference. Sources: `https://www.kodgidentalclinic.com/images/implant.jpg`, `rootcanal.jpeg`, `braces.jpeg`, `whitening.jpg`, `extraction.jpg`, `cleaning.jpg`, `denture.jpg` (all under that same `/images/` directory). These are illustrative assets, not SARDA patient photographs or evidence of guaranteed outcomes. Source notes are saved in `design-source/photo-update-sources.json`.
- The uploaded front/back screenshots guide the colour-coded card design. Flip controls work by click, touch and keyboard; inactive faces are inert, Escape flips back, and Learn More opens a treatment enquiry.
- Fixed claims such as eight shades of whitening, a 15-year lifespan, instant pain relief or exact recovery times have not been copied. The cards instead show informational care focuses, discussion topics and individual-assessment notes.
- The footer distinguishes supplied clinic photographs from illustrative treatment photographs. Previous prototype stock/AI images are archived outside `public/` and are no longer rendered.
- DM Sans and Playfair Display: locally hosted Google Fonts, SIL Open Font License. License files are in `public/fonts/`.
- Icons: Lucide (ISC); original tooth/treatment/brand SVGs; Google/WhatsApp marks identify the linked services and do not imply affiliation.

## Checks

```sh
npx playwright install chromium
# On a minimal Linux image, also run: npx playwright install-deps chromium
npm run dev
# In another terminal:
node .qa/validate.mjs
node .qa/photo-update.mjs
```

The base suite covers business details, treatment filters, enquiry preselection, form errors, Sunday hours, unsent WhatsApp drafts, FAQ behavior, privacy dialog, mobile navigation, overflow at six widths, browser runtime errors, and WCAG 2.1 AA rules checked by axe on desktop/mobile. The photo-update suite additionally covers the supplied photos, sign-transcribed clinician text, all seven flip controls, Escape/focus handling, filter reset, both full-size photo dialogs, all card backs on desktop/mobile, metric overflow at seven widths, and the absence of copied fixed-result guarantees. Third-party Google Maps iframe content is excluded from the accessibility scan. Automated checks do not constitute a complete manual accessibility certification.

No test sends a WhatsApp message, places a call, books a real appointment, or submits patient information to an external service.
