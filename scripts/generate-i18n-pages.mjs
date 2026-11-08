// Generates localized landing pages: /{lang}/, /{lang}/tools/ and /{lang}/tools/{slug}/
// Translations live in data/i18n/{lang}.json and scripts/i18n-home-data.mjs.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { cardsHtml, CARD_CSS } from './tool-cards.mjs';
import { NAMED, PAIRS } from './tool-names.mjs';
import { HOME_UI, CARD_TEXTS } from './i18n-home-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8')).filter((r) => !r.enOnly);
const config = JSON.parse(await readFile(path.join(root, 'site-config.json'), 'utf8'));
const siteUrl = String(config.siteUrl || '').trim().replace(/\/$/, '');

const LOOSE_LETTERS = new Set(['ar', 'hi', 'bn', 'ja', 'ko', 'ru', 'zh']);

const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const fill = (s, a, b) => s.replaceAll('{a}', a).replaceAll('{b}', b);

const files = (await readdir(path.join(root, 'data/i18n'))).filter((f) => f.endsWith('.json')).sort();
const langs = [];
for (const f of files) {
  const l = JSON.parse(await readFile(path.join(root, 'data/i18n', f), 'utf8'));
  if (l.names.length !== NAMED.length) throw new Error(`${f}: expected ${NAMED.length} names, got ${l.names.length}`);
  langs.push(l);
}

const pairOf = (r) => (r.from && r.to ? [r.from, r.to] : PAIRS[r.slug] || null);
const kindOf = (r) => (r.inline ? 'ocr' : r.kind === 'pdf' ? 'pdf' : r.kind === 'utility' ? 'util' : 'convert');
const nameOf = (l, r) => {
  const pair = pairOf(r);
  if (pair) return fill(l.ui.convertName, pair[0], pair[1]);
  return l.names[NAMED.indexOf(r.slug)];
};

const ctaOf = (l, r) => {
  // Relative link from /{lang}/tools/{slug}/ (depth 3) to localized homepage
  const home = '../../';
  if (r.inline) return { href: `../${r.slug}/`, english: true };
  if (r.kind === 'utility') return { href: `../../../everyday-tools.html?tool=${r.tool}`, english: true };
  if (r.kind === 'pdf') return { href: `${home}?tool=${r.tool}#tools`, english: l.code !== 'bn' };
  return { href: `${home}?tool=convert&format=${encodeURIComponent(r.mime)}#tools`, english: l.code !== 'bn' };
};

const homePath = (code) => (code === 'en' ? '/' : code === 'bn' ? '/index-bn.html' : `/${code}/`);
const dirPath = (code) => (code === 'en' ? '/tools/' : `/${code}/tools/`);
const toolPath = (code, slug) => (code === 'en' ? `/tools/${slug}/` : `/${code}/tools/${slug}/`);
const allCodes = ['en', ...langs.map((l) => l.code)];
const nativeName = { en: 'English', ...Object.fromEntries(langs.map((l) => [l.code, l.name])) };

const switcher = (l, pathFor) => `<nav class="langs" aria-label="${esc(l.ui.langLabel)}"><b>${esc(l.ui.langLabel)}</b>${allCodes.map((c) => `<a href="${pathFor(c)}" hreflang="${c}" lang="${c}"${c === l.code ? ' aria-current="true"' : ''}>${esc(nativeName[c])}</a>`).join('')}</nav>`;

const baseStyle = (l) => `<style>.langs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:22px 0;border-top:1px solid var(--line);font-size:14px}.langs b{width:100%;font-size:13px;color:var(--muted)}.langs a{background:#fff;border:1px solid var(--line);border-radius:99px;padding:6px 11px;text-decoration:none}.langs a[aria-current]{background:var(--deep);color:#fff;border-color:var(--deep)}.note{font-size:13px;color:var(--muted);margin:-30px 0 36px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;padding:14px 0}.grid a{display:block;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-decoration:none;font-weight:650}${LOOSE_LETTERS.has(l.code) ? 'h1,h2{letter-spacing:0}h1{line-height:1.2}' : ''}</style>`;

const head = ({ l, title, description, ld, depth = 1 }) => {
  const prefix = '../'.repeat(depth);
  return `<!doctype html>
<html lang="${l.code}" dir="${l.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f7f8f4">
<meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:locale" content="${l.og}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('')}
<link rel="stylesheet" href="${prefix}tool-pages.css"><link rel="stylesheet" href="${prefix}theme.css"><script src="${prefix}theme.js"></script>${baseStyle(l)}</head>`;
};

const header = (l) => `<body><header class="top"><a class="brand" href="${homePath(l.code)}">✳ snapkit</a><a class="back" href="${dirPath(l.code)}">${esc(l.ui.allTools)}</a></header>`;
const footer = (l) => `<footer>© 2026 Rafix Technologies · SnapKit · <a href="${l.code === 'bn' ? '/privacy-bn.html' : '/privacy.html'}">${esc(l.ui.footerPrivacy)}</a> · <a href="${homePath(l.code)}">${esc(l.ui.footerHome)}</a></footer></body></html>`;

