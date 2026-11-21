# Rooms and booking — Marketing Psychology Lab review

Reviewer: Codex applying the installed Marketing Psychology Lab v1.0.0 skill. This is a qualitative skill-based review, not independent human endorsement or measured conversion uplift.
Status: APPROVED for release subject to final live smoke checks.

## Decision problem → customer barrier
Students and parents need to compare actual room types, understand per-semester pricing and select an appropriate period without assuming selection reserves a bed. The former gallery precedes the room table; "Book 3 spaces" can imply a multi-bed purchase, while the existing pricing flow selects one room/bed space without a quantity control. Contact details previously precede room selection.

## Evidence and models
| Observed fact | Hypothesis / model | Expected mechanism and implementation | Measurement | Risk / alternative |
|---|---|---|---|---|
| Eight live rooms, differing occupancy and status; full rooms cannot be chosen | Cognitive load / Hick's law | Room-type and availability filters, explicit occupancy and price units, touch-friendly cards, honest no-match/reset feedback | Observed task completion finding a suitable room | Filters may conceal alternatives, so All is the default and Reset is visible |
| Existing CTA said Book N spaces; no quantity choice is submitted | Jobs to Be Done | Use Choose room, show actual room/period/total before personal details, distinguish a selection from confirmation | Correct room/period selections and reception-confirmed bookings | Operational confirmation may be the bottleneck; don't claim instant reservation |
| Pricing unavailable must prevent payment; non-refundable policy matters before paying | Fogg Behavior Model | Clear summary, visible policy, WhatsApp help, recovery action, inline validation | Valid booking starts and unresolved validation errors, measured only with separately approved analytics | No induced urgency or presumed conversion improvement |

## Three approaches ranked by effort / impact
1. Low effort / useful clarity: accurate action wording, semester/full-year basis, selected-room summary and preserved confirmation policy. Implemented.
2. Moderate effort / useful navigation: combined filters, responsive cards, room-first form order and collapsed optional photo gallery. Implemented.
3. Higher effort / uncertain value: amenity filters, account login, booking wizard, automated marketing. Deferred; current feed/operations do not establish a need.

## Proposed change and review
Stitch supplied the room-card, filter and room-first booking direction in project 15819614152320041569. Rejected its fictional room examples and 2024/2025 year. Use only the existing live feed and academic-period options. No new personal fields, marketing consent, tracking, fees, reviews, guarantees or scarcity claims. Original Paystack processing, endpoints and amounts remain. The original contact and room-information contracts remain.

## Validation and measurement
33 automated checks pass. Phone browser tests: 390px and 320px without horizontal overflow; 50px input/select height, 16px type; combined Premium + available filter, reset, full-room disabled state, no-match feedback, semester and two-semester amounts, offline disabled payment and explicit retry, all-full waitlist-only state, empty inventory. Preview blocks external form submissions; no real bookings/payments/messages are sent. Inline validation tested with empty contact details: three field errors shown, focus moved to fullName, and no payment screen opened. Gallery disclosure and next-photo control tested. Desktop 1280px has a two-column booking layout with no horizontal overflow. Final live smoke test follows publishing.

No analytics was added. Assess qualified enquiries and reception-confirmed bookings against comparable academic periods, considering occupancy, price and response time. With adequate consented data later, compare completed desired actions / eligible exposures; no fabricated baseline or uplift percentage.
