# WtRB Media

Phase 1 responsive design foundation for the WtRB Media website.

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
npm run build
```

The production enquiry form remains intentionally represented by a placeholder.

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
