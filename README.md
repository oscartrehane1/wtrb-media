# WtRB Media

Production website for WtRB Media, built with Next.js, TypeScript, Tailwind CSS and Motion.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The application builds without service credentials. In that state, the enquiry form returns an honest delivery failure and never reports that a message was sent.

## Project enquiry delivery

The enquiry form posts JSON to `src/app/api/enquiries/route.ts`. The server validates every field, enforces a 16 KB request limit, checks same-origin browser requests, discards honeypot submissions, applies a distributed rate limit when configured and sends through the server-only Resend adapter. Full enquiries and personal information are never logged.

Copy `.env.example` to `.env.local` for local configuration. Never commit `.env.local`.

```dotenv
RESEND_API_KEY=re_your_api_key
CONTACT_TO_EMAIL=hello@wtrbmedia.co.uk
CONTACT_FROM_EMAIL=website@wtrbmedia.co.uk
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token
RATE_LIMIT_SALT=replace-with-a-long-random-server-only-value
```

### Resend and DNS setup

1. Add `wtrbmedia.co.uk` as a sending domain in Resend.
2. Add the exact SPF/DKIM DNS records Resend displays at the domain's DNS provider. Do not invent or reuse record values from another account.
3. Wait until Resend reports the domain as verified.
4. Choose a sender on that verified domain, such as `website@wtrbmedia.co.uk`, for `CONTACT_FROM_EMAIL`. It does not need to be the Zoho inbox receiving replies.
5. Set `CONTACT_TO_EMAIL=hello@wtrbmedia.co.uk`. Customer replies go directly to the submitted email through Resend's `Reply-To` field.
6. Add all environment variables in Vercel for Production and the appropriate Preview environments, then redeploy.
7. Send a real test enquiry only after the owner explicitly approves it.

Zoho Mail remains the business mailbox provider. Preserve its existing MX records when adding Resend's sending-domain records.

### Serverless rate limiting

The included Upstash REST limiter uses an atomic Redis `INCR`, a one-hour expiry and a hashed network identifier. It allows five validated submissions per identifier per hour and fails closed if a configured Upstash service is incomplete or unavailable. Because serverless instances do not share memory, no in-memory counter is used.

For production, configure either the documented Upstash variables or an equivalent Vercel Firewall rate-limit rule on `POST /api/enquiries`. Using both provides useful layered protection. If Upstash is omitted, the code assumes the platform rule is the distributed limiter; honeypot and validation protections still apply.

## Privacy and legal review

YouTube is loaded only after a visitor explicitly chooses **Load YouTube film** inside the player. No generic cookie banner is added because the current site has no analytics or advertising trackers and third-party video is gated contextually.

The privacy page identifies WtRB Media as the data controller and uses `hello@wtrbmedia.co.uk` for privacy enquiries. Review the notice whenever the site's data collection, service providers or retention practices change, and periodically confirm whether an ICO data protection fee or registration applies.

## Portfolio content

All media is configured separately from presentation components:

- `src/content/portfolio.ts` — hero showreel and video projects
- `src/content/photography.ts` — photography gallery
- `src/types/media.ts` — shared media types

Until approved media is supplied, demonstration records render designed placeholders. They do not request missing files.

### Add the hero showreel

Place web-ready files under `public/media/video/` and the poster under `public/media/posters/`, then update `heroMedia`:

```ts
export const heroMedia: HeroMedia = {
  desktop: { src: "/media/video/hero-desktop.mp4", type: "video/mp4" },
  mobile: { src: "/media/video/hero-mobile.mp4", type: "video/mp4" },
  poster: "/media/posters/hero.jpg",
  showreelUrl: "/media/video/wtrb-showreel-full.mp4",
};
```

Only the source appropriate to the current viewport is attached. Reduced-motion visitors receive the poster and no autoplay. The full showreel starts only after the visitor selects **Play showreel**.

### Add a 16:9 project

Add an entry to `portfolioProjects` in `src/content/portfolio.ts`:

```ts
{
  id: "unique-project-slug",
  title: "Project title",
  clientType: "Project type or approved client name",
  category: "Brand film",
  description: "Short factual project description.",
  aspectRatio: "16:9",
  poster: "/media/posters/project-slug.jpg",
  youtubeVideoId: "YOUTUBE_VIDEO_ID",
  video: null,
  duration: "02:14",
  featured: true,
}
```

### Add a 9:16 project

Use the same structure with `aspectRatio: "9:16"`. The grid and player preserve that ratio automatically:

```ts
{
  id: "unique-vertical-slug",
  title: "Vertical project title",
  clientType: "Project type",
  category: "Social campaign",
  description: "Short factual project description.",
  aspectRatio: "9:16",
  poster: "/media/posters/vertical-slug.jpg",
  youtubeVideoId: "YOUTUBE_VIDEO_ID",
  video: null,
  duration: "00:30",
}
```

Use only the ID from the YouTube URL—not the complete URL. Unlisted videos are supported. YouTube is the preferred portfolio delivery method and is created through the IFrame Player API only after a visitor opens a film. The player uses the privacy-enhanced `youtube-nocookie.com` host, starts muted, and exposes standard controls so the visitor can enable sound.

For a native fallback, omit `youtubeVideoId` and provide:

```ts
video: { src: "/media/video/project-slug.mp4", type: "video/mp4" },
```

Playback priority is YouTube, then native video, then `externalUrl`. Reorder the array to change the editorial sequence.

### Add a photograph

Place the optimised image under `public/media/photography/`, then add an entry to `photographyItems` in `src/content/photography.ts`:

```ts
{
  id: "unique-image-slug",
  src: "/media/photography/image-slug.jpg",
  alt: "Concise description of the visible subject and setting",
  caption: "Approved caption",
  location: "Approved location",
  width: 1800,
  height: 1200,
}
```

Use the source image's real dimensions. Reorder the array to change gallery order. For remote image hosts, add the exact host to `images.remotePatterns` in `next.config.ts` before using remote URLs.

## Media preparation

- Hero background: short, muted, loop-friendly desktop 16:9 and mobile 9:16 encodes.
- Portfolio video: unlisted YouTube is preferred. Native web-optimised MP4 or WebM remains supported; players are loaded only after user interaction.
- Posters: compressed JPEG, WebP, or AVIF matching the film's aspect ratio.
- Photography: retain enough resolution for the expanded viewer and export an efficient web format.
- Never commit camera masters or other oversized production media to Git.
