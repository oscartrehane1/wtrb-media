# 0005 — Blob project catalogue and publication checks

Status: implemented locally, pending review.

Use a strict, plain-text JSON manifest at one canonical pathname per slug. Only a valid published manifest can populate the homepage, portfolio index, sitemap and dynamic case-study route. Avoid a separate CMS, database, webhook or upload UI. Keep the existing private store and SDK-managed OIDC.

Cache the bounded catalogue and legacy root lookup for 60 seconds; homepage, listing and sitemap also revalidate every 60 seconds. Discover new slugs at runtime. Case-study HTML and scoped asset GET/HEAD check the current manifest with an uncached Blob read. The scoped route can read only a validated exact object pathname and reuses the existing media streaming handlers. Images served by publication-gated routes bypass the Next image optimiser, including the optimiser's public URL allowlist; thumbnails are still lazy-loaded. This trades server-side resizing for the ability to withdraw future image requests promptly.

Oslo is the sole migration exception: absent a manifest, use the existing authored record and root `work-01` media. A valid published manifest can override editorial metadata and use the old uploads for categories with no new scoped assets. A draft or invalid Oslo manifest disables the page and the application’s legacy Oslo media routes. Retain the draft file to keep Oslo unpublished. No live media moves are required. Already downloaded media and copies cached externally cannot be recalled.
