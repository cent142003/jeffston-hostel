# Jeffston Search & Answer Visibility Toolkit

Reusable skills and a read-only website audit, stored alongside the website source. No installed plugin, paid SEO service or automatic publishing is required. These are original Jeffston workflows informed by vetted public sources, not a redistribution of proprietary installed plugins or an execution of the REA binary engine.

## Use from ChatGPT, Codex or another compatible agent

Ask: “Read tools/seo-aeo/README.md in cent142003/jeffston-hostel on the seo-aeo-toolkit branch. Use jch-seo-audit and jch-performance-maintenance to audit the live site; show evidence and proposed fixes.”

For AI search: “Use jch-aeo-content to draft accurate answers for students comparing accommodation near Legon and UPSA.”

For reach: “Use jch-local-presence to inventory our business listings and prepare submissions for approval.”

Read the relevant skills/<name>/SKILL.md. No global install or third-party command runner is necessary. Skills require an agent with appropriate web/GitHub tools; GitHub stores them but does not itself act as an AI agent.

## Repeatable maintenance

Run `python3 tools/seo-aeo/scripts/audit_public.py` at repository root. It only GETs the public Jeffston homepage, four campus/location pages, robots.txt and sitemap.xml. JSON is printed to stdout. No account keys, student data or submissions.

The GitHub workflow provides manual and weekly read-only checks after this branch is merged into the default branch. Actions reports are not automatic SEO fixes. No website files or deployments are changed by the workflow. Review artifacts and open a small PR for each fix.

## What to measure

1. Search Console: indexed pages, impressions, clicks and query CTR (requires verified access; not set up by this toolkit).
2. Vercel: visitors and enquiry events, with verification traffic separated.
3. Manager: real enquiries and subsequent email-matched bookings; association is not causal attribution.
4. Monthly AI prompt sample: cited URLs and answer accuracy, recorded with date/platform/location. No guaranteed ranking.

## First improvement cycle

- Check index coverage and sitemap submission in Google Search Console and Bing Webmaster Tools.
- Verify business-profile ownership and consistent contact/location details.
- Improve existing campus pages with specific helpful information; do not mass-generate thin location pages.
- Draft truthful room, payment-period and transport FAQs with reception-confirmed information.
- Review field loading/interactivity/layout-shift data and test every enquiry CTA after changes.

Keep internal estimated end dates, private codes, enquiry identities and student records out of this repository and public content. See VETTING.md and sources.lock.json.
