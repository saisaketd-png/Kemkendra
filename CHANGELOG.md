# Changelog

All notable changes to the KemKendra B2B Chemical Marketplace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-11-25

### Major Milestone: Enterprise Sourcing, OWASP Hardening, Mobile-First UX & Core Web Vitals

Version 2.0.0 represents a major evolutionary milestone for KemKendra, establishing a hardened, production-ready enterprise B2B chemical trading infrastructure.

### Added
* **KemKendra Managed Sourcing Workflow:**
  * End-to-end custom sourcing request pipeline for specialty chemicals, bulk solvents, and unlisted APIs.
  * Multi-supplier quotation comparison, counter-proposal engine, and verified supplier matchmaking.
  * Flyway database migrations `V59`, `V60`, and `V61` supporting structured sourcing specifications and outreach tracking.
* **Modernized IndiaMART-Style Chemical UI:**
  * Clean, high-density chemical product cards with live 2D chemical molecular structure previews.
  * Volume tier selectors with automatic quantity calculation and instant quote triggers.
  * Sticky bottom action bar on mobile viewports for frictionless procurement requests.
* **Automated CI/CD Quality & Security Gates:**
  * `.github/workflows/security-gate.yml`: Automated Semgrep SAST and Trivy SCA vulnerability scanning on push/PR.
  * `.github/workflows/performance-audit.yml`: Automated Google Chrome Lighthouse CI performance gate enforcing Core Web Vitals ($LCP \le 2.5$s, $CLS \le 0.1$, $TBT \le 250$ms, Score $\ge 85$).

### Security & Hardening (OWASP Top 10:2025)
* **Authoritative Client IP Resolution:**
  * Introduced `ClientIpResolver` implementing RFC 7239 / right-to-left parsing of `X-Forwarded-For` against trusted proxies.
  * Neutralized header-injection spoofing across login rate limiting and identity controllers.
* **Access Control & Document Sandboxing:**
  * Scoped `/api/v1/documents/*/download` endpoint authorization, replacing blanket wildcard exposure.
  * Enforced attachment-only file serving with `Content-Security-Policy: sandbox` and `X-Content-Type-Options: nosniff`.
* **Resource Exhaustion & Concurrency Bounds:**
  * Configured bounded Spring Boot `taskExecutor` (4 core, 10 max, 2,000 capacity queue) with `DiscardOldestPolicy` to prevent OOM DoS under load.
  * Hardened Docker containers with `no-new-privileges:true` and suppressed server error stacktraces in production profiles.

### Performance & Core Web Vitals
* **Zero-CLS Font Metric Optimization:**
  * Preconnected Google Font origins and injected DNS prefetch headers in Next.js root layout.
  * Configured `adjustFontFallback: true` with explicit system fallbacks (`system-ui`, `-apple-system`, `BlinkMacSystemFont`) to eliminate font shift.
* **LCP Acceleration:**
  * Implemented `fetchPriority="high"` on hero product imagery with fixed aspect ratios to eliminate render delay.
* **Bundle Optimization & Tree-Shaking:**
  * Enabled `optimizePackageImports` for `lucide-react` and `date-fns`.
  * Dynamic code-splitting via `next/dynamic` for heavy client components (`RfqModal`, `SupplierOfferingModal`).

### Mobile & Tablet Ergonomics
* **Responsive Breakpoints:**
  * Implemented dedicated mobile-first architecture (`.agents/skills/mobile-first-design/SKILL.md`).
  * Converted desktop comparison tables into stacked card presentations on mobile (`< 768px`) with responsive layout preservation on tablets (`768px`–`1194px`).
* **Touch Ergonomics & Forms:**
  * Mobile modal bottom sheets with drag handles and non-dismissable backdrop tap safety.
  * Enforced minimum $44 \times 44$px touch targets across all interactive buttons and dropdowns.
  * Applied `inputMode="decimal"` and $\ge 16$px font size (`text-base sm:text-xs`) to prevent unwanted iOS Safari auto-zooming.

---

## [1.1.1] - 2026-11-20
* Catalog governance and offering review workflow unification.
* Asset pipeline enhancements and mixed-content URL sanitization.
* Supplier review sidebar routing fixes.

## [1.1.0] - 2026-11-15
* Analytics, reporting, marketing, SEO metadata, and product catalog enhancements.

## [1.0.0] - 2026-11-01
* Initial release of the KemKendra B2B Chemical Marketplace platform.
