# Jeffston Court Hostel homepage review

Applied skill: Marketing Psychology Lab (marketing-psychology, v1.0.0).
Reviewer: Codex applying the installed skill; this is not independent human endorsement.
Status: APPROVED for publication under the Marketing Psychology Lab skill criteria. Final review performed by Codex applying the skill, not an independent reviewer.

## Decision problem and customer barrier
Students and parents must compare accommodation, establish what is included, and contact reception or select an available room. The current page leads with the property name and a direct booking action, then a long about section before room comparison. Uncertainty about room fit, costs and booking conditions is a plausible barrier. There is no conversion baseline establishing it as the principal cause of lost enquiries.

## Evidence and hypotheses
| Observed fact | Hypothesis / model | Mechanism and implementation | Measurable test | Risks / alternatives |
|---|---|---|---|---|
| Live room table includes prices and remaining beds; hero currently asks visitors to book | Jobs to Be Done | Lead with student living, room comparison and inspection. Keep real room photos | Completed qualified enquiries / eligible visits; reception-confirmed viewings | Visitors may already know the hostel and prefer immediate booking; keep booking accessible |
| Navigation has seven choices and long introductory copy precedes rooms | Cognitive load / Hick's law | Shorten primary navigation, move room comparison immediately after hero, retain detailed sections lower down | Room-table engagement and booking starts; observe mobile task completion | Less prominence for campus pages may harm some journeys; retain all guide links |
| Non-refundable payments and variable facilities require confirmation | Fogg Behavior Model | Present one primary CTA, a low-friction viewing option, and clear confirmation steps before payment | Confirmed viewing requests, valid bookings, incomplete/invalid requests | Contact operations may be the actual bottleneck; monitor response time |

## Three approaches, ranked by effort versus impact
1. Low effort: clear room-comparison CTA, viewing option and concise factual copy. Selected.
2. Moderate effort: image-led hierarchy and rooms-first page order, accessible controls and mobile layout. Selected.
3. Higher effort: new recommendation wizard or experiments requiring analytics/operations changes. Deferred; no extra data collection needed for this redesign.

## Proposed change
Use Stitch's responsive concept as visual direction, real existing hostel photography, current room table and existing forms. Keep live values dynamic. Clearly label dated rate guide. Maintain optional unchecked marketing consent, non-refundable policy and reception contact. No fabricated reviews, pricing, commute durations, scarcity or service guarantees.

## Measurement plan
No uplift claim. Existing optional analytics on Sites are disabled; do not introduce tracking. Reception can compare qualified viewing/enquiry and confirmed booking totals over comparable periods, noting term dates, capacity, prices and campaign changes as confounders. If consented analytics is separately enabled later, define completed qualified enquiries / eligible exposures and test honest variants with adequate samples.

## Final approval criteria
- Original live room, booking, payment, contact and email consent contracts preserved.
- Room prices/counts come from existing live data or explicitly dated reference.
- Real photos, readable contrast, keyboard focus, mobile fit.
- No invented urgency, testimonials, guarantees or fees.
- No new collection or automatic marketing opt-in.

## Final review and validation
Stitch generated the visual concept in project 15819614152320041569. Rejected speculative desk hours, utility policies, single-room claims and unverified institutional language. Implemented the editorial split hero, restrained navy/green identity, rooms-first hierarchy, real existing photos, direct viewing link and clear booking steps. All original form markup and live hooks remain.

30 automated tests passed, including API failure behavior, contact routing, privacy, live room contract, form preservation, anchors, image existence and approved-source boundaries. Browser checks at desktop and 390px mobile: no page overflow, real hero image loaded, eight live rows, nine booking options, A101 selection populated roomType, menu opens and closes, consent unchecked. No real booking, message or payment submitted. This is a qualitative approval, not a conversion uplift claim.
