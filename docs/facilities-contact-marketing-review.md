# Facilities and contact — Marketing Psychology Lab review

Status: APPROVED for publication under the installed Marketing Psychology Lab criteria. Reviewer: Codex applying marketing-psychology v1.0.0. This is a qualitative skill-based review, not independent human endorsement or a measured conversion result.

## Decision problem → customer barrier
Students and parents must establish which amenities apply to their room, choose a contact method and arrange a viewing. The former contact layout placed reception details, message form and map in three cramped columns. Promises of instant/faster responses were unverified. The form's optional phone status was not explicit.

## Evidence and models
| Observed fact | Hypothesis / model | Expected mechanism / implementation | Measurable test | Risks / alternatives |
|---|---|---|---|---|
| Current real room/lounge/kitchen photographs and room-specific features exist | Jobs to Be Done | Real photo-led cards distinguish spaces; clearly state included services vary | Visitors can identify spaces and questions to ask reception | Photography may not show the assigned room; don't imply every feature is included |
| Contact methods, form and map competed in three columns | Cognitive load / Hick's law | Direct reception actions first, two-column desktop and stacked phone layout, map disclosure | Observed successful contact-path task selection | Some visitors prefer map first; Get directions remains a visible direct link |
| Students need a low-friction enquiry before deciding | Fogg Behavior Model | Clear call/WhatsApp links, existing four-field form, phone explicitly optional, required labels and autocomplete | Qualified enquiries/viewings and response resolution | Reception responsiveness may matter more than presentation; do not promise a time |

## Three ranked approaches and implementation
1. Low effort / useful clarity: remove unsupported response-time wording, label optional phone, expose actual reception links. Implemented.
2. Moderate effort / useful presentation: real image-led facilities cards, explicit inclusions note, separate readable contact/form/map blocks with phone touch sizing. Implemented.
3. Higher effort / uncertain return: appointment scheduler, new CRM/chatbot, analytics and extra data collection. Deferred; not needed for this bounded change.

## Draft review and ethics
Stitch project 15819614152320041569 supplied the section design and DOM update direction. Real existing photos replace its placeholders. Keep actual phone +233201349321, email jeffstoncourthostel@gmail.com and Adenta location coordinates unchanged. No new reviews, urgency, hours, guarantees, fees or implied reservation. No new fields, required phone, marketing consent or tracking. Preserve native contact POST, Netlify receiver, honeypot, privacy handling, room feed and booking/payment behavior.

## Validation
36 automated checks pass, including routing with a mocked receiver, provider errors, form contract, optional phone, original iframe location, real assets, unchanged booking form, privacy and existing room behavior. Browser widths 320/390/1280: no horizontal overflow, 16px contact inputs, 50px input heights, call/WhatsApp actions above 50px, all three facilities images loaded. Map disclosure opens and closes; invalid empty name and invalid email prevent submission and focus the invalid field. No real messages, phone calls or payments made; end-to-end message delivery was not tested.

## Measurement and assumptions
No conversion baseline or uplift claimed. No tracking added. Reception can compare qualified enquiries, scheduled viewings and response resolution across comparable term dates, controlling for price, capacity and campaigns. If separately approved consented analytics becomes available, use completed qualified enquiries / eligible visits; do not confuse button clicks with successful delivery or bookings.
