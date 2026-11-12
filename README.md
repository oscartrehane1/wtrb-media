# WtRB Media

Production website for WtRB Media, a film-led creative production and content marketing studio for travel, tourism, outdoor adventure and experience-led brands. Built with Next.js, TypeScript, Tailwind CSS and Motion.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

Next.js and `eslint-config-next` are pinned to 16.4.6, the compatible stable patch selected after the November 2026 security review. The Blob SDK's pinned transitive CLI configuration dependency is overridden to 0.3.8, and Zod to 4.6.7, to remove the reported authentication dependency advisories while retaining managed OIDC. Reassess these overrides when upgrading the Blob SDK.

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

### Automatic video assignment from Vercel Blob

#### Case-study media — upload only the formats a project needs

In **Vercel → wtrb-media → Storage → wtrb-media-blob → Files**, upload into the root with these exact names. Keep the store Private. Substitute `work-02`, `work-03` or `work-04` for the appropriate existing portfolio position.

| Asset | Example | Alternative |
| --- | --- | --- |
| Landscape film (16:9) | `work-01-landscape.mp4` | `.webm` |
| Vertical films (9:16) | `work-01-vertical-01.mp4`, `work-01-vertical-02.mp4` | `.webm` |
| Photographs | `work-01-photo-01.jpg`, `work-01-photo-02.jpg` | `.webp` |
| Optional landscape poster | `work-01-landscape.jpg` | `.webp` |
| Optional vertical poster | `work-01-vertical-01.jpg` | `.webp` |

Continue numbering `01`–`99`, then `100`–`999`. Gaps are fine; assets sort by number, not upload time. Use `01`, not `1` or `001`. Numbers above 999, random suffixes, folders and archive names are ignored. Photography can have any orientation; gallery thumbnails are editorial crops and the lightbox shows the full image. Keep photos and posters below **8 MB** each; upload compressed web exports, not camera originals. Films must actually match their named orientation: Blob does not inspect or transcode them.

Only populated categories appear. Photography-only and vertical-only projects do not get an empty landscape player. Posters without their films do not create players. With no available media, the page shows a compact project-level message. Films attach only when a visitor explicitly opens their player; standard controls, muted playback and existing YouTube consent are preserved.

**Homepage compatibility:** `work-01.mp4` and the other original slot names keep their current homepage behaviour. Dedicated `-landscape` files take precedence on case studies. Reusing a homepage film is opt-in via the case study's `homepageLandscapeConfirmed` flag and requires a linked 16:9 project. A card's 16:9 crop does not confirm the uploaded film's orientation. Uploading a dedicated `-landscape` film needs no flag or redeployment.

Oslo is explicitly enabled to reuse the existing `work-01.mp4`, verified from its native video metadata as **1920 × 1080** on 12 November 2026. No duplicate upload is needed. Keep replacements for that legacy filename landscape; if its orientation changes, remove the confirmation rather than displaying it in a 16:9 player.

**Replace/remove:** Overwrite the exact name, or delete the old file before uploading its replacement. Delete or rename an asset outside the naming convention to remove it. MP4 wins over WebM; WebP wins over JPG, independently of upload age. Remove both alternatives to empty a position. Existing configured media remains the fallback. Allow approximately **1–2 minutes** and reload: case-study pages and home regenerate every 60 seconds. The first visit after expiry can trigger background regeneration; an open player/tab is not updated automatically. Image URLs include upload versions and optimised variants have a 60-second minimum cache. Raw private media routes remain `no-store`.

Discovery shares one complete paginated store listing per page regeneration, not one request per filename. It has a 10-second timeout and a hard limit of ten pages of 1,000 objects (including unrelated files). An outage or listing larger than this budget uses configured fallbacks rather than publishing a partial set; an administrator must review the store/discovery budget if it grows that large.

