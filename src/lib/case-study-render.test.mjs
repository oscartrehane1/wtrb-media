import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Isolated SSR tests use the existing TypeScript dev dependency, not a new test
// framework. These temporary CJS compilation hooks never run in the application.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previous = [require.extensions[".tsx"], require.extensions[".ts"]];
for (const extension of [".tsx", ".ts"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    });
    module._compile(outputText.replace(/require\(["']@\/([^"']+)["']\)/g, (_, path) => `require(${JSON.stringify(resolve(root, path))})`), filename);
  };
}
let CaseStudyMedia;
let study;
try {
  ({ CaseStudyMedia } = require("../components/media/case-study-media.tsx"));
  ({ caseStudies: [study] } = require("../content/case-studies.ts"));
} finally {
  for (const [index, extension] of [".tsx", ".ts"].entries()) {
    if (previous[index]) require.extensions[extension] = previous[index];
    else delete require.extensions[extension];
  }
}
const film = (aspectRatio = "16:9") => ({ id: "fixture", label: aspectRatio === "16:9" ? "Landscape film" : "Vertical film 01", aspectRatio, poster: null, video: { src: "/never-preload.mp4", type: "video/mp4" } });
const photo = { id: "photo", src: "/media/test.jpg", alt: "Test project photograph", caption: "Photograph 01" };
const render = (media) => renderToStaticMarkup(createElement(CaseStudyMedia, { study, media }));

for (const [name, media, headings] of [
  ["landscape", { landscape: film(), vertical: [], photography: [] }, ["Landscape film"]],
  ["vertical", { landscape: null, vertical: [film("9:16")], photography: [] }, ["Vertical films"]],
  ["photography", { landscape: null, vertical: [], photography: [photo] }, ["Photography"]],
  ["mixed", { landscape: film(), vertical: [film("9:16")], photography: [photo] }, ["Landscape film", "Vertical films", "Photography"]],
]) {
  test(`${name} layout renders only available sections and attaches no portfolio video`, () => {
    const html = render(media);
    for (const heading of ["Landscape film", "Vertical films", "Photography"]) {
      assert.equal(html.includes(`>${heading}</h2>`), headings.includes(heading));
    }
    assert.doesNotMatch(html, /<video|never-preload|In development|Project media will/);
    if (media.photography.length) assert.match(html, /loading="lazy"/);
    if (media.vertical.length) assert.match(html, /case-film__frame--vertical/);
  });
}

test("empty project has one compact project-level fallback, not an empty film player", () => {
  const html = render({ landscape: null, vertical: [], photography: [] });
  assert.match(html, /Project media will be shared here when available/);
  assert.doesNotMatch(html, /<h2|<video|case-film__frame|In development/);
});

test("responsive media contracts preserve ratios, bounded vertical widths and reduced motion", () => {
  const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
  assert.match(css, /\.case-film__frame \{[^}]*aspect-ratio: 16 \/ 9/);
  assert.match(css, /\.case-film__frame--vertical \{ aspect-ratio: 9 \/ 16/);
  assert.match(css, /\.case-media \.media-dialog__panel \{[^}]*min-height: 0;[^}]*overflow-y: auto/);
  assert.match(css, /\.case-media__vertical \{[^}]*auto-fit[^}]*min\(100%, 15rem\)/);
  assert.match(css, /\.case-photos \{[^}]*minmax\(0, 1fr\)/);
  assert.match(css, /prefers-reduced-motion: reduce[^}]*\.case-photos__button:hover img \{ transform: none/s);
});
