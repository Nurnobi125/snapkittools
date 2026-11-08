// Shared card-grid renderer for the tool hub pages (English + all localized languages).
// Every card is plain static HTML (<a href>), so Google can crawl each link without JavaScript.
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const CALC = new Set(['percentage-calculator', 'discount-calculator', 'tip-calculator', 'age-calculator', 'date-difference-calculator', 'color-contrast-checker']);
export const groupOf = (r) => {
  if (r.group) return r.group;
  if (r.kind === 'pdf') return 'pdf';
  if (r.inline) return 'image';
  if (r.kind === 'utility') return CALC.has(r.slug) ? 'calc' : 'text';
  return 'image';
};

export const LABELS = {
  en: ['All', 'PDF', 'Images', 'Text & developer', 'Calculators'],
  bn: ['সব', 'PDF', 'ছবি', 'টেক্সট ও ডেভেলপার', 'ক্যালকুলেটর'],
  ar: ['الكل', 'PDF', 'الصور', 'النص والمطورون', 'الحاسبات'],
  de: ['Alle', 'PDF', 'Bilder', 'Text & Entwickler', 'Rechner'],
  es: ['Todas', 'PDF', 'Imágenes', 'Texto y desarrollo', 'Calculadoras'],
  fr: ['Tous', 'PDF', 'Images', 'Texte et dev', 'Calculatrices'],
  hi: ['सभी', 'PDF', 'छवियाँ', 'टेक्स्ट और डेवलपर', 'कैलकुलेटर'],
  id: ['Semua', 'PDF', 'Gambar', 'Teks & developer', 'Kalkulator'],
  ja: ['すべて', 'PDF', '画像', 'テキスト・開発', '計算ツール'],
  ko: ['전체', 'PDF', '이미지', '텍스트·개발', '계산기'],
  pt: ['Todas', 'PDF', 'Imagens', 'Texto e dev', 'Calculadoras'],
  ru: ['Все', 'PDF', 'Изображения', 'Текст и разработка', 'Калькуляторы'],
  tr: ['Tümü', 'PDF', 'Görseller', 'Metin ve geliştirici', 'Hesaplayıcılar'],
  vi: ['Tất cả', 'PDF', 'Hình ảnh', 'Văn bản & dev', 'Máy tính'],
  zh: ['全部', 'PDF', '图像', '文本与开发', '计算器'],
  it: ['Tutti', 'PDF', 'Immagini', 'Testo e dev', 'Calcolatrici'],
  nl: ['Alle', 'PDF', 'Afbeeldingen', 'Tekst & dev', 'Rekenmachines'],
  pl: ['Wszystkie', 'PDF', 'Obrazy', 'Tekst i dev', 'Kalkulatory']
};
const GROUP_ORDER = ['pdf', 'image', 'text', 'calc'];

