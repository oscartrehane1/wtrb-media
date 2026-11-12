/** Canonical root names only: 01–99, then 100–999. No aliases such as 001. */
export function parseProjectAssetFilename(pathname: string) {
  const match = /^(work-0[1-4])-(landscape|vertical-(0[1-9]|[1-9][0-9]{1,2})|photo-(0[1-9]|[1-9][0-9]{1,2}))\.(mp4|webm|jpg|webp)$/.exec(pathname);
  if (!match) return null;
  const image = match[5] === "jpg" || match[5] === "webp";
  if (match[2].startsWith("photo-") && !image) return null;
  return {
    slot: match[1],
    kind: match[2] === "landscape" ? "landscape" as const : match[2].startsWith("vertical-") ? "vertical" as const : "photo" as const,
    index: Number(match[3] ?? match[4] ?? 0),
    key: pathname.replace(/\.[^.]+$/, ""),
    image,
  };
}
