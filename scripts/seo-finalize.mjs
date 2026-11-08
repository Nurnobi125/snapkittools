// Idempotent SEO pass over every HTML page. Safe to run any number of times.
// - canonical, og:url, og:image, twitter:card (large image), favicons
// - hreflang clusters (home, tools directory, each tool) incl. x-default
// - language links block on English/Bangla pages
// - noindex for 404, sitemap.xml (with lastmod + xhtml alternates), robots.txt
import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { injectChrome } from './chrome.mjs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'site-config.json'), 'utf8'));
const siteUrl = String(config.siteUrl || '').trim().replace(/\/$/, '');
if (!/^https:\/\/[^/]+$/.test(siteUrl) || siteUrl.includes('YOUR-USERNAME')) throw new Error('site-config.json needs a valid https siteUrl');
const today = new Date().toISOString().slice(0, 10);

const i18nDir = path.join(root, 'data/i18n');
const langCodes = (await readdir(i18nDir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')).sort();
const nativeName = { en: 'English' };
for (const c of langCodes) nativeName[c] = JSON.parse(await readFile(path.join(i18nDir, `${c}.json`), 'utf8')).name;
const allCodes = ['en', ...langCodes];

const SKIP_DIRS = new Set(['snapkit-bangla-full-website-video-kit', 'node_modules', '.git', 'scripts', 'assets', 'data']);
const LEGACY_DIRS = new Set(['image-to-pdf', 'svg-to-jpg', 'svg-to-pdf', 'svg-to-png']); // old root URLs; canonical already points to /tools/...
async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) await walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}
const toUrlPath = (file) => {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
};

// Identify which "cluster" (same page in different languages) a URL path belongs to.
const langAlt = `(${langCodes.join('|')})`;
function clusterOf(p) {
  if (p === '/' ) return { key: 'home', code: 'en' };
  if (p === '/index-bn.html') return { key: 'home', code: 'bn' };
  if (p === '/tools/') return { key: 'dir', code: 'en' };
  if (p === '/privacy.html') return { key: 'privacy', code: 'en' };
  if (p === '/privacy-bn.html') return { key: 'privacy', code: 'bn' };
  let m = p.match(/^\/tools\/([^/]+)\/$/);
  if (m) return { key: `tool:${m[1]}`, code: 'en' };
  m = p.match(new RegExp(`^/${langAlt}/$`));
  if (m) return { key: 'home', code: m[1] };
  m = p.match(new RegExp(`^/${langAlt}/tools/$`));
  if (m) return { key: 'dir', code: m[1] };
  m = p.match(new RegExp(`^/${langAlt}/tools/([^/]+)/$`));
  if (m) return { key: `tool:${m[2]}`, code: m[1] };
  return null;
}

const files = await walk(root);
const pages = files.map((f) => ({ file: f, p: toUrlPath(f), cl: null }));
const clusters = new Map();
for (const pg of pages) {
  pg.cl = clusterOf(pg.p);
  if (pg.cl) {
    if (!clusters.has(pg.cl.key)) clusters.set(pg.cl.key, {});
    if (pg.cl.code === 'bn' && pg.cl.key === 'home') {
      if (!clusters.get(pg.cl.key)['bn'] || pg.p === '/index-bn.html') {
        clusters.get(pg.cl.key)['bn'] = '/index-bn.html';
      }
    } else {
      clusters.get(pg.cl.key)[pg.cl.code] = pg.p;
    }
  }
}

const ogImage = `${siteUrl}/assets/og/snapkit-og.png`;
const icons = '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">';
const STRIP = [
  /<link rel="canonical"[^>]*>/g, /<meta property="og:url"[^>]*>/g, /<meta property="og:image[^>]*>/g,
  /<meta name="twitter:card"[^>]*>/g, /<meta name="twitter:image[^>]*>/g, /<link rel="alternate" hreflang="[^"]*"[^>]*>/g,
  /<link rel="describedby"[^>]*>/g, /<link rel="icon"[^>]*>/g, /<link rel="apple-touch-icon"[^>]*>/g, /<meta name="robots"[^>]*>/g
];
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const sitemapEntries = [];

for (const pg of pages) {
  let html = await readFile(pg.file, 'utf8');
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  if (pg.p !== '/404.html') {
    html = injectChrome(html, pg.cl ? (code) => clusters.get(pg.cl.key)?.[code] : null, pg.p);
    html = html.replace(/<nav class="langs"[\s\S]*?<\/nav>/g, ''); // language links now live in the shared footer
  }
  for (const re of STRIP) html = html.replace(re, '');
  html = html.replace(/<!--langs-->[\s\S]*?<!--\/langs-->/g, '');

  const isNotFound = pg.p === '/404.html';
  const legacy = LEGACY_DIRS.has(pg.p.replace(/\//g, ''));
  let inject = '';

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const title = titleMatch ? titleMatch[1].trim() : 'SnapKit';

  if (isNotFound) {
    inject += `<meta name="robots" content="noindex,follow">${icons}`;
    if (!descMatch) inject += '<meta name="description" content="Page not found – SnapKit free online tools.">';
  } else {
    inject += `<link rel="describedby" type="application/json" title="SnapKit machine-readable tool catalog" href="${siteUrl}/ai-index.json"><link rel="describedby" type="text/plain" title="SnapKit AI guide in Bangla" href="${siteUrl}/llms.txt">`;
    const canonicalPath = legacy ? `/tools/${pg.p.replace(/\//g, '')}/` : (pg.p === '/bn/' ? '/index-bn.html' : pg.p);
    const url = siteUrl + canonicalPath;
    inject += `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}">`;
    inject += `<meta property="og:image" content="${ogImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="SnapKit – free online PDF, image and everyday tools">`;
    inject += `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${ogImage}">`;
    inject += icons;
    if (pg.cl && !legacy) {
      const cluster = clusters.get(pg.cl.key);
      const codes = allCodes.filter((c) => cluster[c]);
      if (codes.length > 1) {
        inject += codes.map((c) => `<link rel="alternate" hreflang="${c}" href="${siteUrl}${cluster[c]}">`).join('');
        inject += `<link rel="alternate" hreflang="x-default" href="${siteUrl}${cluster.en}">`;
      }
    }
    if (!legacy && pg.cl?.key !== 'privacy') {
      const entry = { loc: url, alts: pg.cl && clusters.get(pg.cl.key) && Object.keys(clusters.get(pg.cl.key)).length > 1 ? clusters.get(pg.cl.key) : null };
      sitemapEntries.push(entry);
    }
  }
  html = html.replace('</head>', `${inject}</head>`);

  // Empty alt on the JS-driven preview image
  html = html.replace(/<img class="preview" id="preview">/g, '<img class="preview" id="preview" alt="">');
  void title; void nl;
  await writeFile(pg.file, html, 'utf8');
}

// sitemap.xml
const urlset = sitemapEntries
  .sort((a, b) => a.loc.localeCompare(b.loc))
  .map((e) => `  <url><loc>${e.loc}</loc><lastmod>${today}</lastmod>${e.alts ? allCodes.filter((c) => e.alts[c]).map((c) => `<xhtml:link rel="alternate" hreflang="${c}" href="${siteUrl}${e.alts[c]}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${e.alts.en}"/>` : ''}</url>`)
  .join('\n');
await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlset}\n</urlset>\n`, 'utf8');
await writeFile(path.join(root, 'robots.txt'), `# Public pages are available to search and answer-engine crawlers.
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, 'utf8');
console.log(`Finalized ${pages.length} pages; sitemap has ${sitemapEntries.length} URLs.`);
