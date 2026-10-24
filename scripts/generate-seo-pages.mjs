import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8'));
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
  const pdfTool = route.kind === 'pdf';
  const utilityTool = route.kind === 'utility';
  const url = `${siteUrl}/tools/${route.slug}/`;
  const related = routes.filter((item) => item.slug !== route.slug && (item.kind === route.kind)).slice(0, 3);
  const heading = pdfTool || utilityTool ? route.heading : `${route.from} to ${route.to} Converter`;
  const displayTitle = route.title.replace(/\s*[—|]\s*SnapKit$/i, '');
  const howTitle = pdfTool || utilityTool ? route.howTitle : `How to convert ${route.from} to ${route.to}`;
  const actionUrl = utilityTool ? `../../everyday-tools.html?tool=${route.tool}` : pdfTool ? `../../index.html?tool=${route.tool}#tools` : `../../index.html?tool=convert&amp;format=${encodeURIComponent(route.mime)}#tools`;
  const actionLabel = pdfTool || utilityTool ? route.actionLabel : `Choose ${route.from} file`;
  const steps = pdfTool || utilityTool ? route.steps : [`Choose a ${route.from} image from your device.`, `Select ${route.to} as the output format if it is not already selected.`, 'Convert and download the new image.'];
  const category = pdfTool ? 'FREE ONLINE PDF TOOL' : utilityTool ? 'FREE ONLINE BROWSER TOOL' : 'FREE ONLINE IMAGE CONVERTER';
  const faqWhat = pdfTool || utilityTool ? route.faq : `Is this ${route.from} to ${route.to} converter free?`;
  const inputQuestion = utilityTool ? 'Is my input uploaded?' : pdfTool ? (route.tool === 'pdf-image' ? 'Are my images uploaded?' : 'Are my PDF files uploaded?') : 'Do you upload or store my image?';
  const inputAnswer = utilityTool ? 'No. This tool runs in your browser, and the text or values you enter are not sent to SnapKit.' : pdfTool ? (route.tool === 'pdf-image'
    ? 'No. Images are read locally by your browser, and the PDF library is fetched from the CDN on first use. Your selected image bytes are not sent to the CDN.'
    : route.tool === 'pdf-to-image'
      ? 'No. PDF.js loads from the CDN on first use to render a page, but the selected PDF bytes stay in this browser tab.'
      : 'No. Processing happens in this tab. The PDF library is fetched from the CDN on first use, but your selected PDF bytes are not sent to that service.')
    : 'No. The image is read locally by your browser and the converted copy is downloaded to your device. GitHub Pages may process normal website request logs as the host.';
  const relatedLabel = pdfTool ? 'Related PDF tools' : utilityTool ? 'Related tools' : 'Related converters';
  const whyAnswer = pdfTool ? 'Some encrypted, damaged, or unusually complex PDFs may not be supported. Use a current browser and a PDF without a password.' : utilityTool ? route.detail : `Image decoding depends on your browser. ${esc(route.from)} files may not be supported on every device. Try a current browser or use a local image app that supports the file.`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(route.description)}"><meta name="theme-color" content="#f7f8f4">
<meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:locale" content="en_US"><meta property="og:title" content="${esc(route.title)}"><meta property="og:description" content="${esc(route.description)}">${publishable ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(route.title)}"><meta name="twitter:description" content="${esc(route.description)}">${publishable ? `<link rel="canonical" href="${url}">` : ''}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: route.title, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any device with a compatible modern browser', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: route.description, ...(publishable ? { url } : {}) })}</script>
<title>${esc(displayTitle)} | SnapKit</title><link rel="stylesheet" href="../../tool-pages.css"></head>
<body><header class="top"><a class="brand" href="../../">✳ snapkit</a><a class="back" href="../../tools/">All tools</a> <a class="back" href="../../applications.html">Windows apps</a></header>
<main><p class="eyebrow">${category}</p><h1>${esc(heading)}</h1><p class="lead">${esc(route.intro)}</p>
<a class="cta" href="${actionUrl}">${esc(actionLabel)} <span>↗</span></a>
<p class="privacy">✳ Files are processed in your browser. They are not uploaded to SnapKit.</p>
<section><h2>${esc(howTitle)}</h2><ol>${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol><p>${esc(route.detail)}</p></section>
<section><h2>Frequently asked questions</h2><details><summary>${esc(faqWhat)}</summary><p>Yes. This static version has no account or paid API. Your browser does the processing.</p></details><details><summary>${esc(inputQuestion)}</summary><p>${esc(inputAnswer)}</p></details><details><summary>Why can't my file open or tool run?</summary><p>${whyAnswer}</p></details></section>
<nav class="related" aria-label="${relatedLabel}"><b>${relatedLabel}</b>${related.map((item) => `<a href="${link(item)}">${esc(item.heading || `${item.from} to ${item.to}`)}</a>`).join('')}</nav>
<p class="bangla">বাংলায় ব্যবহার করতে SnapKit-এর <a href="../../index-bn.html">বাংলা টুল পেজে</a> যান।</p></main><footer>© 2026 Rafix Technologies · SnapKit · <a href="../../privacy.html">Privacy</a> · <a href="../../">Home</a></footer></body></html>`;
  const dir = path.join(root, 'tools', route.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

const toolDirectory = path.join(root, 'tools');
await mkdir(toolDirectory, { recursive: true });
const toolDirectoryUrl = `${siteUrl}/tools/`;
const toolDirectoryHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Browse SnapKit's free online PDF, image, SVG, text, developer, calculator, and converter tools."><meta property="og:type" content="website"><meta property="og:site_name" content="SnapKit"><meta property="og:title" content="All Free Online Tools and Converters — SnapKit"><meta property="og:description" content="Browse free PDF, image, SVG, text, developer, calculator, and converter tools. They run in your browser."><meta name="twitter:card" content="summary"><meta name="twitter:title" content="All Free Online Tools and Converters — SnapKit"><meta name="twitter:description" content="Browse free PDF, image, SVG, text, developer, calculator, and converter tools."><title>All Free Online Tools and Converters — SnapKit</title><link rel="stylesheet" href="../tool-pages.css">${publishable ? `<meta property="og:url" content="${toolDirectoryUrl}"><link rel="canonical" href="${toolDirectoryUrl}">` : ''}<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'All Free Online Tools and Converters — SnapKit', description: 'Browse free PDF, image, SVG, text, developer, calculator, and converter tools.', ...(publishable ? { url: toolDirectoryUrl } : {}), isPartOf: { '@type': 'WebSite', name: 'SnapKit' } })}</script></head><body><header class="top"><a class="brand" href="../">✳ snapkit</a><a class="back" href="../everyday-tools.html">500+ everyday tools</a> <a class="back" href="../applications.html">Windows apps</a></header><main><p class="eyebrow">FREE ONLINE TOOLS</p><h1>All tools and converters</h1><p class="lead">Find a tool for PDF, image, SVG, text, developer tasks, calculations, and unit conversion. The tools run in your browser.</p><nav class="related" aria-label="All SnapKit tools"><b>Browse tools</b>${routes.map((route) => `<a href="${route.slug}/">${esc(route.heading || `${route.from} to ${route.to}`)}</a>`).join('')}</nav><p class="bangla">বাংলায় ব্যবহার করতে SnapKit-এর <a href="../index-bn.html">বাংলা টুল পেজে</a> যান।</p></main><footer>© 2026 Rafix Technologies · SnapKit · <a href="../privacy.html">Privacy</a> · <a href="../">Home</a></footer></body></html>`;
await writeFile(path.join(toolDirectory, 'index.html'), toolDirectoryHtml, 'utf8');

if (publishable) {
  for (const filename of ['index.html', 'index-bn.html', 'privacy.html', 'privacy-bn.html', 'everyday-tools.html', 'applications.html']) {
    const target = path.join(root, filename);
    const current = await readFile(target, 'utf8');
    const pageUrl = `${siteUrl}/${filename === 'index.html' ? '' : filename}`;
    const canonical = `<link rel="canonical" href="${pageUrl}">`;
    const ogUrl = `<meta property="og:url" content="${pageUrl}">`;
    const cleaned = current.replace(/<link rel="canonical"[^>]*>/g, '').replace(/<meta property="og:url"[^>]*>/g, '');
    const alternates = filename === 'index.html'
      ? `<link rel="alternate" hreflang="en" href="${siteUrl}/"><link rel="alternate" hreflang="bn" href="${siteUrl}/index-bn.html"><link rel="alternate" hreflang="x-default" href="${siteUrl}/">`
      : filename === 'index-bn.html'
        ? `<link rel="alternate" hreflang="en" href="${siteUrl}/"><link rel="alternate" hreflang="bn" href="${siteUrl}/index-bn.html"><link rel="alternate" hreflang="x-default" href="${siteUrl}/">`
        : filename === 'privacy.html'
          ? `<link rel="alternate" hreflang="en" href="${siteUrl}/privacy.html"><link rel="alternate" hreflang="bn" href="${siteUrl}/privacy-bn.html">`
          : filename === 'privacy-bn.html'
            ? `<link rel="alternate" hreflang="en" href="${siteUrl}/privacy.html"><link rel="alternate" hreflang="bn" href="${siteUrl}/privacy-bn.html">`
        : '';
    const updated = cleaned.replace('</head>', `${ogUrl}${canonical}${alternates}</head>`);
    await writeFile(target, updated, 'utf8');
  }
  // Keep utility/legal pages discoverable through internal links, but list only
  // pages intended to answer a search query in the sitemap.
  const urls = [`${siteUrl}/`, `${siteUrl}/index-bn.html`, `${siteUrl}/everyday-tools.html`, `${siteUrl}/applications.html`, `${siteUrl}/tools/`, ...routes.map((route) => `${siteUrl}/tools/${route.slug}/`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
} else {
  await writeFile(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
  console.log('Generated search landing pages and tool directory. Set siteUrl in site-config.json to the exact HTTPS GitHub Pages URL (including the repository path for a project site), then run this script again to add canonical URLs and sitemap.xml. robots.txt currently allows crawling.');
}
