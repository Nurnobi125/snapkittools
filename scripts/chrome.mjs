// Shared site header (mega-menu navigation) and dark footer.
// seo-finalize.mjs calls injectChrome() on every HTML page, so one edit here updates the whole site.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groupOf, LABELS } from './tool-cards.mjs';
import { NAMED, PAIRS } from './tool-names.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8')).filter((r) => !r.enOnly);
const bySlug = Object.fromEntries(routes.map((r) => [r.slug, r]));
const i18n = {};
for (const f of (await readdir(path.join(root, 'data/i18n'))).filter((x) => x.endsWith('.json'))) {
  const l = JSON.parse(await readFile(path.join(root, 'data/i18n', f), 'utf8'));
  i18n[l.code] = l;
}
const CODES = ['en', ...Object.keys(i18n).sort()];
const NATIVE = { en: 'English', ...Object.fromEntries(Object.values(i18n).map((l) => [l.code, l.name])) };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const EN = {
  'merge-pdf': 'Merge PDF', 'split-pdf': 'Split PDF', 'extract-pdf-pages': 'Extract pages', 'rotate-pdf': 'Rotate PDF', 'image-to-pdf': 'Image to PDF',
  'pdf-page-count': 'PDF page counter', 'pdf-to-image': 'PDF to image', 'image-compressor': 'Compress image', 'word-counter': 'Word counter',
  'character-counter': 'Character counter', 'json-formatter': 'JSON formatter', 'json-minifier': 'JSON minifier', 'password-generator': 'Password generator',
  'uuid-generator': 'UUID generator', 'base64-encoder': 'Base64 encoder', 'url-encoder': 'URL encoder', 'regex-tester': 'Regex tester',
  'sha256-generator': 'SHA-256 generator', 'percentage-calculator': 'Percentage calculator', 'discount-calculator': 'Discount calculator',
  'tip-calculator': 'Tip calculator', 'age-calculator': 'Age calculator', 'date-difference-calculator': 'Date difference', 'color-contrast-checker': 'Contrast checker',
  'lorem-ipsum-generator': 'Lorem ipsum', 'text-compare': 'Text compare', 'url-parser': 'URL parser', 'essay-word-counter': 'Essay word counter',
  'ocr-online': 'Online OCR', 'image-to-text': 'Image to text', 'image-to-word': 'Image to Word', 'bangla-ocr': 'Bangla OCR'
};
const T = {
  en: { home: '/', priv: '/privacy.html', convert: 'Convert', all: 'All tools', apps: 'Windows apps', everyday: '700+ everyday tools', pages: 'All tool pages', menu: 'Menu', lang: 'Language',
    toPdf: 'To PDF', fromPdf: 'From PDF', imgFmt: 'Image formats', site: 'SnapKit', privacy: 'Privacy', tag: 'Free tools that run in your browser. Files are not uploaded.' },
  bn: { home: '/index-bn.html', priv: '/privacy-bn.html', convert: 'কনভার্ট', all: 'সব টুল', apps: 'Windows অ্যাপ', everyday: '৫০০+ দৈনন্দিন টুল', pages: 'সব টুল পেজ', menu: 'মেনু', lang: 'ভাষা',
    toPdf: 'PDF-এ', fromPdf: 'PDF থেকে', imgFmt: 'ছবির ফরম্যাট', site: 'SnapKit', privacy: 'গোপনীয়তা', tag: 'ব্রাউজারে চলা ফ্রি টুল। ফাইল আপলোড হয় না।' },
  ar: { home: '/ar/', priv: '/privacy.html', convert: 'تحويل', all: 'جميع الأدوات', apps: 'تطبيقات ويندوز', everyday: '+700 أداة يومية', pages: 'جميع صفحات الأدوات', menu: 'القائمة', lang: 'اللغة',
    toPdf: 'إلى PDF', fromPdf: 'من PDF', imgFmt: 'صيغ الصور', site: 'SnapKit', privacy: 'الخصوصية', tag: 'أدوات مجانية تعمل في متصفحك. لا يتم رفع الملفات.' },
  de: { home: '/de/', priv: '/privacy.html', convert: 'Konvertieren', all: 'Alle Tools', apps: 'Windows-Apps', everyday: '700+ Alltagstools', pages: 'Alle Tool-Seiten', menu: 'Menü', lang: 'Sprache',
    toPdf: 'Zu PDF', fromPdf: 'Von PDF', imgFmt: 'Bildformate', site: 'SnapKit', privacy: 'Datenschutz', tag: 'Kostenlose Tools, die im Browser laufen. Dateien werden nicht hochgeladen.' },
  es: { home: '/es/', priv: '/privacy.html', convert: 'Convertir', all: 'Todas las herramientas', apps: 'Apps de Windows', everyday: '700+ herramientas', pages: 'Todas las páginas de herramientas', menu: 'Menú', lang: 'Idioma',
    toPdf: 'A PDF', fromPdf: 'De PDF', imgFmt: 'Formatos de imagen', site: 'SnapKit', privacy: 'Privacidad', tag: 'Herramientas gratis que funcionan en tu navegador. Sin subir archivos.' },
  fr: { home: '/fr/', priv: '/privacy.html', convert: 'Convertir', all: 'Tous les outils', apps: 'Applications Windows', everyday: '700+ outils du quotidien', pages: 'Toutes les pages d\'outils', menu: 'Menu', lang: 'Langue',
    toPdf: 'Vers PDF', fromPdf: 'Depuis PDF', imgFmt: 'Formats d\'image', site: 'SnapKit', privacy: 'Confidentialité', tag: 'Outils gratuits fonctionnant dans votre navigateur. Les fichiers ne sont pas envoyés.' },
  hi: { home: '/hi/', priv: '/privacy.html', convert: 'कन्वर्ट', all: 'सभी टूल्स', apps: 'Windows ऐप्स', everyday: '700+ दैनिक टूल्स', pages: 'सभी टूल पेज', menu: 'मेनू', lang: 'भाषा',
    toPdf: 'PDF में', fromPdf: 'PDF से', imgFmt: 'इमेज फॉर्मेट्स', site: 'SnapKit', privacy: 'गोपनीयता', tag: 'ब्राउज़र में चलने वाले मुफ़्त टूल्स। फ़ाइलें अपलोड नहीं होतीं।' },
  id: { home: '/id/', priv: '/privacy.html', convert: 'Konversi', all: 'Semua alat', apps: 'Aplikasi Windows', everyday: '700+ alat harian', pages: 'Semua halaman alat', menu: 'Menu', lang: 'Bahasa',
    toPdf: 'Ke PDF', fromPdf: 'Dari PDF', imgFmt: 'Format gambar', site: 'SnapKit', privacy: 'Privasi', tag: 'Alat gratis yang berjalan di browser Anda. Berkas tidak diunggah.' },
  it: { home: '/it/', priv: '/privacy.html', convert: 'Converti', all: 'Tutti gli strumenti', apps: 'App Windows', everyday: '700+ strumenti quotidiani', pages: 'Tutte le pagine degli strumenti', menu: 'Menu', lang: 'Lingua',
    toPdf: 'In PDF', fromPdf: 'Da PDF', imgFmt: 'Formati immagine', site: 'SnapKit', privacy: 'Privacy', tag: 'Strumenti gratuiti che funzionano nel browser. I file non vengono caricati.' },
  ja: { home: '/ja/', priv: '/privacy.html', convert: '変換', all: 'すべてのツール', apps: 'Windowsアプリ', everyday: '700+ 日常ツール', pages: 'すべてのツールページ', menu: 'メニュー', lang: '言語',
    toPdf: 'PDFへ変換', fromPdf: 'PDFから変換', imgFmt: '画像フォーマット', site: 'SnapKit', privacy: 'プライバシー', tag: 'ブラウザで動作する無料ツール。ファイルはアップロードされません。' },
  ko: { home: '/ko/', priv: '/privacy.html', convert: '변환', all: '모든 도구', apps: 'Windows 앱', everyday: '700+ 일상 도구', pages: '모든 도구 페이지', menu: '메뉴', lang: '언어',
    toPdf: 'PDF로', fromPdf: 'PDF에서', imgFmt: '이미지 형식', site: 'SnapKit', privacy: '개인정보 보호', tag: '브라우저에서 실행되는 무료 도구입니다. 파일은 업로드되지 않습니다.' },
  nl: { home: '/nl/', priv: '/privacy.html', convert: 'Converteren', all: 'Alle tools', apps: 'Windows-apps', everyday: '700+ handige tools', pages: 'Alle toolpagina\'s', menu: 'Menu', lang: 'Taal',
    toPdf: 'Naar PDF', fromPdf: 'Van PDF', imgFmt: 'Afbeeldingsformaten', site: 'SnapKit', privacy: 'Privacy', tag: 'Gratis tools in je browser. Bestanden worden niet geüpload.' },
  pl: { home: '/pl/', priv: '/privacy.html', convert: 'Konwertuj', all: 'Wszystkie narzędzia', apps: 'Aplikacje Windows', everyday: '700+ codziennych narzędzi', pages: 'Wszystkie strony narzędzi', menu: 'Menu', lang: 'Język',
    toPdf: 'Do PDF', fromPdf: 'Z PDF', imgFmt: 'Formaty obrazów', site: 'SnapKit', privacy: 'Prywatność', tag: 'Darmowe narzędzia działające w przeglądarce. Pliki nie są wysyłane.' },
  pt: { home: '/pt/', priv: '/privacy.html', convert: 'Converter', all: 'Todas as ferramentas', apps: 'Aplicativos Windows', everyday: '700+ ferramentas diárias', pages: 'Todas as páginas de ferramentas', menu: 'Menu', lang: 'Idioma',
    toPdf: 'Para PDF', fromPdf: 'De PDF', imgFmt: 'Formatos de imagem', site: 'SnapKit', privacy: 'Privacidade', tag: 'Ferramentas gratuitas que rodam no seu navegador. Arquivos não são enviados.' },
  ru: { home: '/ru/', priv: '/privacy.html', convert: 'Конвертировать', all: 'Все инструменты', apps: 'Приложения Windows', everyday: '700+ инструментов', pages: 'Все страницы инструментов', menu: 'Меню', lang: 'Язык',
    toPdf: 'В PDF', fromPdf: 'Из PDF', imgFmt: 'Форматы изображений', site: 'SnapKit', privacy: 'Конфиденциальность', tag: 'Бесплатные инструменты в вашем браузере. Файлы не загружаются.' },
  tr: { home: '/tr/', priv: '/privacy.html', convert: 'Dönüştür', all: 'Tüm araçlar', apps: 'Windows uygulamaları', everyday: '700+ günlük araç', pages: 'Tüm araç sayfaları', menu: 'Menü', lang: 'Dil',
    toPdf: 'PDF\'e', fromPdf: 'PDF\'ten', imgFmt: 'Görsel formatları', site: 'SnapKit', privacy: 'Gizlilik', tag: 'Tarayıcınızda çalışan ücretsiz araçlar. Dosyalar yüklenmez.' },
  vi: { home: '/vi/', priv: '/privacy.html', convert: 'Chuyển đổi', all: 'Tất cả công cụ', apps: 'Ứng dụng Windows', everyday: '700+ công cụ', pages: 'Tất cả trang công cụ', menu: 'Menu', lang: 'Ngôn ngữ',
    toPdf: 'Sang PDF', fromPdf: 'Từ PDF', imgFmt: 'Định dạng hình ảnh', site: 'SnapKit', privacy: 'Quyền riêng tư', tag: 'Công cụ miễn phí chạy trong trình duyệt. Tệp không được tải lên máy chủ.' },
  zh: { home: '/zh/', priv: '/privacy.html', convert: '格式转换', all: '所有工具', apps: 'Windows 应用', everyday: '700+ 款实用工具', pages: '所有工具页面', menu: '菜单', lang: '语言',
    toPdf: '转为 PDF', fromPdf: '从 PDF 转换', imgFmt: '图像格式', site: 'SnapKit', privacy: '隐私政策', tag: '在浏览器中运行的免费工具。文件不会被上传。' }
};
const homeOf = (c) => (c === 'en' ? '/' : c === 'bn' ? '/index-bn.html' : `/${c}/`);
const toolHref = (c, slug) => (c === 'en' ? `/tools/${slug}/` : `/${c}/tools/${slug}/`);
const hubHref = (c) => (c === 'en' ? '/tools/' : `/${c}/tools/`);

