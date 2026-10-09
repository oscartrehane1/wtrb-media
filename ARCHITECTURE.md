# WtRB Media — Proposed Architecture and Delivery Plan

Status: **proposal for review; no website implementation has started**.

## Architecture

Use a single Next.js App Router application deployed to Vercel. The page itself should be mostly server-rendered, with small client islands for navigation state, media playback, the photography carousel, motion, and progressive form feedback.

Portfolio content should live in typed TypeScript data modules. This keeps the first release simple, version-controlled, and quick to update without coupling the UI to a future CMS. Media records should carry title, slug, client, category, year, description, aspect ratio, poster, sources, accessibility text, and featured placement. If a CMS is introduced later, this data boundary can be replaced without redesigning section components.

The enquiry flow should use a same-origin server endpoint (or Server Action if it gives a cleaner progressive-enhancement path), a shared schema, authoritative server validation, spam controls, and a server-only delivery adapter. The adapter can initially report that delivery is not configured, then connect to the selected email provider without changing the form contract.

```text
Browser
  -> server-rendered single page
     -> typed local portfolio and site content
     -> small client islands (carousel, video, motion, form state)
  -> enquiry endpoint/action
     -> validation + anti-spam + rate limit
     -> email adapter (provider selected later)
```

## Component and folder structure

```text
src/
  app/
    api/enquiries/route.ts   # secure server boundary, if route-handler approach is chosen
    globals.css              # reset, tokens, global typography, focus and motion rules
    layout.tsx               # fonts, metadata shell, structured data
    page.tsx                 # semantic section composition
    manifest.ts
    robots.ts
    sitemap.ts
  components/
    layout/                  # site header, navigation, footer, page container
    sections/                # hero, selected work, photography, services, about, contact
    media/                   # responsive video, project media, carousel and poster behaviour
    forms/                   # enquiry form and field primitives
    ui/                      # buttons, links, headings, labels and small reusable primitives
  content/                   # typed, editable business and portfolio records
  lib/
    validation/              # shared enquiry schema
    seo/                     # structured data and metadata helpers
    utils/                   # narrow framework-independent helpers
  types/                     # shared domain types
docs/
  decisions/                 # concise ADRs for decisions made during implementation
public/
  media/                     # lightweight placeholders, posters and approved web assets
```

## Visual design system

### Foundations

- Colour: ink black, layered charcoal, warm off-white, and restrained stone-grey text. No fixed brand accent is proposed; photography and film remain the dominant colour.
- Type: one expressive editorial display family plus one neutral, highly legible sans-serif. Use variable fonts and self-host through `next/font` where licensing allows.
- Scale: fluid type and spacing using `clamp()` so the composition changes smoothly rather than jumping between many breakpoints.
- Grid: a 12-column wide-screen editorial grid, 6-column tablet grid, and 4-column mobile grid with consistent outer gutters.
- Shape: minimal radius; media can use a subtle radius only where it improves layering or touch affordance.
- Motion: short, quiet UI transitions and slower editorial reveals. Use opacity, crop/mask, and small transforms; disable nonessential movement for reduced-motion users.

### Key patterns

- Hero: viewport-filling muted loop with mobile/desktop sources, strong poster fallback, compact positioning copy, and two calls to action (“View selected work” and “Start a project”).
- Work: asymmetric editorial sequence rather than a masonry or card grid. Each project preserves its authored ratio and includes accessible text context outside the video.
- Photography: edge-to-edge scroll-snap track enhanced with explicit previous/next controls and position feedback. The base experience remains usable without JavaScript.
- Services: typographic capability list with concise supporting copy, avoiding boxed feature cards.
- Contact: spacious, direct form with visible labels, helpful option wording, field-level errors, success/error focus management, and a clear privacy note.

## Implementation phases

### Phase 0 — Decisions and content inventory

Confirm the open decisions below, collect brand assets and copy, define project/photo records, and establish the production-media handoff. Output: approved creative direction and content matrix.

### Phase 1 — Foundation

Scaffold Next.js, TypeScript, Tailwind, Motion, linting/formatting, test baseline, fonts, global tokens, metadata shell, and the typed content model. Output: accessible structural page with designed placeholders only.

### Phase 2 — Core sections and responsive layout

Build header, hero, Selected Work editorial layout, Services, About, Contact shell, and Footer. Validate layout from small mobile to large desktop before adding rich interaction.

### Phase 3 — Media experience

Implement responsive hero sources and fallback, lazy portfolio playback, aspect-ratio handling, photography carousel, loading states, reduced motion, and media error handling. Test with realistic compressed stand-ins before final media arrives.

### Phase 4 — Enquiry pipeline

Add shared validation, server handling, honeypot, accessible feedback, rate limiting, provider adapter, environment documentation, and the approved email delivery service.

### Phase 5 — Content, SEO, legal and analytics

Replace placeholders with approved media/copy, finish metadata and structured data, add privacy/legal destinations, connect approved social details, and add privacy-respecting analytics only if requested.

### Phase 6 — Quality assurance and launch

Complete cross-browser/device, keyboard, screen-reader, reduced-motion, autoplay-failure, performance, security, metadata, and form-delivery checks. Configure Vercel environments and domain, then launch with monitoring and a rollback path.

## Decisions needed before development

The following are blockers for final production choices, but not for an initial structural prototype:

1. **Brand assets and typography:** Is there an existing logo/wordmark, brand guide, or licensed typeface? If not, approve a proposed type pairing before visual implementation.
2. **Creative direction:** Choose whether the tone should lean more rugged/documentary, refined/luxury, or a calibrated midpoint.
3. **Portfolio content model:** Confirm the initial films, their aspect ratios, client/project descriptions, ordering, and whether project detail overlays/pages are in scope. The brief currently specifies a single page, so the recommendation is inline details or a focused modal—not separate project pages in v1.
4. **Video delivery:** Confirm the likely host (for example Mux, Vimeo, Cloudflare Stream, or direct CDN assets). The recommendation is a streaming provider for portfolio films and carefully compressed direct files only for short decorative hero loops.
5. **Photography interaction:** Confirm whether manual editorial browsing is preferred over autoplay. The recommendation is manual scroll-snap navigation with no automatic slide advance.
6. **Enquiry operations:** Choose the delivery provider, recipient address, budget bands, project types, timeline options, retention policy, and desired acknowledgement behaviour.
7. **Business details:** Supply registered/trading address as appropriate, email, phone if public, social profiles, company registration details if applicable, and approved legal/privacy copy.
8. **Analytics and consent:** Decide whether analytics are required. The recommendation is privacy-first, cookieless analytics or no analytics at launch unless there is a concrete measurement plan.
9. **Hosting access:** Confirm the GitHub repository/branch workflow and Vercel project ownership before deployment work.

## Acceptance criteria for the first implemented release

- The single page communicates specialist outdoor production positioning within the first viewport.
- Portfolio and photography content can be updated without editing presentation components.
- Media gracefully handles mobile sources, loading, autoplay rejection, missing sources, and reduced motion.
- The full page is keyboard accessible, responsive, and semantically structured.
- Enquiries are authoritatively validated and securely delivered without exposing provider secrets or personal data in logs.
- Production Core Web Vitals are in the good range on representative devices and connections.
- Metadata, structured data, sitemap, robots, social previews, privacy information, and truthful contact states are present.
