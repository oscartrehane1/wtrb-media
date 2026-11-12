# Private portfolio thumbnails and Manrope

- Extend the existing server-side Blob listing with exact root JPG/WebP slot names, using WebP before JPG and upload-versioned URLs. No additional listing or storage provider is needed.
- Publish only approved thumbnail names through a server-authenticated route. Allow JPEG/WebP only, cap source size at 8 MB, and disable raw-source caching. Next.js image optimisation provides responsive variants with a 60-second minimum cache.
- Homepage regeneration remains 60 seconds; removal restores the configured poster or designed fallback. Never download portfolio films just to extract a grid preview frame. Player loading, consent, native ratios and private video streaming remain unchanged.
- Use the self-hosted Manrope variable font through next/font/google throughout the website, replacing Playfair Display and Inter. Display hierarchy comes from weight, size and spacing rather than a second family.
