# Filename-based Vercel Blob video slots

Use the official Vercel Blob SDK on the server to list a connected public store. Exact root pathnames map to the hero and the four ordered portfolio positions. Ignore all other blobs. Keep credentials server-side and use existing typed media contracts and native players, preserving user-initiated portfolio playback.

The homepage uses 60-second incremental regeneration so dashboard uploads and removals appear without deployments. Authentication is delegated to the SDK: prefer Vercel-managed OIDC with BLOB_STORE_ID, retaining the legacy read-write token alternative. Never capture an OIDC token or pass it explicitly, allowing SDK credential refresh at production runtime. The credential-bearing adapter uses Next.js's server-only import boundary; pure resolution logic is separately testable with mock listings.

Each resolution reads all listing pages with a shared timeout, starts with an empty result, and falls back entirely on failure. MP4 takes priority over WebM. Duplicate pathnames resolve by newest upload time, then ETag, independent of listing order. Exact-name matching deliberately ignores suffixed and archived files. ETag and upload time form a URL query version for browser caching after replacements; Blob CDN overwrite/deletion propagation can still take 60 seconds. ISR is request-driven and may initially serve stale HTML while regenerating, so this is eventual publication, not real-time push.

Missing credentials or storage errors fall back to local media. No visitor upload endpoint or storage mutation is introduced. Slot order follows the portfolio array; changing that order changes the associated position. See README for the publishing contract.
