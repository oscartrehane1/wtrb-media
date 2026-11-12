# Compatible security patches before Blob deployment

The installed Next.js 16.4.0 was flagged by npm for GHSA-2464-fhr4-w9xw (SVG image optimization), GHSA-p3m5-59mp-jv5r (Server Actions denial of service), and GHSA-673q-mjm6-r5xr (typed-array cache function remote code execution). These advisories were patched in 16.4.1. Select 16.4.6, the current stable patch on the existing 16.4 line, to include later security fixes, and pin the matching eslint-config-next version. Its React peer ranges support the existing React 19.3 installation.

The audit also identified a vulnerable Zod version through Blob's OIDC dependency. Preserve Blob 2.9.0 and OIDC support; use compatible overrides for @vercel/cli-config 0.3.8 and Zod 4.6.7. Do not accept npm's suggested Blob downgrade, which would change the supported authentication implementation. Remaining minimatch findings are in development-only lint tooling and would require a separately assessed major dependency change.

Sources: https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw and https://github.com/vercel/next.js/releases/tag/v16.4.6. Validate tests, lint, typecheck, build and the production dependency audit before committing.
