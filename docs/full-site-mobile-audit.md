# Full website mobile and booking audit

Decision: APPROVED for publication, 21 November 2026. Reviewer: Codex applying Marketing Psychology Lab v1.0.0 criteria. This is a skill-based review, not an independent human endorsement or commercial uplift claim.

Scope: six public HTML pages (homepage, Legon, UPSA, Academic City, Adenta and room-information/privacy). Homepage sections: hero, live room comparison, About/tour, Campus Access, Facilities, dated rate guide, email enquiry, next steps, FAQ, booking, Contact/map, footer and fixed action controls.

## Findings and fixes

- Post-payment result previously had no bounded phone height and could hide actions. It now uses a scrollable 85dvh content area, wraps long references, has an accessible named modal dialog, initial focus, Tab containment, Escape and Close handling, and does not disappear after thirty seconds.
- Removed unsupported confirmation-email-within-24-hours and room-assignment promises. Payment response wording instructs the visitor to save the reference and confirm payment and booking with reception. A client callback alone is not independent verification of settlement or a reserved bed.
- Payment callback reset now recalculates the total and disabled state. Previously cleared fields could leave a stale total and active-looking button.
- Phone input now rejects letters, implausibly short/long numbers and invalid symbols, accepting local/international formatting with 7–15 digits. Error appears inline before any payment handoff.

## Evidence

- 42 automated checks passed, including API route behavior, booking/contact contracts, pricing, full/semester totals, privacy, FAQs/schema, image preservation, valid/invalid phone and email cases.
- Static graph: all 161 local links and asset references across six pages resolve; no missing fragments/files or duplicate IDs. Audit output in review/link-audit.json outside deployed source. External tel/mailto/WhatsApp/Maps link destinations inspected; no calls/messages placed. External service availability is outside this static link check.
- All six pages checked in browser at320px and390px; no horizontal overflow. Prior section reviews and this audit cover1280px desktop layout. Responsive viewport emulation, not physical handset testing.
- Mobile menu opens, navigation to Rooms closes it. Filters Premium + available show one of eight current rooms; reset restores all; Choose A101 preselects booking. Full-year live summary GHS11,000. Live feed initially eight rooms/eleven beds (snapshot only; availability changes).
- Empty and all-full fixture feeds disable payment, expose no selectable beds. Offline fixture clears live options, disables payment and offers retry. Retry with live feed restores eight room rows.
- All twelve gallery images loaded after expansion; tour metadata loads (readyState4), no autoplay. FAQ expands, map expands within phone width. Contact form empty submission focuses required Name. Room-information form empty submission focuses Email; marketing opt-in remains unchecked.
- Payment adapter simulated locally, with external Paystack script replaced only by an untracked QA server fixture. Full-year handoff GHS/1100000 minor units; second-semester GHS/550000; callback shows reference and resets room/total/payment availability. Invalid phone never reaches adapter.320px result dialog stays within viewport, scrolls, Close/Escape work. No QA fixture or test identity is in the deployed archive.

Limit: no live charge, paid booking, real enquiry/contact submission, email delivery or settlement verification was performed. Automated handler tests mock third-party delivery. Do not describe this audit as a completed real transaction or an unconditional guarantee of all external services.

## Marketing Psychology Lab review

Decision problem: Students/parents need to understand fit, total cost and uncertainty and safely reach reception or a payment handoff. The barrier is comprehension and operational clarity, not demonstrated insufficient motivation.

Models: Jobs to Be Done (choose accommodation that fits campus/living needs), cognitive load/Hick's law (scannable sections and clear totals), Fogg Behavior Model (accessible steps and useful errors).

| Observed evidence | Hypothesis/model | Mechanism and change | Measurement | Risks/alternative explanation |
|---|---|---|---|---|
| Payment result overstated email/assignment certainty | Accurate expectations support informed decisions; JTBD | Remove time/assignment promises; preserve reference and reception confirmation | Visitor comprehension and verified booking reconciliation | Reception operations and payment-provider behavior may dominate |
| Modal could exceed phone screen | Lower interaction effort; Fogg | Bounded scrollable dialog, keyboard Close/Escape, no automatic dismissal | Task completion saving reference and closing result | Simulated flow does not prove settlement |
| Stale totals after reset and letters accepted as phone | Clear state reduces confusion; cognitive load | Recalculate disabled state; actionable validation | Payment-handoff abandonment and valid qualified enquiries per eligible visits | Stricter phone validation may reject unusual local formats;7–15 digits allows common formats |

Three ranked approaches: (1) correct transactional copy/state, low effort/high clarity; (2) accessible payment result and field validation, moderate effort/high usability; (3) future supervised handset and sandbox-provider pilot, moderate effort/unknown commercial effect. First two implemented. No new data collection, tracking or opt-in defaults added. Payment non-refund terms, variable facility inclusions, non-reservation notices and independent commute checks remain visible.

Measurement plan: use consented baseline where available; measure qualified enquiries/completed verified bookings per eligible exposure, plus comprehension and task completion. No fabricated percentage uplift or causal inference. Operational delivery and settlement need separate live/sandbox verification before claiming full transaction success.
