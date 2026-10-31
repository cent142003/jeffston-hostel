# Vetting decisions — 31 October 2026

Method: REA CLOUD_SOURCE_REVIEW and CLOUD_PUBLIC_OBSERVATION; no native reverse engineering. Skill Finder & Vetting used for discovery, source provenance and static scanning. This is one-agent review, not independent multi-agent certification.

Selected reference: coreyhaines31/marketingskills — seo-audit, ai-seo and site-architecture. Exact source commit in sources.lock.json. MIT licence inspected (copyright Corey Haines 2025). All 33 files in these selected subtrees plus licence downloaded for inspection; heuristic scan flagged eight review signals, zero high-severity signals. Full references were not individually validated for SEO accuracy; do not interpret this as a security guarantee.

Decision: bundle original constrained Jeffston skills, not the entire upstream executable/instruction package. Upstream optional npx tooling was not executed or bundled. seo-audit curl warnings concern static-vs-rendered schema limitations, not malware. ai-seo recommends optional third-party agent tools and llms.txt; those recommendations are not adopted as requirements. Google explicitly says no special AI text files or schema are needed for its AI search features. Platform-specific ranking claims require fresh primary evidence.

Alternatives: thecraighewitt/seomachine and mengto/skills seo-audit listings identify the same original source; not included because redundant provenance does not add independent evidence. No install-count popularity score used as a safety guarantee.

No third-party scripts, hooks, auto-updaters, credentials, telemetry collectors or paid-service integrations are included. Original audit helper uses Python standard library, fixed public host/path list, bounded response size, timeouts and same-host redirects. Workflow has read-only repository permission. Static audit cannot prove Google indexation, rendered structured data, mobile Core Web Vitals, conversions or AI citations.

No backlinks, listings, mass emails, reviews, domain changes or live website edits are performed by this bundle. Expansion means useful content and legitimate discoverability, not spam or doorway pages.

Sources: https://skills.sh/coreyhaines31/marketingskills/seo-audit ; https://skills.sh/coreyhaines31/marketingskills/ai-seo ; https://github.com/coreyhaines31/marketingskills ; https://developers.google.com/search/docs/appearance/ai-features ; https://developers.google.com/search/docs/essentials/spam-policies
