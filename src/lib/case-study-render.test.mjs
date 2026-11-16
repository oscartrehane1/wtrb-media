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
let Portfolio;
let study;
try {
  ({ CaseStudyMedia } = require("../components/media/case-study-media.tsx"));
  ({ Portfolio } = require("../components/sections/portfolio.tsx"));
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

test("portfolio renders empty, single, pair and grid layouts with native links and play buttons", () => {
  const card = (id, playable = false) => ({
    id, title: id, category: "Tourism", clientType: "Independent project", description: "Example",
    caseStudySlug: id, aspectRatio: "16:9", poster: null,
    video: playable ? { src: "/never-preload.mp4", type: "video/mp4" } : null,
  });
  const cards = [card("first", true), card("second"), card("third")];
  for (const [count, expected] of [[0, "grid"], [1, "single"], [2, "pair"], [3, "grid"]]) {
    const html = renderToStaticMarkup(createElement(Portfolio, { projects: cards.slice(0, count) }));
    assert.match(html, new RegExp(`data-layout="${expected}"`));
    assert.equal(html.includes("New work will appear here"), count === 0);
    assert.equal(html.includes('aria-label="Play first"'), count > 0);
    assert.equal(html.includes('href="/work/second"'), count > 1);
    assert.doesNotMatch(html, /never-preload|<video|Demonstration project/);
  }
  const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
  assert.match(css, /\.portfolio-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /data-layout="single"[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /data-layout="grid"[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});