// 24x24 line icons (stroke = currentColor). One distinct icon per tool.
const link = 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1';
const braces = 'M8 4C6 4 6 6 6 8s0 3-2 4c2 1 2 2 2 4s0 4 2 4M16 4c2 0 2 2 2 4s0 3 2 4c-2 1-2 2-2 4s0 4-2 4';
const doc = 'M6 3h8l4 4v14H6zM14 3v4h4';
const ocr = 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 10h8M8 14h5';
const ICONS = {
  'image-compressor': 'M4 4h16v16H4zM8 9.5h.01M4 17l4.5-4.5 3 3L15 12l5 5M15 7h4m0 0-1.8-1.8M19 7l-1.8 1.8',
  'split-pdf': 'M5 3h6v18H5zM13 3h6v18h-6z',
  'merge-pdf': 'M4 4l6 6M4 9V4h5M20 4l-6 6M20 9V4h-5M12 21v-8m0 0-3 3m3-3 3 3',
  'extract-pdf-pages': 'M6 3h8l4 4v4M6 3v18h7M14 3v4h4M15 17h7m0 0-2.5-2.5M22 17l-2.5 2.5',
  'rotate-pdf': 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4M10 10h4v4h-4z',
  'image-to-pdf': 'M3 4h9v9H3zM3 10l3-3 3 3 1.5-1.5M15 11h6m0 0-2.5-2.5M21 11l-2.5 2.5M5 17h14v4H5z',
  'jpg-to-pdf': 'M3 4h9v9H3zM3 10l3-3 3 3 1.5-1.5M15 11h6m0 0-2.5-2.5M21 11l-2.5 2.5M5 17h14v4H5z',
  'png-to-pdf': 'M3 4h9v9H3zM3 10l3-3 3 3 1.5-1.5M15 11h6m0 0-2.5-2.5M21 11l-2.5 2.5M5 17h14v4H5z',
  'pdf-page-count': `${doc}M9 12h6M9 16h4`,
  'pdf-to-image': 'M5 3h8l3 3v5M5 3v18h6M13 3v3h3M13 15h8v6h-8zM13 19l2.5-2.5 2 2 1.5-1.5 2 2',
  'pdf-to-jpg': 'M5 3h8l3 3v5M5 3v18h6M13 3v3h3M13 15h8v6h-8zM13 19l2.5-2.5 2 2 1.5-1.5 2 2',
  'pdf-to-png': 'M5 3h8l3 3v5M5 3v18h6M13 3v3h3M13 15h8v6h-8zM13 19l2.5-2.5 2 2 1.5-1.5 2 2',
  'svg-to-pdf': 'M12 4l7 12H5zM5 16v.01M19 16v.01M12 4v.01M14 20h7M17.5 17.5V22',
  'svg-to-png': 'M12 4l7 12H5zM5 16v.01M19 16v.01M12 4v.01',
  'svg-to-jpg': 'M12 4l7 12H5zM5 16v.01M19 16v.01M12 4v.01',
  'word-counter': 'M4 6h16M4 11h16M4 16h9M16 17l2 2 3-4',
  'essay-word-counter': 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h4',
  'character-counter': 'M3 18 8 6l5 12M5.5 14h5M16 7l-1 11M20 7l-1 11M14 10h7M13.5 15h7',
  'json-formatter': braces,
  'json-minifier': `${braces}M10 12h4`,
  'csv-to-json': 'M3 5h8v14H3zM3 10h8M3 14h8M15 9c-1 0-1 1-1 2s0 1.5-1 2c1 .5 1 1 1 2s0 2 1 2M21 9c1 0 1 1 1 2s0 1.5 1 2c-1 .5-1 1-1 2s0 2-1 2',
  'json-to-csv': 'M3 5h8v14H3zM3 10h8M3 14h8M15 9c-1 0-1 1-1 2s0 1.5-1 2c1 .5 1 1 1 2s0 2 1 2M21 9c1 0 1 1 1 2s0 1.5 1 2c-1 .5-1 1-1 2s0 2-1 2',
  'password-generator': 'M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  'uuid-generator': 'M9 4 7 20M17 4l-2 16M4 9h17M3 15h17',
  'base64-encoder': 'M7 8l-4 4 4 4M17 8l4 4-4 4M14 5l-4 14',
  'url-encoder': link,
  'url-parser': `${link}M3 21l3-3`,
  'regex-tester': 'M12 3v9M7.5 5.5l9 5M16.5 5.5l-9 5M6 19v.01M10 19h8',
  'sha256-generator': 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM9 12l2 2 4-4',
  'percentage-calculator': 'M19 5 5 19M7.5 8.5a1.5 1.5 0 1 0 0-.01M16.5 17.5a1.5 1.5 0 1 0 0-.01',
  'discount-calculator': 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  'tip-calculator': 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9.5 9.5h4a1.7 1.7 0 0 1 0 3.5h-3a1.7 1.7 0 0 0 0 3.5h4',
  'age-calculator': 'M12 3v3M5 21v-9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9M3 21h18M5 16c2 2 5 2 7 0s5-2 7 0',
  'date-difference-calculator': 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4M8 15h8',
  'color-contrast-checker': 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 3v18M12 3a9 9 0 0 1 0 18',
  'lorem-ipsum-generator': 'M4 6h16M4 10h16M4 14h10M4 18h13',
  'text-compare': 'M3 4h8v16H3zM13 4h8v16h-8zM5.5 9h3M5.5 13h3M15.5 9h3M15.5 15h3',
  'ocr-online': ocr,
  'image-to-text': ocr,
  'image-to-word': `${ocr}M14 14l1 2 1-2 1 2 1-2`,
  'bangla-ocr': ocr,
  convert: 'M4 8h15l-4-4m4 4-4 4M20 16H5l4 4m-4-4 4-4'
};
const iconPath = (r) => ICONS[r.slug] || ICONS[r.iconAs] || ICONS.convert;

