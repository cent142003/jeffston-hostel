# Jeffston Court Hostel — room selection fix (17 October 2026)

## User report
A prospective student selecting a room on mobile reported: “Pls when I select the room / It doesn't show.”

## Reproduced on previous production
- After selecting A101 and the semester, the browser's visibility/60-second room refresh reset the selection to blank and cleared the payment amount (before: room-a101, 550000 pesewas; after: blank, 0).
- If the live Google room feed temporarily failed, the selector was disabled. After recovery the room options reappeared, but the selector remained disabled.
- The original website depended on Google Apps Script redirects/JSONP from the browser; that can be blocked intermittently by networks or privacy settings.

## Targeted fix
- Same-origin, read-only `/api/rooms` on Vercel proxies the existing Apps Script room feed, with no-store headers, 10-second timeout, strict success-response validation and a 503/empty-array fail-closed response. The original API remains as an explicit JSONP fallback.
- Preserve a user's selected room between refreshes and transient failures if it remains available.
- Avoid rebuilding native iOS selector options when the feed is unchanged.
- Re-enable the room selector on recovery; disable it and payment if the feed becomes unavailable or no rooms can be booked.
- If a room fills, clear the selection and amount, exclude its price from the bookable map and show an explanatory status.
- Show a visible selection summary and offer a retry button for failed loads. Ensure readable native mobile selects.
- Preserve all original Paystack, booking, room identifiers and semester-only fee logic; no real payment is simulated.

## Non-negotiable control
Pricing must always originate from the current hostel manager room feed, never from hardcoded fallback amounts. If the feed cannot be verified, checkout remains unavailable.

## Regression tests
`node --test tests/booking-room-selection.test.js`
- A: selection + updated rent preserved after refresh.
- B: failed feed blocks pay; manual retry works.
- C: sold-out room cancels the previous selection and payment.
- D: bridge handles valid and invalid upstream responses.
- E: tapping the actual room-table Book button selects room and displays amount.

## Deployment verification
Confirm on an authenticated Vercel preview before releasing: GET /api/rooms, room booking after slow/blocked feed, no missing assets or JS exceptions. Verify production without submitting a real Paystack payment.