Each existing case-study record links to its slot with `mediaSlot` in `src/content/case-studies.ts`. Uploads then update that page without code changes. Uploading files does **not** create a new project route, client relationship or campaign claim: currently Oslo is the only authored case study. The naming system supports all four positions when their editorial case studies are supplied. Titles, status, descriptions, credits and outcomes remain separate editorial data; Oslo remains an independent, uncommissioned concept. Optional `media.photoDescriptions` entries keyed by `work-01-photo-01` provide subject-specific alt text/captions; otherwise neutral project-title/number labels are used without guessing image contents.

#### Uploading videos and thumbnails — no deployment needed

Open the existing **wtrb-media** project in Vercel, choose **Storage → wtrb-media-blob → Files**, and upload directly into the store root (not a folder). Keep the store **Private** and its existing project connection unchanged. Give the file its exact name before uploading; avoid any random suffix option.

| Position | Video filename | Optional matching thumbnail |
| --- | --- | --- |
| Desktop hero | `hero-desktop.mp4` | Uses the existing hero poster |
| Mobile hero | `hero-mobile.mp4` | Uses the existing hero poster |
| Showreel | `showreel.mp4` | `showreel.webp` or `showreel.jpg` |
| First Selected Work | `work-01.mp4` | `work-01.webp` or `work-01.jpg` |
| Second Selected Work | `work-02.mp4` | `work-02.webp` or `work-02.jpg` |
| Third Selected Work | `work-03.mp4` | `work-03.webp` or `work-03.jpg` |
| Fourth Selected Work | `work-04.mp4` | `work-04.webp` or `work-04.jpg` |

For a thumbnail, export a compressed **16:9 JPG or WebP**, ideally around **1600 × 900 pixels**, and upload it alongside the video. Images must be under 8 MB and have the correct JPEG/WebP file type. The website crops cards to 16:9; the opened film keeps its original proportions. The showreel image is its player poster, not a replacement hero background.

To replace a thumbnail, overwrite the exact filename if the dashboard offers that option, otherwise delete the old file and upload the replacement with exactly the same name. To remove it, delete it or rename it to something like `archived-work-01.jpg`. If both JPG and WebP exist, **WebP takes priority**; remove both to restore the original poster or designed fallback. Suffixed, nested and archived filenames are ignored. An image alone does not add a film or change project titles/order.

Allow **about 1–2 minutes**, then refresh the page. The homepage checks filenames on its 60-second regeneration cycle; the first visit after expiry can still show the previous page while refreshing in the background. Each replacement gets a new image-cache key. Responsive image variants have a minimum 60-second cache, but removed images stop being referenced after the page refreshes. An already-open tab needs reloading. No redeployment is required.

Cards use the matching uploaded image, then the project's existing poster, then a designed fallback. They deliberately do not download full films to extract preview frames. Private thumbnail reads use the server-only, exact-name `/api/thumbnails/[filename]` route; Next.js delivers appropriately sized image variants without exposing storage credentials. Like the films, approved thumbnails are publicly viewable through the website, while other store files remain inaccessible through these routes.

**One-time setup:** The existing **Private** `wtrb-media-blob` store is connected to **wtrb-media → Production and Preview** using managed **OIDC** (verified in the Vercel dashboard). Keep that connection and its default `BLOB` prefix; no token needs copying or sharing. Vercel supplies `BLOB_STORE_ID` and manages rotating authentication. The website serves only the approved video filenames through its own streaming route; unrelated files remain private. A correctly named video is intentionally published for website visitors even though the storage bucket stays private. Routine video changes need no code edits or redeployments.

**Upload:** Open **Storage → wtrb-media-blob → Browse**, upload your web-ready video and check its stored filename against this table. Use these exact lowercase names at the root of the store, with no folder or random suffix. If upload options add a random suffix, disable it or rename the stored file to the exact name after uploading:

| Filename | Website position |
| --- | --- |
| `hero-desktop.mp4` | Desktop hero background |
| `hero-mobile.mp4` | Mobile hero background |
| `showreel.mp4` | Hero's user-opened full showreel |
| `work-01.mp4` | First Selected Work position (Oslo) |
| `work-02.mp4` | Second Selected Work position (vertical) |
| `work-03.mp4` | Third Selected Work position (4:5) |
| `work-04.mp4` | Fourth Selected Work position (square) |