export const CARD_CSS = `main.hub,body:has(main.hub) .top,body:has(main.hub) footer{max-width:1180px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:26px 0 6px}.chips button{font:inherit;font-size:14px;font-weight:650;padding:8px 16px;border-radius:99px;border:1px solid var(--line);background:#fff;color:inherit;cursor:pointer}.chips button[aria-pressed=true]{background:var(--deep);color:#fff;border-color:var(--deep)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;padding:18px 0 28px}
.cards a.tcard{position:relative;display:flex;flex-direction:column;gap:6px;min-height:176px;padding:22px 20px;background:#fff;border:1px solid var(--line);border-radius:18px;color:inherit;text-decoration:none;transition:transform .15s,box-shadow .15s,border-color .15s}
.cards a.tcard:hover,.cards a.tcard:focus-visible{transform:translateY(-3px);box-shadow:0 10px 26px rgba(23,37,31,.10);border-color:#cfd8cb;outline:0}
.cards a.tcard[hidden]{display:none}
.ti{position:relative;display:grid;place-items:center;width:54px;height:54px;border-radius:15px;margin-bottom:8px}
.ti svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.ti em{position:absolute;right:-8px;bottom:-7px;font:800 9.5px/1 system-ui,sans-serif;font-style:normal;letter-spacing:.3px;padding:3px 5px;border-radius:6px;background:currentColor}
.ti em b{color:#fff;font-weight:800}
.g-pdf .ti{background:#ffe9e3;color:#e5502f}.g-image .ti{background:#e3f6d6;color:#4d8a1f}.g-text .ti{background:#e2f0ff;color:#2f7bd0}.g-calc .ti{background:#eee9ff;color:#7050d6}
.tcard h3{font-size:17px;line-height:1.3;letter-spacing:-.2px;margin:0}.tcard p{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted)}
:root[data-theme=dark] .chips button,:root[data-theme=dark] .cards a.tcard{background:#1b2420;border-color:#2f3b34;color:#eef3ee}:root[data-theme=dark] .chips button[aria-pressed=true]{background:#caff6c;color:#17251f}
:root[data-theme=dark] .tcard p{color:#a9b6ad}:root[data-theme=dark] .g-pdf .ti{background:#4a2b22;color:#ff9d84}:root[data-theme=dark] .g-image .ti{background:#2c4020;color:#b6e68c}:root[data-theme=dark] .g-text .ti{background:#223a52;color:#a9d3ff}:root[data-theme=dark] .g-calc .ti{background:#35305a;color:#cfc4ff}
@media(max-width:520px){.cards{grid-template-columns:repeat(2,1fr);gap:10px}.cards a.tcard{padding:16px 14px;min-height:150px}.tcard p{display:none}}`;

const first = (s) => String(s || '').split(/(?<=[.!?。！？])\s+/)[0];

// items: [{ r, href, name, desc }]
export function cardsHtml(items, lang = 'en') {
  const labels = LABELS[lang] || LABELS.en;
  const chips = ['all', ...GROUP_ORDER].map((g, i) => `<button type="button" data-g="${g}" aria-pressed="${i === 0}">${esc(labels[i])}</button>`).join('');
  const cards = [...items].sort((x, y) => GROUP_ORDER.indexOf(groupOf(x.r)) - GROUP_ORDER.indexOf(groupOf(y.r))).map(({ r, href, name, desc }) => {
    const g = groupOf(r);
    const badge = g === 'image' && r.to && !r.inline ? `<em><b>${esc(String(r.to).toUpperCase())}</b></em>` : '';
    return `<a class="tcard g-${g}" data-g="${g}" href="${esc(href)}"><span class="ti"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${iconPath(r)}"/></svg>${badge}</span><h3>${esc(name)}</h3><p>${esc(first(desc))}</p></a>`;
  }).join('');
  const js = `document.querySelectorAll('.chips button').forEach(function(b){b.addEventListener('click',function(){var g=b.dataset.g;document.querySelectorAll('.chips button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});document.querySelectorAll('.cards .tcard').forEach(function(c){c.hidden=g!=='all'&&c.dataset.g!==g})})});`;
  return `<div class="chips" role="group">${chips}</div><div class="cards">${cards}</div><script>${js}</script>`;
}