const write = async (rel, html) => {
  const file = path.join(root, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
};

const abs = (p) => `${siteUrl}${p}`;

// Icons map for the 18 homepage cards
const ICONS_MAP = {
  convert: { cls: 'green', svg: '<path d="M4 8h15l-4-4m4 4-4 4M20 16H5l4 4m-4-4 4-4"/>' },
  resize: { cls: 'lav', svg: '<path d="M8 3H3v5m0-5 7 7M16 21h5v-5m0 5-7-7M16 3h5v5m0-5-7 7M8 21H3v-5m0 5 7-7"/>' },
  clean: { cls: 'peach', svg: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>' },
  palette: { cls: 'blue', svg: '<path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3c-.8-.9-.2-2.3 1-2.3H17a4 4 0 0 0 4-4c0-4.8-4-8.7-9-8.7Z"/><circle cx="7.5" cy="10" r=".9"/><circle cx="11" cy="7" r=".9"/><circle cx="16" cy="9" r=".9"/>' },
  og: { cls: 'lav', svg: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.1m3 0h.1M6 16l3-3 2.5 2.5L15 12l3 4"/>' },
  soon: { cls: 'green', svg: '<path d="m12 2 1.7 7.3L21 12l-7.3 1.7L12 21l-1.7-7.3L3 12l7.3-2.7L12 2Z"/><path d="m19 2 .7 2.3L22 5l-2.3.7L19 8l-.7-2.3L16 5l2.3-.7L19 2Z"/>' },
  compress: { cls: 'green', svg: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.3"/><path d="m4 17 4-4 3 3 3-3 6 5M15 9h5m-2.5-2.5L15 9l2.5 2.5"/>' },
  split: { cls: 'peach', svg: '<path d="M5 3h6v18H5zM13 3h6v18h-6z"/><path d="M8 8h.01M16 8h.01"/>' },
  'pdf-merge': { cls: 'peach', svg: '<path d="M13 3H6a2 2 0 0 0-2 2v13m5-15h7l4 4v10a2 2 0 0 1-2 2h-3"/><path d="M13 3v5h5M4 15h10m-4-4 4 4-4 4"/>' },
  'pdf-extract': { cls: 'blue', svg: '<path d="M6 3h8l4 4v4M14 3v5h5M6 3v18h5"/><path d="M11 15h9m-4-4 4 4-4 4"/>' },
  'pdf-rotate': { cls: 'lav', svg: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2"/>' },
  'pdf-image': { cls: 'green', svg: '<path d="M6 3h8l4 4v5M14 3v5h5M6 3v18h6"/><rect x="12" y="13" width="9" height="7" rx="1.5"/><circle cx="15" cy="15.5" r=".8"/><path d="m13 19 2-2 1.5 1.5 1.5-1.5 2 2"/>' },
  'pdf-info': { cls: 'blue', svg: '<path d="M6 3h8l4 4v5M14 3v5h5M6 3v18h5"/><circle cx="17" cy="17" r="4"/><path d="M17 16v2m0-4h.01"/>' },
  'pdf-to-image': { cls: 'peach', svg: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.3"/><path d="m4 17 5-5 3 3 3-4 5 6"/>' },
  'svg-to-png': { cls: 'lav', svg: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><circle cx="7" cy="8" r="1.2"/><circle cx="17" cy="8" r="1.2"/><circle cx="12" cy="18" r="1.2"/><path d="m8 8 3-4m5 4-3-4m-1 12v-5"/>' },
  'svg-to-jpg': { cls: 'blue', svg: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><circle cx="7" cy="8" r="1.2"/><circle cx="17" cy="8" r="1.2"/><circle cx="12" cy="18" r="1.2"/><path d="m8 8 3-4m5 4-3-4m-1 12v-5"/>' },
  'svg-to-pdf': { cls: 'green', svg: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><circle cx="7" cy="8" r="1.2"/><circle cx="17" cy="8" r="1.2"/><circle cx="12" cy="18" r="1.2"/><path d="m8 8 3-4m5 4-3-4m-1 12v-5"/>' },
  everyday: { cls: 'green', svg: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>' }
};

const CARD_ORDER = [
  'convert', 'resize', 'clean', 'palette', 'og', 'soon',
  'compress', 'split', 'pdf-merge', 'pdf-extract', 'pdf-rotate',
  'pdf-image', 'pdf-info', 'pdf-to-image', 'svg-to-png', 'svg-to-jpg', 'svg-to-pdf'
];

const POPULAR_PILLS = [
  'split-pdf', 'image-compressor', 'webp-to-jpg', 'webp-to-png', 'png-to-webp',
  'jpg-to-webp', 'png-to-jpg', 'jpg-to-png', 'avif-to-jpg', 'merge-pdf',
  'extract-pdf-pages', 'rotate-pdf', 'image-to-pdf', 'pdf-page-count', 'pdf-to-image',
  'svg-to-png', 'svg-to-jpg', 'svg-to-pdf', 'jpg-to-pdf', 'png-to-pdf',
  'pdf-to-jpg', 'pdf-to-png', 'word-counter', 'essay-word-counter', 'json-formatter',
  'password-generator', 'ocr-online', 'image-to-text', 'image-to-word', 'bangla-ocr'
];

const HOME_INLINE_CSS = `:root{--ink:#17251f;--muted:#758078;--line:#e7ebe5;--paper:#f7f8f4;--white:#fff;--green:#caff6c;--deep:#26382e;--lav:#eceaff;--peach:#ffede2;--blue:#e4f2ff}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}button,input,select{font:inherit}button{cursor:pointer}a:focus-visible,button:focus-visible,summary:focus-visible,.tool:focus-visible{outline:3px solid #83a84f;outline-offset:3px}.shell{max-width:1180px;margin:auto;padding:0 30px}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.brand{font-weight:850;letter-spacing:-1px;font-size:23px;text-decoration:none;color:var(--ink);display:flex;gap:9px;align-items:center}.logo{display:grid;place-items:center;width:32px;height:32px;background:var(--green);border-radius:10px;font-size:18px}.navlinks{display:flex;gap:30px;color:#536058;font-size:13px}.navlinks a{color:inherit;text-decoration:none}.navright{display:flex;align-items:center;gap:14px}.pill{background:var(--white);border:1px solid var(--line);border-radius:99px;padding:9px 14px;font-size:12px;font-weight:650}.hero{padding:72px 0 38px;display:grid;grid-template-columns:1fr 360px;gap:30px;align-items:center}.eyebrow{font-size:12px;letter-spacing:1.7px;text-transform:uppercase;font-weight:800;color:#728172}.hero h1{font-size:clamp(46px,6vw,76px);line-height:.99;letter-spacing:-5px;margin:17px 0 19px;max-width:690px}.hero h1 em{font-style:normal;color:#718b4d}.hero p{color:#6c776f;font-size:16px;max-width:530px;margin:0}.hero-card{background:var(--green);border-radius:22px;padding:23px 24px;transform:rotate(2deg);box-shadow:0 16px 34px #27392714}.hero-card .cardcap{font-size:12px;font-weight:800;letter-spacing:1px}.hero-card .big{font-size:46px;font-weight:850;letter-spacing:-3px;line-height:1.1;margin:26px 0 9px}.hero-card p{font-size:13px;color:#35432c}.hero-card .spark{font-size:28px;float:right}.section-head{display:flex;justify-content:space-between;align-items:end;margin:29px 0 15px}.section-head h2{font-size:19px;letter-spacing:-.5px;margin:0}.section-head span{font-size:12px;color:var(--muted)}.tools{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tool{background:var(--white);border:1px solid var(--line);border-radius:18px;padding:19px;min-height:190px;transition:.18s;position:relative;overflow:hidden}.tool:hover{transform:translateY(-3px);box-shadow:0 12px 26px #2031260d}.tool .icon{width:39px;height:39px;border-radius:12px;display:grid;place-items:center;font-size:20px;margin-bottom:17px}.icon.green{background:#edffd7}.icon.lav{background:var(--lav)}.icon.peach{background:var(--peach)}.icon.blue{background:var(--blue)}.tool h3{margin:0 0 6px;font-size:16px;letter-spacing:-.4px}.tool p{margin:0;color:var(--muted);font-size:14px;max-width:270px}.arrow{position:absolute;right:19px;bottom:18px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;width:30px;height:30px;background:white;font-size:16px}.tool:hover .arrow{background:var(--green);border-color:var(--green)}.tool{cursor:pointer}.trust{margin:30px 0 64px;padding:19px 22px;border:1px solid var(--line);border-radius:16px;display:flex;justify-content:space-between;align-items:center;background:#ffffff8c}.trust strong{font-size:13px}.trust span{font-size:12px;color:var(--muted)}.trust .checks{display:flex;gap:20px}.trust .checks span:before{content:'✓';color:#66873f;font-weight:900;margin-right:6px}.footer{border-top:1px solid var(--line);padding:22px 0 30px;display:flex;justify-content:space-between;color:var(--muted);font-size:12px}.overlay{position:fixed;inset:0;background:#12201775;display:none;align-items:center;justify-content:center;padding:20px;z-index:5}.overlay.show{display:flex}.modal{background:white;width:min(600px,100%);max-height:calc(100vh - 40px);overflow-y:auto;overscroll-behavior:contain;border-radius:22px;padding:25px;box-shadow:0 24px 70px #0003}.modal #content>.controls:has(#pdf-run){position:sticky;bottom:0;z-index:2;background:white;padding:10px 0;margin-top:0;box-shadow:0 -8px 14px -12px #0006}@supports(height:100dvh){.modal{max-height:calc(100dvh - 40px)}}.modalhead{display:flex;justify-content:space-between;align-items:start}.modal h2{margin:0;font-size:23px;letter-spacing:-.7px}.modal .sub{color:var(--muted);font-size:13px;margin:5px 0 18px}.close{border:0;background:#f1f3ef;border-radius:50%;width:34px;height:34px;font-size:20px}.drop{border:1.5px dashed #cbd4c9;border-radius:16px;background:#fafbf8;padding:30px;text-align:center}.drop.drag{background:#f2ffdf;border-color:#8cb853}.drop .uploadicon{font-size:30px}.drop strong{display:block;margin:7px 0 3px}.drop small{color:var(--muted)}.btn{border:0;border-radius:10px;background:var(--deep);color:white;padding:10px 15px;font-size:12px;font-weight:700}.drop .btn{margin-top:14px}.controls{display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap}.controls select,.controls input[type=number]{border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:white;color:var(--ink)}.controls label{font-size:12px;color:#647066}.pdf-settings label{font-size:12px;color:#647066}.pdf-settings select,.pdf-settings input[type=number],.pdf-settings input[type=text]{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:white;color:var(--ink)}.pdf-settings input[type=color]{width:54px;height:38px;border:1px solid var(--line);border-radius:8px;background:white}.pdf-settings input[type=range]{width:100%;accent-color:#688b39}.status{font-size:12px;color:#647066;margin:13px 0 0;min-height:20px}.status a{color:#315d20;font-weight:750}.preview{max-width:100%;max-height:180px;border-radius:12px;margin-top:12px;display:none}.ogdemo{border:1px solid var(--line);border-radius:12px;overflow:hidden;max-width:500px}.ogimage{height:180px;background:linear-gradient(135deg,#d7ff9e,#e6e1ff);display:grid;place-items:center;font-size:40px}.ogmeta{padding:12px}.ogmeta b{display:block}.ogmeta small{color:var(--muted)}.colorrow{display:flex;gap:10px;margin-top:14px}.swatch{height:86px;flex:1;border-radius:12px;display:flex;align-items:end;padding:8px;font:10px ui-monospace,monospace;color:#fff;text-shadow:0 1px 3px #0008}.hidden{display:none!important}
@media(max-width:760px){.shell{padding:0 18px}.nav{height:65px}.navlinks{display:none}.hero{grid-template-columns:1fr;padding:48px 0 24px;gap:25px}.hero h1{letter-spacing:-3px}.hero-card{max-width:400px;transform:rotate(0)}.tools{grid-template-columns:repeat(2,1fr)}.trust{align-items:flex-start;gap:14px;flex-direction:column}.trust .checks{gap:10px;flex-wrap:wrap}.section-head{align-items:start;gap:8px;flex-direction:column}}@media(max-width:470px){.tools{grid-template-columns:1fr}.tool{min-height:158px}.hero h1{font-size:48px}.pill{font-size:11px;padding:8px 10px}.footer{gap:12px;flex-direction:column}}`;

function buildInteractiveHomepage(l) {
  const ui = HOME_UI[l.code] || HOME_UI.en;
  const cards = CARD_TEXTS[l.code] || CARD_TEXTS.en;
  const prefix = '../';
  const title = `${l.home.title} | SnapKit`;
  const desc = l.home.desc;

  const ld = [
    { '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': `${abs('/')}#organization`, name: 'Rafix Technologies', url: abs('/') },
      { '@type': 'WebSite', '@id': `${abs(homePath(l.code))}#website`, name: 'SnapKit', url: abs(homePath(l.code)), inLanguage: l.code, publisher: { '@id': `${abs('/')}#organization` } },
      { '@type': 'WebApplication', name: `SnapKit – ${l.home.h1}`, url: abs(homePath(l.code)), inLanguage: l.code, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any device with a modern browser', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc }
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: l.code, mainEntity: l.ui.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ];

  const cardsHtmlStr = CARD_ORDER.map((id) => {
    const info = cards[id] || CARD_TEXTS.en[id];
    const icon = ICONS_MAP[id];
    return `<article class="tool" data-tool="${id}"><div class="icon ${icon.cls}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icon.svg}</svg></div><h3>${esc(info[0])}</h3><p>${esc(info[1])}</p><span class="arrow" aria-hidden="true">↗</span></article>`;
  }).join('\n      ');

  const everydayCard = `<a class="tool" href="${prefix}everyday-tools.html" style="text-decoration:none;color:inherit"><div class="icon ${ICONS_MAP.everyday.cls}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS_MAP.everyday.svg}</svg></div><h3>${esc(cards.everyday[0])}</h3><p>${esc(cards.everyday[1])}</p><span class="arrow" aria-hidden="true">↗</span></a>`;

  const pillsHtml = POPULAR_PILLS.map((s) => {
    const r = routes.find((x) => x.slug === s);
    if (!r) return '';
    return `<a class="pill" href="tools/${s}/">${esc(nameOf(l, r))}</a>`;
  }).filter(Boolean).join('');

  const faqDetailsHtml = l.ui.faq.map(([q, a]) => `<details style="border-top:1px solid var(--line);padding:15px 0"><summary style="font-weight:700;cursor:pointer">${esc(q)}</summary><p style="color:var(--muted);font-size:13px">${esc(a)}</p></details>`).join('');

  const configsEntries = CARD_ORDER.map((id) => {
    const info = cards[id] || CARD_TEXTS.en[id];
    return `${JSON.stringify(id)}:[${JSON.stringify(info[0])},${JSON.stringify(info[1])}]`;
  }).join(',');

  const looseStyle = LOOSE_LETTERS.has(l.code) ? '.hero h1,.hero-card .big,.modal h2,.section-head h2{letter-spacing:0}.hero h1{line-height:1.2}' : '';

  const isBn = l.code === 'bn';
  const dropHtml = isBn
    ? '<div class="drop" id="drop"><div class="uploadicon">＋</div><strong>ছবি এখানে ছাড়ুন</strong><small>অথবা ডিভাইস থেকে একটি ছবি বাছুন</small><br><button class="btn" id="browse">ছবি বাছুন</button><input id="file" type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg,.avif,.gif" class="hidden"><img class="preview" id="preview" alt=""></div><div class="controls" id="controls"></div><p class="status" id="status">ফাইল আপনার ব্রাউজারেই থাকবে।</p>'
    : '<div class="drop" id="drop"><div class="uploadicon">＋</div><strong>Drop an image here</strong><small>or choose an image from your device</small><br><button class="btn" id="browse">Choose image</button><input id="file" type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg,.avif,.gif" class="hidden"><img class="preview" id="preview" alt=""></div><div class="controls" id="controls"></div><p class="status" id="status">Your file stays in your browser.</p>';

  const initialModalTitle = esc(cards.convert[0]);
  const initialModalSub = esc(cards.convert[1]);

  return `<!doctype html>
<html lang="${l.code}" dir="${l.dir}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#f7f8f4"><meta name="color-scheme" content="light">
  <meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:locale" content="${l.og}">
  <meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
  <meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
  <link rel="stylesheet" href="${prefix}tool-search.css">
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ')}
  <style>${HOME_INLINE_CSS}${looseStyle}</style>
  <link rel="stylesheet" href="${prefix}theme.css"><script src="${prefix}theme.js"></script><link rel="stylesheet" href="${prefix}site-chrome.css">
</head>
<body>
  <!--sk-nav--><header class="top"><a class="brand" href="./">✳ snapkit</a></header><!--/sk-nav-->
  <main class="shell">
    <section class="hero">
      <div>
        <div class="eyebrow">${esc(ui.eyebrow)}</div>
        <h1>${esc(l.home.h1)}</h1>
        <p>${esc(l.home.lead)}</p>
      </div>
      <aside class="hero-card">
        <span class="spark">✳</span>
        <div class="cardcap">${esc(ui.promise.cardcap)}</div>
        <div class="big">${ui.promise.big}</div>
        <p>${esc(ui.promise.desc)}</p>
      </aside>
    </section>
    <section id="tools">
      <div class="section-head">
        <h2>${esc(ui.whatToDo)}</h2>
        <span>${esc(ui.noSignUp)}</span>
      </div>
      <label class="tool-search">
        <span aria-hidden="true">⌕</span>
        <input id="tool-search" type="search" placeholder="${esc(ui.searchPlaceholder)}" aria-label="${esc(ui.searchAria)}" autocomplete="off">
        <kbd>/</kbd>
      </label>
      <p id="tool-search-status" class="tool-search-status" aria-live="polite"></p>
      <div class="tools" id="main-tool-grid">
      ${cardsHtmlStr}
      ${everydayCard}
      </div>
    </section>
    <section id="popular" style="margin:0 0 48px">
      <div class="section-head">
        <h2>${esc(l.home.h2)}</h2>
        <span>${esc(ui.popularSub)}</span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${pillsHtml}
      </div>
    </section>
    <section class="trust" id="how">
      <strong>${esc(ui.trustStrong)}</strong>
      <div class="checks">
        ${ui.checks.map((c) => `<span>${esc(c)}</span>`).join('')}
      </div>
    </section>
    <section style="max-width:760px;margin:0 auto 64px" aria-labelledby="faq-title">
      <div class="section-head"><h2 id="faq-title">${esc(l.ui.faqTitle)}</h2></div>
      ${faqDetailsHtml}
    </section>
  </main>
  <!--sk-footer--><footer>SnapKit</footer><!--/sk-footer-->
  <div class="overlay" id="overlay">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modalhead">
        <div>
          <h2 id="modal-title">${initialModalTitle}</h2>
          <p class="sub" id="modal-sub">${initialModalSub}</p>
        </div>
        <button class="close" id="close" aria-label="${esc(ui.closeLabel)}">×</button>
      </div>
      <div id="content"></div>
    </section>
  </div>
  <noscript><div class="shell" style="padding:18px;background:#fff4d8;border-radius:12px">${esc(ui.noscript)}</div></noscript>
  <script src="${prefix}pdf-tools.js?v=2"></script>
  <script src="${prefix}compress-tool.js?v=2"></script>
  <script src="${prefix}split-tool.js?v=1"></script>
  ${isBn ? '' : `<script src="${prefix}english-ui.js"></script>`}
  <script>
  (()=>{
    const overlay=document.querySelector('#overlay'),title=document.querySelector('#modal-title'),sub=document.querySelector('#modal-sub'),content=document.querySelector('#content');
    let current='convert',file=null,img=null,vectorConversion=false,lastFocus=null;
    const routeParams=new URLSearchParams(location.search);
    const configs={${configsEntries}};
    function openTool(tool){
      lastFocus=document.activeElement;
      current=tool;file=null;img=null;vectorConversion=false;
      if(configs[tool]){title.textContent=configs[tool][0];sub.textContent=configs[tool][1];}
      render();
      if((tool==='convert'||tool.startsWith('svg-to-'))&&routeParams.get('format')){
        const sel=document.querySelector('#format');
        if(sel&&[...sel.options].some(o=>o.value===routeParams.get('format')))sel.value=routeParams.get('format');
      }
      overlay.classList.add('show');
      document.querySelector('#close').focus({preventScroll:true});
    }
    function render(){
      if(current==='compress'){window.SnapKitCompress.render(content);return;}
      if(current==='split'){window.SnapKitSplit.render(content);return;}
      if(current.startsWith('pdf-')||current==='svg-to-pdf'){window.SnapKitPdf.render(current,content);return;}
      if(current==='svg-to-png'||current==='svg-to-jpg'){
        const svgTool=current;vectorConversion=true;current='convert';
        routeParams.set('format',svgTool==='svg-to-jpg'?'image/jpeg':'image/png');
      }
      if(current==='og'){
        content.innerHTML=${isBn ? `'<label style="font-size:12px">শিরোনাম<input id="ogtitle" value="SnapKit — ছোট কাজ, ঝটপট শেষ" style="width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin:5px 0 12px"></label><label style="font-size:12px">বর্ণনা<input id="ogdesc" value="দ্রুত, ফ্রি ব্রাউজার টুল—কোনো অ্যাকাউন্ট লাগবে না।" style="width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin:5px 0 14px"></label><div class="ogdemo"><div class="ogimage">✳</div><div class="ogmeta"><small>SNAPKITTOOLS.ONLINE</small><b id="ogouttitle"></b><small id="ogoutdesc"></small></div></div>'` : `'<label style="font-size:12px">Title<input id="ogtitle" value="SnapKit — Free Online Tools" style="width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin:5px 0 12px"></label><label style="font-size:12px">Description<input id="ogdesc" value="Fast, free browser tools — no account required." style="width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin:5px 0 14px"></label><div class="ogdemo"><div class="ogimage">✳</div><div class="ogmeta"><small>SNAPKITTOOLS.ONLINE</small><b id="ogouttitle"></b><small id="ogoutdesc"></small></div></div>'`};
        const update=()=>{document.querySelector('#ogouttitle').textContent=document.querySelector('#ogtitle').value;document.querySelector('#ogoutdesc').textContent=document.querySelector('#ogdesc').value;};
        content.querySelectorAll('input').forEach(x=>x.addEventListener('input',update));
        update();
        return;
      }
      if(current==='soon'){
        content.innerHTML=${isBn ? `'<p style="color:#758078">আমরা আরও দরকারি ছোট টুল যোগ করছি। এখন ছবি কনভার্ট, রিসাইজ, EXIF পরিষ্কার ও কালার প্যালেট ব্যবহার করতে পারবেন।</p>'` : `'<p style="color:#758078">More free tools are on the way. You can currently convert images, resize photos, remove metadata, and generate color palettes.</p>'`};
        return;
      }
      content.innerHTML=${JSON.stringify(dropHtml)};
      const input=document.querySelector('#file'),drop=document.querySelector('#drop');
      document.querySelector('#browse').onclick=()=>input.click();
      input.onchange=()=>{if(input.files[0])load(input.files[0]);};
      drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag');};
      drop.ondragleave=()=>drop.classList.remove('drag');
      drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag');if(e.dataTransfer.files[0])load(e.dataTransfer.files[0]);};
      if(current==='convert')document.querySelector('#controls').innerHTML='<label>${isBn ? 'ফরম্যাট' : 'Format'}</label><select id="format"><option value="image/png">PNG</option><option value="image/bmp">BMP</option></select>'+(vectorConversion?'<label>${isBn ? 'আউটপুট প্রস্থ (px, ঐচ্ছিক)' : 'Output width (px, optional)'}</label><input id="vector-width" type="number" min="1" max="12000" placeholder="${isBn ? 'SVG-এর মূল প্রস্থ' : 'Original width'}"><label>${isBn ? 'আউটপুট উচ্চতা (px, ঐচ্ছিক)' : 'Output height (px, optional)'}</label><input id="vector-height" type="number" min="1" max="12000" placeholder="${isBn ? 'SVG-এর মূল উচ্চতা' : 'Original height'}"><label>${isBn ? 'JPG-এর মান' : 'JPG quality'}</label><input id="vector-quality" type="range" min="40" max="100" value="92"><label>${isBn ? 'স্বচ্ছ অংশের পেছনের রং' : 'Background for transparency'}</label><input id="vector-background" type="color" value="#ffffff">':'')+'<button class="btn" id="run">${isBn ? 'কনভার্ট ও ডাউনলোড' : 'Convert and download'}</button>';
      if(current==='resize')document.querySelector('#controls').innerHTML='<label>${isBn ? 'প্রস্থ' : 'Width'}</label><input type="number" id="width" min="1" placeholder="px" style="width:82px"><label>${isBn ? 'উচ্চতা' : 'Height'}</label><input type="number" id="height" min="1" placeholder="px" style="width:82px"><button class="btn" id="run">${isBn ? 'রিসাইজ ও ডাউনলোড' : 'Resize and download'}</button>';
      if(current==='clean')document.querySelector('#controls').innerHTML='<button class="btn" id="run">${isBn ? 'পরিষ্কার কপি ডাউনলোড' : 'Download clean copy'}</button>';
      if(current==='palette')document.querySelector('#controls').innerHTML='<button class="btn" id="run">${isBn ? 'রঙ বের করুন' : 'Extract colors'}</button>';
      document.querySelector('#run').onclick=process;
      if(current==='convert'){(async()=>{
        const sel=document.querySelector('#format'),probe=document.createElement('canvas');probe.width=probe.height=1;
        for(const [type,label] of [['image/jpeg','JPG'],['image/webp','WebP'],['image/avif','AVIF']]){
          const blob=await new Promise(resolve=>probe.toBlob(resolve,type,.9));
          if(blob&&blob.type===type)sel.add(new Option(label,type));
          if(routeParams.get('format')===type)sel.value=type;
        }
      })()}
    }
    function load(f){
      if(!f.type.startsWith('image/')&&!/\\.(jpg|jpeg|png|webp|heic|heif|tif|tiff|bmp|svg|avif|gif)$/i.test(f.name)){
        setStatus(${isBn ? `'একটি ছবি ফাইল বেছে নিন।'` : `'Choose an image file.'`});
        return;
      }
      file=f;const url=URL.createObjectURL(f);img=new Image();
      img.onload=()=>{
        const p=document.querySelector('#preview');p.src=url;p.style.display='block';
        setStatus(\`\${f.name} · \${img.naturalWidth} × \${img.naturalHeight} px · \${${isBn ? `'ফাইল সফলভাবে যোগ হয়েছে। ব্রাউজারেই আছে; সার্ভারে আপলোড হয়নি।'` : `'File added successfully. Safe in your browser; not uploaded.'`}}\`);
      };
      img.onerror=()=>setStatus(${isBn ? `'এই ফরম্যাটটি এই ব্রাউজারে খোলা যাচ্ছে না। JPEG বা PNG রূপান্তর করে চেষ্টা করুন।'` : `'This browser cannot open this format. Try converting it to JPEG or PNG.'`});
      img.src=url;
    }
    function setStatus(s){const n=document.querySelector('#status');if(n)n.textContent=s;}
    function canvas(w,h,background){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,w,h);}ctx.drawImage(img,0,0,w,h);return c;}
    function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
    function encodeBmp(c){const w=c.width,h=c.height,row=Math.ceil(w*3/4)*4,size=54+row*h,pixels=c.getContext('2d').getImageData(0,0,w,h).data,bytes=new Uint8Array(size),v=new DataView(bytes.buffer);v.setUint16(0,0x4d42,true);v.setUint32(2,size,true);v.setUint32(10,54,true);v.setUint16(14,40,true);v.setInt32(18,w,true);v.setInt32(22,h,true);v.setUint16(26,1,true);v.setUint16(28,24,true);v.setUint32(34,row*h,true);v.setInt32(38,2835,true);v.setInt32(42,2835,true);for(let y=0;y<h;y++){const dest=54+(h-1-y)*row;for(let x=0;x<w;x++){const src=(y*w+x)*4,at=dest+x*3;bytes[at]=pixels[src+2];bytes[at+1]=pixels[src+1];bytes[at+2]=pixels[src];}}return bytes;}
    function process(){
      if(!img){setStatus(${isBn ? `'আগে একটি ছবি বেছে নিন।'` : `'Choose an image first.'`});return;}
      if(current==='palette'){
        const c=canvas(80,80),ctx=c.getContext('2d'),data=ctx.getImageData(0,0,80,80).data,bins={};
        for(let i=0;i<data.length;i+=16){const r=data[i]>>4,g=data[i+1]>>4,b=data[i+2]>>4,k=(r<<8)|(g<<4)|b;bins[k]=(bins[k]||0)+1;}
        const top=Object.entries(bins).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>{const n=Number(k),r=((n>>8)&15)*17,g=((n>>4)&15)*17,b=(n&15)*17;return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');});
        const out=document.createElement('div');out.className='colorrow';out.innerHTML=top.map(c=>\`<div class="swatch" style="background:\${c}">\${c.toUpperCase()}</div>\`).join('');
        document.querySelector('#controls').after(out);
        setStatus(${isBn ? `'রঙগুলো ছবির আনুমানিক প্রধান রং।'` : `'These are approximate prominent colors from the image.'`});
        return;
      }
      const selected=current==='convert'?document.querySelector('#format').value:'image/png';
      let c;
      if(current==='resize'){
        const w=Number(document.querySelector('#width').value)||img.naturalWidth,h=Number(document.querySelector('#height').value)||img.naturalHeight;
        if(w>8000||h>8000||w<1||h<1){setStatus(${isBn ? `'মাপ ১ থেকে ৮০০০ পিক্সেলের মধ্যে দিন।'` : `'Enter dimensions between 1 and 8,000 pixels.'`});return;}
        c=canvas(w,h);
      }else{
        const widthInput=vectorConversion?Number(document.querySelector('#vector-width').value):0,heightInput=vectorConversion?Number(document.querySelector('#vector-height').value):0;
        let w=widthInput||img.naturalWidth,h=heightInput||img.naturalHeight;
        if(vectorConversion&&widthInput&&!heightInput)h=Math.round(img.naturalHeight*w/img.naturalWidth);
        if(vectorConversion&&heightInput&&!widthInput)w=Math.round(img.naturalWidth*h/img.naturalHeight);
        if(w>12000||h>12000||w<1||h<1){setStatus(${isBn ? `'SVG output-এর মাপ ১ থেকে ১২০০০ পিক্সেলের মধ্যে দিন।'` : `'SVG output size must be between 1 and 12,000 pixels.'`});return;}
        const bg=selected==='image/jpeg'?(vectorConversion?document.querySelector('#vector-background').value:'#fff'):null;
        c=canvas(w,h,bg);
      }
      if(selected==='image/bmp'){finish(new Blob([encodeBmp(c)],{type:'image/bmp'}));return;}
      c.toBlob(finish,selected,vectorConversion?Number(document.querySelector('#vector-quality').value)/100:.92);
      function finish(blob){
        if(!blob){setStatus(${isBn ? `'এই ফরম্যাটে রূপান্তর সম্ভব হয়নি। অন্য ফরম্যাট চেষ্টা করুন।'` : `'This format could not be converted. Try another format.'`});return;}
        const type=blob.type||'image/png',ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','image/bmp':'bmp'}[type]||'png';
        download(blob,\`\${file.name.replace(/.[^.]+$/,'')}-\${current==='clean'?'clean':current==='resize'?'resized':'converted'}.\${ext}\`);
        setStatus(type!==selected?(${isBn ? `'এই ব্রাউজারে নির্বাচিত ফরম্যাটটি সমর্থিত নয়; PNG ফাইল ডাউনলোড হয়েছে.'` : `'This browser does not support the selected format; a PNG file was downloaded.'`}):current==='clean'?(${isBn ? `'পরিষ্কার কপি ডাউনলোড হয়েছে।'` : `'Clean copy downloaded.'`}):(${isBn ? `'কাজ শেষ—ফাইল ডাউনলোড হয়েছে।'` : `'Done — your file has been downloaded.'`}));
      }
    }
    document.querySelectorAll('.tool[data-tool]').forEach(el=>{
      el.setAttribute('role','button');el.tabIndex=0;
      el.onclick=()=>openTool(el.dataset.tool);
      el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTool(el.dataset.tool);}};
    });
    function closeTool(){overlay.classList.remove('show');if(lastFocus&&lastFocus!==document.body&&lastFocus.isConnected)lastFocus.focus();}
    document.querySelector('#close').onclick=closeTool;
    overlay.onclick=e=>{if(e.target===overlay)closeTool();};
    document.addEventListener('keydown',e=>{
      if(!overlay.classList.contains('show'))return;
      if(e.key==='Escape'){closeTool();return;}
      if(e.key!=='Tab')return;
      const focusable=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(el=>!el.hidden);
      if(!focusable.length){e.preventDefault();return;}
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    if(['convert','compress','split','pdf-merge','pdf-extract','pdf-rotate','pdf-image','pdf-info','pdf-to-image','svg-to-png','svg-to-jpg','svg-to-pdf'].includes(routeParams.get('tool')))openTool(routeParams.get('tool'));
  })();
  </script>
  <script src="${prefix}tool-search.js" defer></script>
  <script src="${prefix}site-chrome.js" defer></script>
</body>
</html>`;
}

let pages = 0;
for (const l of langs) {
  const faq = l.ui.faq;
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: l.code, mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const faqHtml = `<section><h2>${esc(l.ui.faqTitle)}</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`;

  // --- Individual tool pages (depth 3) ---
  for (const r of routes) {
    const name = nameOf(l, r);
    const kind = kindOf(r);
    const pair = pairOf(r);
    const [a, b] = pair || ['', ''];
    const leadKey = pair ? 'convert' : kind;
    const stepsKey = kind === 'convert' ? 'convert' : kind;
    const lead = fill(l.ui.lead[leadKey], a, b);
    const steps = l.ui.steps[stepsKey].map((s) => fill(s, a, b));
    const cta = ctaOf(l, r);
    const ctaLabel = pair && kind === 'convert' ? fill(l.ui.convertCta, a, b) : l.ui.openTool;
    const title = `${name} – ${l.ui.suffix} | SnapKit`;
    const description = `${name}: ${l.ui.descTool}`;
    const url = abs(toolPath(l.code, r.slug));
    const same = routes.filter((x) => x.slug !== r.slug && kindOf(x) === kind);
    const start = Math.max(0, routes.indexOf(r) % Math.max(1, same.length - 3));
    const related = same.slice(start, start + 4);
    const ld = [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name, description, url, inLanguage: l.code, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any device with a compatible modern browser', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'Rafix Technologies' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'SnapKit', item: abs(homePath(l.code)) }, { '@type': 'ListItem', position: 2, name: l.ui.allTools, item: abs(dirPath(l.code)) }, { '@type': 'ListItem', position: 3, name, item: url }] },
      faqLd
    ];
    const html = `${head({ l, title, description, ld, depth: 3 })}
${header(l)}<main><p class="eyebrow">${esc(l.ui.suffix.toUpperCase())}</p><h1>${esc(name)}</h1><p class="lead">${esc(lead)}</p>
<a class="cta" href="${esc(cta.href)}">${esc(ctaLabel)} <span>↗</span></a>
<p class="privacy">✳ ${esc(l.ui.privacy)}</p>${cta.english && l.ui.uiNote ? `<p class="note">${esc(l.ui.uiNote)}</p>` : ''}
<section><h2>${esc(l.ui.howTo)}</h2><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
${faqHtml}
<nav class="related" aria-label="${esc(l.ui.related)}"><b>${esc(l.ui.related)}</b>${related.map((x) => `<a href="../${x.slug}/">${esc(nameOf(l, x))}</a>`).join('')}</nav>
${switcher(l, (c) => toolPath(c, r.slug))}</main>${footer(l)}`;
    await write(`${l.code}/tools/${r.slug}/index.html`, html);
    pages++;
  }

  // --- Tools directory (depth 2) ---
  {
    const title = `${l.ui.allTools} – ${l.ui.suffix} | SnapKit`;
    // Give the collection page a distinct description instead of duplicating the homepage snippet.
    const description = l.home.lead;
    const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: abs(dirPath(l.code)), inLanguage: l.code, isPartOf: { '@type': 'WebSite', name: 'SnapKit', url: abs('/') } }];
    const html = `${head({ l, title, description, ld, depth: 2 }).replace('</head>', `<style>${CARD_CSS}</style></head>`)}
${header(l)}<main class="hub"><p class="eyebrow">${esc(l.ui.suffix.toUpperCase())}</p><h1>${esc(l.ui.allTools)}</h1><p class="lead">${esc(l.home.lead)}</p>
${cardsHtml(routes.map((r) => { const pr = pairOf(r); const [a, b] = pr || ['', '']; return { r, href: `./${r.slug}/`, name: nameOf(l, r), desc: fill(l.ui.lead[pr ? 'convert' : kindOf(r)], a, b) }; }), l.code)}
${switcher(l, dirPath)}</main>${footer(l)}`;
    await write(`${l.code}/tools/index.html`, html);
    pages++;
  }

  // --- Full interactive application homepage (depth 1) ---
  const homeHtml = buildInteractiveHomepage(l);
  await write(`${l.code}/index.html`, homeHtml);
  pages++;
}
console.log(`Generated ${pages} localized pages for ${langs.length} languages: ${langs.map((l) => l.code).join(', ')}`);
