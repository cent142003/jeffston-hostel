# 2026–2027 Jeffston SEO Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL superpowers:executing-plans. TDD for each component.

**Goal:** Make hostel information current and improve organic discovery across both properties without changing room or payment truth.

**Architecture:** Two independent repository branches. Hostel ships from the GitHub source consumed by Netlify and Vercel; apartments use a Vercel static overlay with an explicit filesystem-first fallback to the existing live app.

**Tech Stack:** HTML/CSS, vanilla JS, Node built-in test, sitemap XML, Vercel static routing.

**Spec:** docs/superpowers/specs/2026-10-09-jeffston-seo-design.md

## Global constraints
- Canonical hostel: https://jeffston-court-hostel.vercel.app/ until custom-domain DNS is operational.
- Canonical apartments: https://jeffston-court-apartments.vercel.app/.
- Never add static student inventory, price figures or academic-city transport promises.
- Preserve working Paystack, live room API, sign-up forms and external apartment root.

## Review focus
1. API down: pay remains disabled; no old prices seen.
2. Academic City: no unsupported shuttle guarantee.
3. Canonicals/sitemap paths: all crawlable pages match resolved hostnames.
4. Apartment root: new preview renders same booking interface as live.
5. Routing: no unintentional interception of original 2-/3-bedroom pages.

### Task 1 Hostel SEO and season
- [ ] Write failing tests in `tests/seo.test.js`; see assertions about year, canonicals, stale inventory, metadata and booking integrations.
- [ ] Run `node --test tests/seo.test.js`; expect failures before change.
- [ ] Update `index.html`, campus guides, and `scripts.js` minimally.
- [ ] Run tests to green and validate JSON-LD.
- [ ] Add sitemap/robots including new guide pages.
- [ ] Rerun and verify no booking regression.

### Task 2 Apartments SEO overlay
- [ ] Write failing tests in `tests/seo-overlay.test.js` for routes, two useful pages, sitemap and canonical.
- [ ] Run `node --test tests/seo-overlay.test.js`; expect failures before change.
- [ ] Add `vercel-seo-overlay/` files and no index.html.
- [ ] Run tests to green and validate routes.

### Task 3 Previews and release
- [ ] Publish branches and preview deployments without modifying production.
- [ ] Compare returned preview homepage and booking flow with current prod; test SEO landing paths and duplicate URL signals.
- [ ] Only after green preview, publish approved changes and confirm live HTTP response; otherwise leave production alone with clear blockers.
- [ ] Report changed functions/IDs, hosts, checks, and any domain DNS block.
