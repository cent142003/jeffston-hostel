# SEO Refresh Design — 2026–2027

**Approved scope:** both Jeffston Court Hostel and Jeffston Court Apartments. Only the hostel uses academic-year terminology.

## User-facing goal
Current 2026/2027 accommodation messaging, more qualified search discovery and trustworthy local information, without changing the design, bookings, live pricing or payments.

## Verified architecture and constraints
- Hostel public Vercel hostname is `https://jeffston-court-hostel.vercel.app/`; existing Github repository is `cent142003/jeffston-hostel`. A Netlify project deploys the same repository; custom `jeffstoncourthostel.com` had NXDOMAIN from both public resolvers on October 9, 2026. Never change canonical to broken domain.
- Hostel price and bed availability are loaded from the live Apps Script `?action=rooms` with JSONP fallback and checkout disabled if synchronisation fails. This invariant must remain unchanged.
- Apartments Vercel site `https://jeffston-court-apartments.vercel.app/` currently rewrites to `https://jeffston-court-apartments.cent142003.chatgpt.site/`. Its older `cent142003/jeffston-apt` repository is *not* the live site; the GitHub Pages URL returned 404. Preserve existing root, apartment room pages, enquiry forms and booking route by falling through to upstream.
- Site claims must be rooted in current pages and uploaded JCH materials; no fabricated prices, testimonials, guarantees about transport to Academic City or geographic distances.

## Hostel
- Update all 2025/2026 homepage, FAQ and campus landing text to 2026/2027.
- Replace hardcoded initial price/occupancy markup with skeleton placeholders. Keep live API hydration + Paystack logic.
- Remove stale structured Offer prices, stock, FAQ price claims and video price claims. Retain LodgingBusiness and address, map URL, identity and booking intent.
- Maintain canonical to currently resolved Vercel URL consistently across robots/sitemap and crawlable pages.
- Add distinct high-quality Adenta and Academic City student guide pages without promising an unverified shuttle route.
- Improve page title, descriptions, OG/Twitter, internal navigation, and search snippets without altering booking or structure.
- Preserve existing interactive IDs and accessibility.

## Apartments
- Preserve live Vercel-to-upstream external rewrite and active booking/payment behaviour.
- Add two genuinely useful local-information pages about short-stay/corporate accommodation near North Kaneshie; avoid fabricated rates or travel times.
- Add a local extra sitemap and robots reference without replacing upstream sitemap. Overlay must use filesystem before fallback rewrite and must be verified on an isolated preview; do not deploy if root behaviour differs from current production.

## Verification
Test first (fail before code), then syntax/content tests, preview server checks for current year, canonicals and 2 new pages; verify every live room/booking/button path and no unexpected re-routing. Publish only after preview is demonstrably safe.