`.webm` is also supported. Match the video's orientation to its position. MP4 takes priority if both `.mp4` and `.webm` exist for the same slot, regardless of which was uploaded last. Names such as `work-01 (1).mp4`, `work-01-random.mp4` or files inside folders are ignored. Keep only one active file per position to avoid confusion.

**Replace:** Upload the new video using the same exact filename and accept Vercel's overwrite/replace option if shown. If replacement isn't offered, delete the old file and upload the new one with its exact name. A duplicate-name error means the old file still exists; don't rename the new upload to a numbered duplicate. The website uses the upload time and content version to avoid reusing the browser's cached copy.

**Remove:** Delete the matching file or rename it to a name outside the table, such as `archived-work-01.mp4`. If rename isn't available, copy/re-upload under the archive name and delete the original matching file. Remove both MP4 and WebM if both exist, otherwise the remaining format will fill the position. A file renamed to another valid slot name moves to that other position. The original fallback video or placeholder returns when no matching file remains. The private streaming route rejects archived names and returns 404 for deleted files. For any separately configured public store, renaming a public file does not make it private.

**When changes appear:** Wait around one to two minutes, refresh the homepage, then refresh again after a few seconds if necessary. The homepage checks for changes after its 60-second cache interval when visited; the first visit can show the previous page while it updates in the background. Vercel's video delivery cache can also take up to 60 seconds to reflect an overwrite/deletion. An already-open page does not update by itself. No redeployment is needed for these routine changes.

**If a video doesn't appear:** Check the exact stored filename and the store's Production project connection. Keep the existing store Private. Missing credentials, expired local credentials or a storage outage leave the existing fallback media available. A generic message in Vercel's server logs identifies lookup failures without logging credentials or Blob contents. Videos must be browser-compatible MP4/WebM encodes; Blob stores files and does not transcode them. Titles, status and case-study copy remain separately maintained editorial content.

For developers: `src/lib/blob-media.ts` has an enforced server-only boundary. SDK 2.9.0 supports managed OIDC and prefers it when `BLOB_STORE_ID` and Vercel-issued credentials are available. It also supports an existing `BLOB_READ_WRITE_TOKEN` as a legacy alternative; that token can be added through the store connection's read-write-token option and must be enabled for Production, never prefixed `NEXT_PUBLIC_`. OIDC requires no such token. For authenticated local testing, connect Development too, then use `vercel link` and `vercel env pull .env.local`; don't copy or pass an OIDC token explicitly because that disables SDK refresh. An unconfigured local build works with placeholders. No custom upload endpoint is added.

Private video delivery uses `/api/media/[filename]`: an exact filename allowlist, authenticated SDK reads, streaming bodies, HEAD and single byte-range requests for seeking. It never accepts arbitrary URLs or paths. Browser/website CDN caching is disabled on that route, and private Blob reads bypass its delivery cache so replacements/removals take effect on subsequent reads. The homepage still uses its 60-second refresh interval. Private delivery uses Vercel Functions and Blob bandwidth; keep uploads compressed for the web. Public-store URLs remain supported if a public store is deliberately configured later.

References: [Vercel authentication and project connections](https://vercel.com/docs/vercel-blob/using-blob-sdk#authentication), [Blob caching](https://vercel.com/docs/vercel-blob).

All media is configured separately from presentation components:

- `src/content/portfolio.ts` — hero showreel and video projects
- `src/content/case-studies.ts` — typed case-study strategy and delivery records
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

### Add or update a case study

Case-study content lives in `src/content/case-studies.ts` and is rendered at `/work/[slug]`. Keep the project classification accurate, use the disclaimer field for independent concepts, and add results only when they have been verified. Link a portfolio entry to its page with `caseStudySlug`.

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