function nameOf(c, slug) {
  const r = bySlug[slug]; if (!r) return slug;
  const pair = r.from && r.to ? [r.from, r.to] : PAIRS[slug] || null;
  if (c === 'en') return EN[slug] || (pair ? `${pair[0]} to ${pair[1]}` : r.heading);
  if (pair) return `${pair[0]} → ${pair[1]}`;
  return i18n[c]?.names?.[NAMED.indexOf(slug)] || EN[slug] || slug;
}
const links = (c, slugs) => slugs.filter((s) => bySlug[s]).map((s) => `<a href="${toolHref(c, s)}">${esc(nameOf(c, s))}</a>`).join('');
const col = (heading, inner) => `<div class="sk-col">${heading ? `<b>${esc(heading)}</b>` : ''}${inner}</div>`;

const FOOT = {
  pdf: ['merge-pdf', 'split-pdf', 'extract-pdf-pages', 'rotate-pdf', 'image-to-pdf', 'pdf-to-jpg', 'pdf-page-count'],
  image: ['image-compressor', 'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'jpg-to-webp', 'svg-to-png', 'image-to-text'],
  text: ['word-counter', 'json-formatter', 'password-generator', 'uuid-generator', 'base64-encoder', 'regex-tester', 'text-compare']
};
const CONVERT = {
  toPdf: ['image-to-pdf', 'jpg-to-pdf', 'png-to-pdf', 'svg-to-pdf'],
  fromPdf: ['pdf-to-jpg', 'pdf-to-png', 'pdf-to-image'],
  img: ['jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'webp-to-png', 'jpg-to-webp', 'png-to-webp', 'avif-to-jpg', 'svg-to-png', 'svg-to-jpg']
};

export function navHtml(c, hrefFor) {
  const t = T[c] || T.en, labels = LABELS[c] || LABELS.en;
  const quick = ['merge-pdf', 'split-pdf', 'image-compressor'].map((s) => `<a class="sk-link" href="${toolHref(c, s)}">${esc(nameOf(c, s))}</a>`).join('');
  const dd = (label, panel) => `<div class="sk-dd"><button class="sk-link sk-dd-btn" type="button" aria-expanded="false">${esc(label)}<i aria-hidden="true"></i></button><div class="sk-panel">${panel}</div></div>`;
  const convertPanel = `<div class="sk-cols">${col(t.toPdf, links(c, CONVERT.toPdf))}${col(t.fromPdf, links(c, CONVERT.fromPdf))}${col(t.imgFmt, links(c, CONVERT.img))}</div>`;
  const groups = { pdf: [], image: [], text: [], calc: [] };
  for (const r of routes) groups[groupOf(r)]?.push(r.slug);
  const PRI = [...FOOT.pdf, ...FOOT.image, ...FOOT.text], rank = (s) => (PRI.includes(s) ? PRI.indexOf(s) : 999);
  for (const g of Object.values(groups)) g.sort((x, y) => rank(x) - rank(y));
  const allPanel = `<div class="sk-cols">${['pdf', 'image', 'text', 'calc'].map((g, i) => col(labels[i + 1], links(c, groups[g]))).join('')}</div><div class="sk-morebar"><a href="${hubHref(c)}">${esc(t.pages)} →</a><a href="/everyday-tools.html">${esc(t.everyday)} →</a></div>`;
  const allLabel = i18n[c]?.ui?.allTools || t.all;
  const langItems = CODES.map((x) => `<a href="${(hrefFor && hrefFor(x)) || homeOf(x)}" hreflang="${x}" lang="${x}"${x === c ? ' aria-current="true"' : ''}>${esc(NATIVE[x])}</a>`).join('');
  const langDd = `<details class="sk-lang sk-lang-header"><summary aria-label="${esc(t.lang || 'Language')}"><span aria-hidden="true">🌐</span> <span class="sk-lang-name">${esc(NATIVE[c] || NATIVE.en)}</span><i class="sk-chevron" aria-hidden="true"></i></summary><div class="sk-langlist">${langItems}</div></details>`;
  const mobileLang = `<div class="sk-mobile-lang"><b><span aria-hidden="true">🌐</span> ${esc(t.lang || 'Language')}</b><div class="sk-mobile-langlist">${langItems}</div></div>`;
  return `<!--sk-nav--><header class="sk-nav" id="sk-nav"><div class="sk-wrap" data-nosnippet><a class="sk-brand" href="${homeOf(c)}"><span class="sk-logo" aria-hidden="true">✳</span>snapkit</a>`
    + `<button class="sk-burger" type="button" aria-label="${esc(t.menu || 'Menu')}" aria-expanded="false" aria-controls="sk-menu"><span></span><span></span><span></span></button>`
    + `<nav class="sk-menu" id="sk-menu" aria-label="${esc(t.menu || 'Menu')}">${quick}${dd(t.convert, convertPanel)}${dd(allLabel, allPanel)}<a class="sk-link" href="/applications.html">${esc(t.apps)}</a>${mobileLang}</nav>`
    + `<div class="navright">${langDd}</div></div></header><!--/sk-nav-->`;
}

export function footerHtml(c, hrefFor) {
  const t = T[c] || T.en, labels = LABELS[c] || LABELS.en, ui = i18n[c]?.ui;
  const siteLinks = `<a href="${homeOf(c)}">${esc(ui?.footerHome || (c === 'bn' ? 'হোম' : 'Home'))}</a><a href="${hubHref(c)}">${esc(ui?.allTools || t.all)}</a>`
    + `<a href="/everyday-tools.html">${esc(t.everyday)}</a><a href="/applications.html">${esc(t.apps)}</a>`
    + `<a href="${t.priv}">${esc(ui?.footerPrivacy || t.privacy)}</a>`;
  const langs = CODES.map((x) => `<a href="${(hrefFor && hrefFor(x)) || homeOf(x)}" hreflang="${x}" lang="${x}"${x === c ? ' aria-current="true"' : ''}>${esc(NATIVE[x])}</a>`).join('');
  const tag = ui?.privacy || t.tag;
  return `<!--sk-footer--><footer class="sk-footer"><div class="sk-wrap sk-fwrap"><div class="sk-fgrid">`
    + `${col('SnapKit', siteLinks)}${col(labels[1], links(c, FOOT.pdf))}${col(labels[2], links(c, FOOT.image))}${col(labels[3], links(c, FOOT.text))}`
    + `</div><div class="sk-fbottom"><details class="sk-lang"><summary><span aria-hidden="true">🌐</span> ${esc(NATIVE[c] || NATIVE.en)}</summary><div class="sk-langlist">${langs}</div></details>`
    + `<p>${esc(tag)}</p><p>© 2026 Rafix Technologies · SnapKit</p></div></div></footer><!--/sk-footer-->`;
}

export function injectChrome(html, hrefFor, pagePath = '/') {
  const lang = (html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1] || 'en').toLowerCase();
  const c = CODES.includes(lang) ? lang : 'en';
  // Relative links so the site also works when opened straight from disk (file://) and in sub-folders.
  const segs = pagePath.split('/').filter(Boolean);
  if (segs.length && segs[segs.length - 1].includes('.')) segs.pop();
  const prefix = '../'.repeat(segs.length);
  const rel = (s) => s.replaceAll('href="/"', `href="${prefix || './'}"`).replaceAll('href="/', `href="${prefix}`);
  const nav = rel(navHtml(c, hrefFor)), foot = rel(footerHtml(c, hrefFor));
  const swap = (h, tag, marker, block, last) => {
    const m = new RegExp(`<!--${marker}-->[\\s\\S]*?<!--/${marker}-->`);
    if (m.test(h)) return h.replace(m, () => block);
    const open = last ? h.lastIndexOf(`<${tag}`) : h.indexOf(`<${tag}`);
    if (open < 0) return h;
    const close = h.indexOf(`</${tag}>`, open);
    return close < 0 ? h : h.slice(0, open) + block + h.slice(close + tag.length + 3);
  };
  html = swap(html, 'header', 'sk-nav', nav, false);
  html = swap(html, 'footer', 'sk-footer', foot, true);
  html = html.replace(/<link rel="stylesheet" href="[^"]*site-chrome\.css">/g, '').replace(/<script src="[^"]*site-chrome\.js" defer><\/script>/g, '');
  html = html.replace(/<script[^>]*bauval\.org[^>]*><\/script>/g, '');
  html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}site-chrome.css"></head>`);
  html = html.replace('</body>', `<script src="${prefix}site-chrome.js" defer></script><script data-cfasync="false" src="https://bauval.org/14/c7078b0a30080b7b92db240d40937212"></script></body>`);
  return html;
}
