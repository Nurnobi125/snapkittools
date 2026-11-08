import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import { cardsHtml, CARD_CSS } from './tool-cards.mjs';
const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8'));
const seo = JSON.parse(await readFile(path.join(root, 'data/seo-content.json'), 'utf8'));
const config = JSON.parse(await readFile(path.join(root, 'site-config.json'), 'utf8'));
const siteUrl = String(config.siteUrl || '').trim().replace(/\/$/, '');
let validSiteUrl = false;
try {
  const parsedSiteUrl = new URL(siteUrl);
  validSiteUrl = parsedSiteUrl.protocol === 'https:' && !parsedSiteUrl.username && !parsedSiteUrl.password && !parsedSiteUrl.search && !parsedSiteUrl.hash && !siteUrl.includes('YOUR-USERNAME');
} catch {}
const publishable = validSiteUrl;
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const link = (route) => `../${route.slug}/`;

for (const route of routes) {
  const s = seo[route.slug] || {};
  const description = s.description || route.description;
  const pdfTool = route.kind === 'pdf';
  const utilityTool = route.kind === 'utility';
  const url = `${siteUrl}/tools/${route.slug}/`;
  const relatedSlugs = s.related || route.relatedSlugs;
  const related = relatedSlugs
    ? relatedSlugs.map((slug) => routes.find((item) => item.slug === slug)).filter(Boolean)
    : routes.filter((item) => item.slug !== route.slug && (item.kind === route.kind)).slice(0, 3);
  const heading = pdfTool || utilityTool ? route.heading : `${route.from} to ${route.to} Converter`;
  const displayTitle = (s.title || route.title).replace(/\s*[—|]\s*SnapKit$/i, '');
  const howTitle = pdfTool || utilityTool ? route.howTitle : `How to convert ${route.from} to ${route.to}`;
  const actionUrl = utilityTool ? `../../everyday-tools.html?tool=${route.tool}` : pdfTool ? `../../index.html?tool=${route.tool}${route.actionQuery ? `&amp;${route.actionQuery}` : ''}#tools` : `../../index.html?tool=convert&amp;format=${encodeURIComponent(route.mime)}#tools`;
  const actionLabel = pdfTool || utilityTool ? route.actionLabel : `Choose ${route.from} file`;
  const steps = pdfTool || utilityTool ? route.steps : [`Choose a ${route.from} image from your device.`, `Select ${route.to} as the output format if it is not already selected.`, 'Convert and download the new image.'];
  const categoryBase = pdfTool ? 'FREE ONLINE PDF TOOL' : utilityTool ? 'FREE ONLINE BROWSER TOOL' : 'FREE ONLINE IMAGE CONVERTER';
  const faqWhat = pdfTool || utilityTool ? route.faq : `Is this ${route.from} to ${route.to} converter free?`;
  const inputQuestionBase = utilityTool ? 'Is my input uploaded?' : route.slug === 'svg-to-pdf' ? 'Are my SVG files uploaded?' : pdfTool ? (route.tool === 'pdf-image' ? 'Are my images uploaded?' : 'Are my PDF files uploaded?') : 'Do you upload or store my image?';
  const inputAnswerBase = utilityTool ? 'No. This tool runs in your browser, and the text or values you enter are not sent to SnapKit.' : route.slug === 'svg-to-pdf' ? 'No. The SVG is read and rasterized in your browser. pdf-lib loads from a CDN when needed, but the selected SVG bytes stay in this browser tab.' : pdfTool ? (route.tool === 'pdf-image'
    ? 'No. Images are read locally by your browser, and the PDF library is fetched from the CDN on first use. Your selected image bytes are not sent to the CDN.'
    : route.tool === 'pdf-to-image'
      ? 'No. PDF.js loads from the CDN on first use to render a page, but the selected PDF bytes stay in this browser tab.'
      : 'No. Processing happens in this tab. The PDF library is fetched from the CDN on first use, but your selected PDF bytes are not sent to that service.')
    : 'No. The image is read locally by your browser and the converted copy is downloaded to your device. GitHub Pages may process normal website request logs as the host.';
  const relatedLabel = route.relatedLabel ? route.relatedLabel : route.slug === 'svg-to-pdf' ? 'Related SVG and PDF tools' : pdfTool ? 'Related PDF tools' : utilityTool ? 'Related tools' : 'Related converters';
  const whyAnswer = route.whyA ? esc(route.whyA) : route.tool === 'pdf-image' ? 'Very large images, or formats your browser cannot read, may fail. Try a current browser, or convert the image to JPG or PNG first.' : route.slug === 'svg-to-pdf' ? 'Some SVG features and external resources may not render in a browser canvas. Try embedding the artwork and fonts in the SVG, then use a current browser.' : pdfTool ? 'Some encrypted, damaged, or unusually complex PDFs may not be supported. Use a current browser and a PDF without a password.' : utilityTool ? route.detail : `Image decoding depends on your browser. ${esc(route.from)} files may not be supported on every device. Try a current browser or use a local image app that supports the file.`;
  const ogTitle = `${displayTitle} — SnapKit`;
  const extraFaq = s.faq || [];
  const faqAnswer = route.faqAnswer || 'Yes. It is free to use, needs no account, and runs in your browser.';
  const banglaHref = route.banglaHref || (pdfTool ? `../../index-bn.html?tool=${route.tool}${route.actionQuery ? `&amp;${route.actionQuery}` : ''}#tools` : utilityTool ? '../../index-bn.html' : actionUrl.replace('../../index.html', '../../index-bn.html'));
  const category = route.category || categoryBase;
  const inputQuestion = route.inputQ || inputQuestionBase;
  const inputAnswer = route.inputA || inputAnswerBase;
  const faqItems = [[faqWhat, faqAnswer], [inputQuestion, inputAnswer], [utilityTool ? "What if the result doesn't look right?" : "Why can't my file open or tool run?", whyAnswer.replace(/<[^>]+>/g, '')], ...extraFaq];
  const faqLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>`;
  const crumbLd = publishable ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` }, { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/tools/` }, { '@type': 'ListItem', position: 3, name: heading, item: url }] })}</script>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f7f8f4">
<meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:locale" content="en_US"><meta property="og:title" content="${esc(ogTitle)}"><meta property="og:description" content="${esc(description)}">${publishable ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(ogTitle)}"><meta name="twitter:description" content="${esc(description)}">${publishable ? `<link rel="canonical" href="${url}">` : ''}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: displayTitle, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any device with a compatible modern browser', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description, ...(publishable ? { url } : {}) })}</script>
${faqLd}${crumbLd}<title>${esc(displayTitle)} | SnapKit</title><link rel="stylesheet" href="../../tool-pages.css"><link rel="stylesheet" href="../../theme.css"><script src="../../theme.js"></script></head>
<body><header class="top"><a class="brand" href="../../">✳ snapkit</a><a class="back" href="../../tools/">All tools</a> <a class="back" href="../../applications.html">Windows apps</a></header>
<main><p class="eyebrow">${category}</p><h1>${esc(heading)}</h1><p class="lead">${esc(route.intro)}</p>
${route.inline ? `<div data-ocr-app data-lang="${route.ocrLang || 'eng'}"></div>\n<p class="privacy">✳ ${esc(route.privacyNote)}</p>` : `<a class="cta" href="${actionUrl}">${esc(actionLabel)} <span>↗</span></a>\n<p class="privacy">✳ ${utilityTool ? 'Your text and values stay in your browser. Nothing is sent to SnapKit.' : 'Files are processed in your browser. They are not uploaded to SnapKit.'}</p>`}
<section><h2>${esc(howTitle)}</h2><ol>${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol><p>${esc(route.detail)}</p>${s.extra ? `<p>${esc(s.extra)}</p>` : ''}</section>
<section><h2>Frequently asked questions</h2><details><summary>${esc(faqWhat)}</summary><p>${esc(faqAnswer)}</p></details><details><summary>${esc(inputQuestion)}</summary><p>${esc(inputAnswer)}</p></details><details><summary>${esc(utilityTool ? "What if the result doesn't look right?" : "Why can't my file open or tool run?")}</summary><p>${whyAnswer}</p></details>${extraFaq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<nav class="related" aria-label="${relatedLabel}"><b>${relatedLabel}</b>${related.map((item) => `<a href="${link(item)}">${esc(item.heading || `${item.from} to ${item.to}`)}</a>`).join('')}</nav>
</main><footer>© 2026 Rafix Technologies · SnapKit · <a href="../../privacy.html">Privacy</a> · <a href="../../">Home</a></footer>${route.inline ? '<script src="../../ocr-tool.js" defer></script>' : ''}</body></html>`;
  const dir = path.join(root, 'tools', route.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

const toolDirectory = path.join(root, 'tools');
await mkdir(toolDirectory, { recursive: true });
const toolDirectoryUrl = `${siteUrl}/tools/`;
const toolDirectoryHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Browse all free online tools in one place: image compressor, PDF merge and split, converters, text, developer and calculator tools."><meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:title" content="All Free Online Tools and Converters — SnapKit"><meta property="og:description" content="Browse free PDF, image, SVG, text, developer, calculator, and converter tools. They run in your browser."><meta name="twitter:card" content="summary"><meta name="twitter:title" content="All Free Online Tools and Converters — SnapKit"><meta name="twitter:description" content="Browse free PDF, image, SVG, text, developer, calculator, and converter tools."><title>All Free Online Tools and Converters — SnapKit</title><link rel="stylesheet" href="../tool-pages.css"><link rel="stylesheet" href="../theme.css"><style>${CARD_CSS}</style><script src="../theme.js"></script>${publishable ? `<meta property="og:url" content="${toolDirectoryUrl}"><link rel="canonical" href="${toolDirectoryUrl}">` : ''}<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'All Free Online Tools and Converters — SnapKit', description: 'Browse free PDF, image, SVG, text, developer, calculator, and converter tools.', ...(publishable ? { url: toolDirectoryUrl } : {}), isPartOf: { '@type': 'WebSite', name: 'SnapKit' } })}</script></head><body><header class="top"><a class="brand" href="../">✳ snapkit</a><a class="back" href="../everyday-tools.html">700+ everyday tools</a> <a class="back" href="../applications.html">Windows apps</a></header><main class="hub"><p class="eyebrow">FREE ONLINE TOOLS</p><h1>All tools and converters</h1><p class="lead">All online tools in one place: compress images, merge and split PDF, convert images, plus text, developer, calculator and unit-conversion tools. Everything runs in your browser.</p>${cardsHtml(routes.map((route) => ({ r: route, href: `${route.slug}/`, name: route.heading || `${route.from} to ${route.to}`, desc: route.description })), 'en')}</main><footer>© 2026 Rafix Technologies · SnapKit · <a href="../privacy.html">Privacy</a> · <a href="../">Home</a></footer></body></html>`;
await writeFile(path.join(toolDirectory, 'index.html'), toolDirectoryHtml, 'utf8');

console.log('Generated English tool pages and the tool directory. Run `node scripts/build-seo.mjs` to also build localized pages, hreflang, canonical tags, sitemap.xml and robots.txt.');
