#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const outDir = path.resolve(rootDir, 'tmp/makers-site')
const viewerDist = path.resolve(rootDir, 'packages/cad-viewer-example/dist')
const diffDist = path.resolve(rootDir, 'packages/cad-diff-viewer-example/dist')
const simpleDist = path.resolve(
  rootDir,
  'packages/cad-simple-viewer-example/dist'
)
const cdnBootstrapSrc = path.resolve(
  rootDir,
  'packages/examples/public/cdn-bootstrap'
)

function assertExists(fileOrDir, label) {
  if (!fs.existsSync(fileOrDir)) {
    console.error(`[copy-makers-site] missing ${label}: ${fileOrDir}`)
    process.exit(1)
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true, force: true })
  const from = path.relative(rootDir, src)
  const to = path.relative(rootDir, dest)
  console.log(`[copy-makers-site] copied ${from} -> ${to}`)
}

function main() {
  assertExists(viewerDist, '@mlightcad/cad-viewer-example/dist')
  assertExists(diffDist, '@mlightcad/cad-diff-viewer-example/dist')
  assertExists(simpleDist, '@mlightcad/cad-simple-viewer-example/dist')

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true })
  }

  // dest must not exist so cpSync writes viewer files at the site root
  copyDir(viewerDist, outDir)
  assertExists(
    path.join(outDir, 'index.html'),
    'viewer index.html at site root'
  )

  copyDir(diffDist, path.join(outDir, 'diff'))
  copyDir(simpleDist, path.join(outDir, 'simple'))
  assertExists(
    path.join(outDir, 'simple', 'html-converter.html'),
    'simple/html-converter.html'
  )

  assertExists(cdnBootstrapSrc, 'packages/examples/public/cdn-bootstrap')
  copyDir(cdnBootstrapSrc, path.join(outDir, 'cdn-bootstrap'))
  assertExists(
    path.join(outDir, 'cdn-bootstrap', 'cad-viewer.html'),
    'cdn-bootstrap/cad-viewer.html'
  )

  const examplesDir = path.join(outDir, 'examples')
  fs.mkdirSync(examplesDir, { recursive: true })
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CAD Viewer — Makers Site Index</title>
<style>
:root{color-scheme:light dark;--bg:#f4f6fb;--card:#fff;--text:#1a1f36;--muted:#5b6478;--accent:#2563eb;--border:#d8deea}
@media(prefers-color-scheme:dark){:root{--bg:#0f1419;--card:#171c24;--text:#eef2ff;--muted:#a6b0c3;--accent:#60a5fa;--border:#2a3344}}
*{box-sizing:border-box}body{margin:0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;line-height:1.6;color:var(--text);background:var(--bg)}
.page{max-width:860px;margin:0 auto;padding:2.5rem 1.25rem}
h1{margin:0 0 .5rem;font-size:1.9rem}p{color:var(--muted)}
ul{list-style:none;padding:0;margin:1.5rem 0;display:grid;gap:.75rem}
li{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1rem 1.15rem}
a{color:var(--accent);font-weight:600;text-decoration:none}a:hover{text-decoration:underline}
code{font-size:.9em;background:rgba(37,99,235,.08);padding:.15em .4em;border-radius:6px}
small{color:var(--muted)}
</style>
</head>
<body>
<div class="page">
<h1>CAD Viewer — EdgeOne Makers</h1>
<p>Static routes exposed by <code>tools/copy-makers-site.mjs</code>. Viewer is at <code>/</code>; other examples are real subdirectories (no SPA fallback).</p>
<ul>
<li><a href="/">/ — CAD Viewer (full, Vue 3)</a><br><small>@mlightcad/cad-viewer-example — open DWG/DXF, layers, export</small></li>
<li><a href="/diff/">/diff/ — CAD Diff Viewer</a><br><small>@mlightcad/cad-diff-viewer-example — side-by-side diff</small></li>
<li><a href="/simple/">/simple/ — CAD Simple Viewer</a><br><small>@mlightcad/cad-simple-viewer-example — minimal embed</small></li>
<li><a href="/simple/html-converter.html">/simple/html-converter.html — In-browser HTML converter</a><br><small>Browser-only DWG/DXF → self-contained HTML</small></li>
<li><a href="/cdn-bootstrap/cad-viewer.html">/cdn-bootstrap/cad-viewer.html — Zero-build CDN bootstrap</a><br><small>Single HTML via import maps + jsDelivr (from <code>packages/examples/public/cdn-bootstrap</code>)</small></li>
</ul>
<p><small>Build: <code>pnpm exec nx run-many -t build --projects=@mlightcad/cad-viewer-example,@mlightcad/cad-simple-viewer-example,@mlightcad/cad-diff-viewer-example && node tools/copy-makers-site.mjs</code> → <code>tmp/makers-site</code> (gitignored).</small></p>
<p><small><a href="https://github.com/sxwzxc/cad-viewer">sxwzxc/cad-viewer (fork)</a> · upstream <a href="https://github.com/mlightcad/cad-viewer">mlightcad/cad-viewer</a></small></p>
</div>
</body>
</html>
`
  fs.writeFileSync(path.join(examplesDir, 'index.html'), html, 'utf8')
  console.log(
    `[copy-makers-site] wrote ${path.relative(rootDir, path.join(examplesDir, 'index.html'))}`
  )

  console.log(`[copy-makers-site] done -> ${path.relative(rootDir, outDir)}`)
}

main()
