/** These routes must be checked on each request, not cached by Next's optimiser. */
export function isPublicationGatedImage(src: string) {
  return src.startsWith("/api/project-media/") || /^\/api\/thumbnails\/work-01[.-]/.test(src);
}
