// Build a source-backed machine-readable catalog for assistants and site maintainers.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8'));
const seo = JSON.parse(await readFile(path.join(root, 'data/seo-content.json'), 'utf8'));
const config = JSON.parse(await readFile(path.join(root, 'site-config.json'), 'utf8'));
const siteUrl = String(config.siteUrl || '').trim().replace(/\/$/, '');
const parsed = new URL(siteUrl);
if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || siteUrl.includes('YOUR-USERNAME')) {
  throw new Error('site-config.json must contain the published HTTPS site URL before generating the AI catalog.');
}

const langs = ['en'];
for (const file of await readdir(path.join(root, 'data/i18n'))) {
  if (file.endsWith('.json')) langs.push(file.slice(0, -5));
}
const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const plain = (s) => decode(String(s || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const capture = (html, re) => plain(html.match(re)?.[1] || '');
const pageData = (html, file, language) => {
  const title = capture(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '');
  const heading = capture(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const summary = capture(html, /<p\s+class="lead"[^>]*>([\s\S]*?)<\/p>/i);
  const privacy = capture(html, /<p\s+class="privacy"[^>]*>([\s\S]*?)<\/p>/i);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || `${siteUrl}/${file.replaceAll(path.sep, '/').replace(/\/index\.html$/, '/')}`;
  if (!title || !description || !heading || !canonical.startsWith(`${siteUrl}/`)) {
    throw new Error(`Missing or invalid SEO fields for ${file}`);
  }
  return { language, url: canonical, title, description, heading, ...(summary ? { summary } : {}), ...(privacy ? { privacy_note: privacy } : {}) };
};

const tools = [];
const seenSlugs = new Set();
for (const route of routes) {
  if (!route.slug || seenSlugs.has(route.slug)) throw new Error(`Missing or duplicate tool slug: ${route.slug}`);
  seenSlugs.add(route.slug);
  const localizedPages = [];
  for (const language of langs) {
    const file = path.join(root, ...(language === 'en' ? ['tools', route.slug, 'index.html'] : [language, 'tools', route.slug, 'index.html']));
    let html;
    try { html = await readFile(file, 'utf8'); } catch { continue; }
    localizedPages.push(pageData(html, path.relative(root, file), language));
  }
  const english = localizedPages.find((p) => p.language === 'en');
  if (!english) throw new Error(`English source page is missing for ${route.slug}`);
  const source = seo[route.slug] || {};
  const group = route.group || (route.kind === 'pdf' ? 'pdf' : route.kind === 'utility' ? 'utility' : 'image');
  const related = source.related || route.relatedSlugs || [];
  tools.push({
    id: `snapkit:${route.slug}`,
    slug: route.slug,
    category: group,
    operation: route.kind || 'image-conversion',
    ...(route.from ? { input_format: route.from } : {}),
    ...(route.to ? { output_format: route.to } : {}),
    ...(route.mime ? { output_mime_type: route.mime } : {}),
    ...(route.tool ? { app_tool_id: route.tool } : {}),
    ...(route.intro ? { purpose: route.intro } : {}),
    ...(route.detail ? { important_details: route.detail } : {}),
    ...(source.extra ? { additional_details: source.extra } : {}),
    ...(route.steps?.length ? { steps: route.steps } : {}),
    ...(route.faq ? { common_questions: [[route.faq, route.faqAnswer || '']] } : {}),
    ...(source.faq?.length ? { page_specific_questions: source.faq } : {}),
    ...(route.privacyNote || route.inputA ? { privacy: route.privacyNote || route.inputA } : {}),
    ...(route.whyA ? { limitations: route.whyA } : {}),
    related_tool_ids: related.map((slug) => `snapkit:${slug}`),
    pages: localizedPages
  });
}

const index = {
  schema_version: '1.0.0',
  site: {
    name: 'SnapKit',
    publisher: 'Rafix Technologies',
    origin: siteUrl,
    default_language: 'en',
    supported_page_languages: langs.slice(1),
    free_to_use: true,
    account_required: false,
    privacy_policy: `${siteUrl}/privacy.html`,
    privacy_policy_bn: `${siteUrl}/privacy-bn.html`,
    tool_directory: `${siteUrl}/tools/`,
    everyday_tools_catalog: `${siteUrl}/everyday-tools.html`
  },
  discovery: {
    llms_txt: `${siteUrl}/llms.txt`,
    llms_full_txt: `${siteUrl}/llms-full.txt`,
    machine_catalog: `${siteUrl}/ai-index.json`,
    machine_catalog_schema: `${siteUrl}/ai-index.schema.json`,
    sitemap: `${siteUrl}/sitemap.xml`,
    robots: `${siteUrl}/robots.txt`
  },
  assistant_guidance: [
    'Use a matching tool page as the source for the recommendation and cite its URL.',
    'Check the selected language page for wording and availability; a localized landing page does not guarantee that the tool interface is fully translated.',
    'Treat browser, file-format, memory, size and CDN constraints as material. Do not claim unsupported capabilities.',
    'This catalog describes the public site; it is not a live API, uptime monitor, ranking signal or guarantee of recommendation.'
  ],
  tools
};

const output = path.join(root, 'ai-index.json');
await writeFile(output, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

// Keep the human-readable guide's directory synchronized with the exact same source pages.
const fullPath = path.join(root, 'llms-full.txt');
let full = await readFile(fullPath, 'utf8');
const start = '<!-- BEGIN GENERATED TOOL INDEX -->';
const end = '<!-- END GENERATED TOOL INDEX -->';
const entries = tools.map((tool) => {
  const en = tool.pages.find((p) => p.language === 'en');
  const variants = tool.pages.filter((p) => p.language !== 'en').map((p) => `[${p.language}](${p.url})`).join(' · ');
  return `- **${tool.slug}** (${tool.category}): ${en.title}. ${en.description} ${en.url}${variants ? `\n  - ভাষাভিত্তিক পেজ: ${variants}` : ''}`;
}).join('\n');
const block = `${start}\n\n## স্বয়ংক্রিয় টুল ক্যাটালগ\n\nএই তালিকা ` + '`data/conversions.json`, `data/seo-content.json`' + ` এবং তৈরি হওয়া ভাষাভিত্তিক পেজ থেকে তৈরি। পূর্ণ machine-readable তথ্য [ai-index.json](${siteUrl}/ai-index.json)-এ আছে।\n\n${entries}\n\n${end}`;
if (full.includes(start) && full.includes(end)) {
  full = full.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
} else {
  full = `${full.trimEnd()}\n\n${block}\n`;
}
await writeFile(fullPath, full, 'utf8');
console.log(`Generated ai-index.json with ${tools.length} tools and ${tools.reduce((n, t) => n + t.pages.length, 0)} localized tool pages.`);
