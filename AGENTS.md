# WtRB Media — Project Instructions

## Project context

WtRB Media is a UK-based specialist outdoor film and photography production company. The website's job is to showcase cinematic work, establish credibility with commercial clients, and generate qualified enquiries from brands, agencies, tourism organisations, hospitality businesses, and conservation organisations.

- Business: WtRB Media
- Domain: `wtrbmedia.co.uk`
- Tagline: **Stories Made Outside.**
- Positioning: a premium, capable, full-service production company—not a general-purpose freelance videographer
- Primary environments: mountains, coastlines, forests, oceans, and remote landscapes
- Initial product: a single-page marketing and portfolio website with no database or CMS

## Product principles

1. Let the work provide the colour and visual drama.
2. Use restrained, editorial layouts rather than generic cards or uniform grids.
3. Prioritise qualified commercial enquiries over vanity interactions.
4. Make every experience work exceptionally well on mobile, keyboard, touch, and reduced-motion settings.
5. Keep portfolio content easy to update through typed local data files.
6. Treat performance, accessibility, security, and SEO as baseline requirements.

## Required page sections

The single page should contain, in order:

1. Header/navigation
2. Hero with separate desktop/mobile background video, headline, positioning copy, and calls to action
3. Selected Work with an editorial mixture of 16:9, 9:16, 1:1, and 4:5 projects
4. Photography with an immersive responsive carousel
5. Services describing end-to-end production capability
6. About describing the outdoor specialism and authentic storytelling approach
7. Contact with a professionally qualified enquiry form
8. Footer with business information, social links, contact details, and legal links

## Design direction

- Mood: cinematic, premium, contemporary, minimalist, confident, and grounded
- Palette: near-black/charcoal surfaces, off-white type, muted secondary text; media supplies accent colour
- Typography: large editorial display type paired with a highly legible sans-serif UI/body face
- Composition: generous negative space, full-bleed media, asymmetric editorial rhythm, strong hierarchy
- Motion: subtle and purposeful; prefer opacity, masking, and restrained transforms
- Avoid: stock imagery, ornamental gradients, glassmorphism, decorative cards, excessive borders, generic template sections, and gratuitous animation
- Placeholders must be deliberately designed and clearly replaceable; never introduce stock photography

### Approved brand identity

- WtRB Media is the commercially focused sister brand of Where the Road Bends Adventures.
- Use the primarily typographic wordmark **WtRB MEDIA**. Do not recreate or approximate the Adventures mountain-and-road illustration; original vector assets will be supplied later.
- Reserve a small secondary-brand-mark position in the footer.
- Major headlines and editorial statements use Playfair Display.
- Navigation, body copy, buttons, metadata, and forms use Inter.
- Approved palette: Obsidian `#101312`, Charcoal `#252B2A`, Ivory `#F3F0E9`, Sage grey `#87918A`, and Stone `#B1A08C`.
- Keep the experience overwhelmingly monochromatic; commissioned film and photography provide colour.
- The approved creative tone is sophisticated, editorial, minimalist, and commercially focused while retaining an outdoors-rooted character.

## Technical baseline

- Next.js App Router with TypeScript
- Tailwind CSS
- Motion for React for interaction and entrance motion
- Vercel deployment target
- Server Components by default; add `"use client"` only at the smallest interactive boundary
- Use Next.js metadata APIs, `next/image`, `next/font`, route handlers or Server Actions where appropriate
- Keep dependencies minimal and justify additions
- Do not add a database or CMS for the initial release

## Proposed structure

```text
src/
  app/
    api/enquiries/route.ts
    layout.tsx
    page.tsx
    globals.css
    manifest.ts
    robots.ts
    sitemap.ts
  components/
    layout/
    sections/
    media/
    forms/
    ui/
  content/
    projects.ts
    photography.ts
    services.ts
    site.ts
  lib/
    validation/
    seo/
    utils/
  types/
public/
  media/
    placeholders/
    posters/
    photography/
```

Keep section composition in `components/sections`, reusable primitives in `components/ui`, media-specific behaviour in `components/media`, and content separate from presentation in typed modules under `content`.

## Coding conventions

- Enable TypeScript strict mode; do not use `any` without a documented reason.
- Prefer named exports except where Next.js requires a default export.
- Use semantic HTML before ARIA. Preserve a logical heading hierarchy.
- Keep components focused and colocate only component-specific helpers.
- Use data-driven rendering for portfolio, photography, services, navigation, and footer links.
- Prefer CSS/Tailwind responsive layout over JavaScript viewport detection.
- Use design tokens through CSS custom properties and Tailwind theme mappings; do not scatter arbitrary colours and spacing values.
- Use `clsx`/a small `cn` helper only if conditional class composition warrants it.
- Avoid premature abstractions and wrapper components that add no semantic or styling value.
- Write copy in UK English.
- Do not display rates; all work is quoted per project.

## Accessibility and motion

- Target WCAG 2.2 AA.
- Ensure visible focus styles, keyboard-operable controls, sufficient contrast, useful alternative text, labelled form fields, and accessible validation messages.
- Respect `prefers-reduced-motion`; animations should collapse to simple state changes and nonessential autoplay should stop or be avoided.
- Never rely on hover alone. Provide equivalent touch and keyboard behaviour.
- Carousels need explicit controls, meaningful labels, predictable focus, and pause/interaction behaviour.
- Background video is decorative unless it conveys unique information; mute it, use `playsInline`, provide a poster, and do not trap controls.

## Media and performance

- Support separate mobile and desktop hero sources with poster fallbacks.
- Do not preload portfolio video files. Load posters first and initialise video on clear user intent or when justified by viewport proximity.
- Preserve the native aspect ratio declared in project data.
- Optimise local photography with `next/image`, accurate `sizes`, stable dimensions/aspect ratios, and appropriate priority only above the fold.
- Prefer external streaming/video hosting for final high-bitrate portfolio films; keep provider details behind a small media-source interface.
- Avoid cumulative layout shift and test on constrained mobile connections.
- Performance targets for production: Core Web Vitals in the good range and a Lighthouse performance score of at least 90 on representative pages/devices.

### Phase 2 portfolio architecture

- `src/content/portfolio.ts` is the source of truth for hero and video-project records.
- `src/content/photography.ts` is the source of truth for photography records.
- `src/types/media.ts` defines the supported media contracts and aspect ratios.
- Components must render a deliberate placeholder when a media path is `null`; never request a guessed or missing path.
- Portfolio grid videos are poster-first and must not autoplay. Full video is attached only in the user-opened player.
- Prefer unlisted YouTube delivery through a configurable `youtubeVideoId`. Create the IFrame Player API instance only after the overlay opens, use the `youtube-nocookie.com` host, and begin muted with standard controls available.
- Preserve native MP4/WebM playback as the fallback when no YouTube ID is configured.
- The hero may autoplay only the viewport-appropriate muted source. Do not attach both desktop and mobile sources to the video element.
- The native hero background must expose a keyboard-accessible sound toggle whenever video is active. Sound may only be enabled following that user interaction.
- Expanded players and lightboxes must lock background scrolling, trap focus, close with Escape and a visible control, restore focus, and stop video on close.
- Photography uses `next/image` with truthful intrinsic dimensions, responsive `sizes`, useful alt text, captions, and optional locations.
- Keep external hosting provider-neutral. Configure exact remote image hosts in `next.config.ts` only when a provider is selected.

## Enquiry form and security

Collect: name, company/organisation, email, project type, estimated budget, desired timeline, and project description.

- Validate on both client and server from a shared schema.
- Treat server validation as authoritative.
- Return field-level errors without exposing internals.
- Add a honeypot and rate limiting before production; consider Turnstile only if spam warrants it.
- Do not log full enquiry bodies or personal data.
- Keep the delivery provider behind a server-only adapter so email can be configured later.
- Until delivery is configured, never imply that a message was delivered; provide an honest unavailable/configuration response.
- Keep secrets server-side and document required environment variables in `.env.example`.

### Phase 3 enquiry implementation

- The public form posts to `src/app/api/enquiries/route.ts`; shared types and authoritative validation live in `src/lib/enquiry/`.
- Resend is the approved provider. Require `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`; never send or claim success when any is missing.
- Set the customer's validated email as `Reply-To`. Do not send an automatic acknowledgement or any marketing email.
- Preserve the 16 KB request limit, strict field limits, same-origin check, hidden honeypot, HTML escaping, and generic provider-error responses.
- Use Upstash REST or a Vercel Firewall rule for distributed rate limiting. Never replace it with a process-memory-only limiter.
- When Upstash is configured, require `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and a secret `RATE_LIMIT_SALT`; fail closed on limiter errors.
- Do not log request bodies, contact details, provider payloads, or full enquiries.
- Unit tests use mocked delivery and rate-limit fetchers. Never place live credentials in tests or send real messages during automated validation.
- YouTube remains behind contextual consent. Opening a project must not load YouTube; only the explicit **Load YouTube film** action may initialise the API/player.

## SEO and analytics

- Provide descriptive metadata, canonical URL, Open Graph/Twitter imagery, sitemap, robots directives, and Organisation/ProfessionalService structured data where accurate.
- Make portfolio descriptions indexable in HTML; do not hide essential context inside video-only UI.
- Add analytics only after a provider and consent approach are approved. Avoid nonessential tracking by default.

## Quality gates

Before considering a change complete:

1. Run formatting, linting, type checking, and relevant tests.
2. Verify responsive layouts at representative small, medium, and wide viewports.
3. Check keyboard navigation, focus order, reduced motion, and form errors.
4. Check media fallbacks and behaviour with autoplay unavailable.
5. Review performance impact and avoid shipping placeholder media at production weight.
6. Keep README/content documentation current when data shapes or setup change.

## Development workflow

- Build incrementally by approved phase; do not silently expand scope.
- Preserve user changes and inspect the worktree before editing.
- Use conventional, focused commits when commits are requested.
- Use the `codex/` prefix for new branches unless directed otherwise.
- Never commit secrets, raw client media, or oversized masters to Git.
- Record material architecture decisions in short ADRs under `docs/decisions/` once implementation begins.

## Decisions requiring approval

Do not lock in the following without user confirmation: final typefaces/licensing, video hosting/provider, enquiry email provider and recipient, rate-limiting service, analytics/consent tooling, social/contact URLs, legal copy, final project taxonomy, or production media delivery workflow.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
