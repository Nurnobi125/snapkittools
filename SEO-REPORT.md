# SnapKit SEO report (2026-11-08)

## Problems found in the uploaded version
1. index.html and index-bn.html carried 12x duplicated hreflang tags (36 each) because the old generator re-appended them on every run.
2. Only 2 pages had hreflang; the 44 tool pages had none and Bangla had no tool pages at all.
3. No og:image on any page; twitter:card was "summary" (no image) everywhere.
4. 52 of 58 pages had no favicon link; no apple-touch-icon.
5. 404.html had no description and was indexable.
6. English home page had a Bangla <noscript> message; preview <img> had no alt.
7. sitemap.xml had no lastmod and no language alternates.
8. Only English (+ Bangla homepage) existed, so no visibility in other languages.
9. One legacy page (/svg-to-pdf/) had a 185-character description.

## What was changed
- New: 12 languages (es, pt, fr, de, ru, tr, id, vi, hi, ar, ja, ko) + Bangla tool pages: 623 localized pages.
- New: scripts/build-seo.mjs (one command rebuilds everything), generate-i18n-pages.mjs, seo-finalize.mjs. Old generator no longer duplicates tags.
- All pages: canonical, og:url, og:image (1200x630), summary_large_image, favicons, correct hreflang + x-default, reciprocal.
- sitemap.xml: 674 URLs with lastmod and xhtml:link alternates. robots.txt points to it.
- 404.html: noindex + description.
- Language links block added to every English/Bangla page (crawlable internal links).

## Known limits
- Localized pages open the tool UI in English (Bangla opens index-bn.html). Translating the app UI is a separate job.
- Translations were written by an AI and should be reviewed by native speakers before heavy promotion.
- The 500+ everyday tools are rendered by JavaScript, so they are not individually indexable.
- No SEO change can guarantee Google traffic in 30 days. A new domain usually needs weeks to be crawled and indexed.

## Do this after uploading
1. Search Console: add property, submit https://snapkittools.online/sitemap.xml.
2. URL Inspection -> Request indexing for the home page and the top tool pages.
3. Bing Webmaster Tools: import from Search Console.
4. After 2-3 weeks, check Performance by country/language and improve the pages that get impressions.

## Keyword update (2026-11-08)
Source: 3 Google Keyword Planner exports (3,699 unique keywords, BDT). Full mapping: snapkit-keyword-analysis.xlsx (not part of the website).
- New tool: /tools/image-compressor/ (JPG/PNG/WebP, quality slider, "max size in KB" such as 100 KB, batch). Localized into 13 languages; wired into index.html and index-bn.html (compress-tool.js).
- Rewritten titles/descriptions/FAQs: merge-pdf, extract-pdf-pages (split PDF), image-to-pdf, jpg-to-pdf, png-to-pdf, image-to-word; tools hub text ("all online tools in one place"); home title/description.
- Not built (needs a server or paid API, or would mislead users): PDF to Word/Excel/PowerPoint, Word to PDF, AI website builder.
- Competitor brand keywords (830) are deliberately not used in page copy.

## Update 2 (2026-11-08)
- New tool: /tools/split-pdf/ (every page / own ranges / every N pages; ZIP download; split-tool.js). Localized into 13 languages. Extract-pages page now focuses on extracting, to avoid two pages competing for one search.
- New English-only size pages: /tools/compress-image-to-{50,100,150,200,500}kb/ (open the compressor with that limit pre-filled via ?kb=). Each has its own text and FAQ.
- Build script fixes: routes with "enOnly": true skip localization; language links no longer point to localized pages that do not exist.

## Update 3 (2026-11-08): new header and footer
- Sticky header with mega menus (Merge PDF, Split PDF, Compress image, Convert, All tools) and a dark multi-column footer with a language menu, on every page except 404.
- Source: scripts/chrome.mjs (markup), site-chrome.css, site-chrome.js. seo-finalize.mjs injects it into every HTML page, so edit chrome.mjs and run `node scripts/build-seo.mjs` to change the menu or footer everywhere.
- The old "Languages" pill block was replaced by the footer language menu (links to the same page in each language).

## Update 4 (2026-11-08): full workable language system
- Added workable header language switcher dropdown (`.sk-lang-header`) in `.navright` beside the theme toggle, showing current language name, globe icon, and chevron.
- Added mobile menu language grid (`.sk-mobile-lang`) inside `.sk-menu` for easy language switching on mobile devices.
- Enabled full rich mega-menu navigation across all languages with translated `T` dictionaries (Convert dropdown, All tools dropdown, Everyday tools, Windows apps).
- Added client-side language persistence (`localStorage.getItem('snapkit-lang')`), auto-closing dropdowns on outside click/Escape, and mutual exclusion.
- Expanded language coverage with 4 major languages: Chinese (`zh`), Italian (`it`), Dutch (`nl`), and Polish (`pl`), bringing total supported languages to 18 (en, ar, bn, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, tr, vi, zh).
- Rebuilt with `node scripts/build-seo.mjs`: 914 pages generated, 907 URLs with full hreflang alternates in sitemap.xml.

## অন-পেজ SEO অডিট (2026-11-08)

- ৯১৫টি HTML পেজে title, meta description, H1, language, canonical, image alt, internal link এবং structured-data JSON পরীক্ষা করা হয়েছে।
- একাধিক title বা description থাকা পেজ ছিল না, তবে ১৭টি localized tools directory-তে homepage-এর একই meta description ব্যবহার হচ্ছিল। এখন প্রতিটি directory তার স্থানীয় collection summary ব্যবহার করে; `scripts/generate-i18n-pages.mjs`-ও ভবিষ্যৎ rebuild-এ এই অনন্য description তৈরি করে।
- প্রতিটি indexable পেজে একটি করে H1 ও canonical, প্রতিটি পেজে HTML language attribute আছে; যাচাই করা image-গুলোর alt attribute আছে।
- ৯০৮টি sitemap URL স্থানীয় পেজের সঙ্গে মেলে। Hreflang target বিদ্যমান এবং reciprocal—সব পরীক্ষা পাস করেছে।
- চূড়ান্ত যাচাইয়ে duplicate title/description, missing H1/language/canonical/alt, broken local link ও invalid JSON-LD পাওয়া যায়নি। JavaScript/module syntax-ও পাস করেছে।
- Google title/snippet নিজে বদলে দেখাতে পারে; meta description ও title-এর নির্দিষ্ট অক্ষরসংখ্যা search result-এ দেখানোর নিশ্চয়তা নয়। এই অডিট Search Console impression, ranking বা Google-এর live index পরীক্ষা করেনি।

## AI crawler ও machine-readable catalog

- `robots.txt`-এ OpenAI-এর `OAI-SearchBot`-এর জন্য explicit `Allow: /` আছে; আগের wildcard rule-ও সব public path অনুমোদন করে। GPTBot training opt-out/opt-in preference আলাদা করে বদলানো হয়নি।
- সব indexable HTML পেজে `rel="describedby"` link দিয়ে `ai-index.json` এবং বাংলা `llms.txt` catalog/guide discoverable করা হয়েছে।
- `ai-index.json` source conversion/SEO data এবং তৈরি হওয়া localized HTML থেকে ৫৩টি tool-এর ৮৬৯টি ভাষাভিত্তিক tool URL, title, description, format, steps, privacy/limitation তথ্য তৈরি করে। `ai-index.schema.json` contract নির্ধারণ করে।
- `scripts/build-seo.mjs` index ও generated tool-directory অংশ rebuild করে; `scripts/validate-ai-index.mjs` route count, canonical URL, localized file existence, uniqueness এবং crawler access যাচাই করে।
- Google-এর AI Search guidance অনুযায়ী নতুন AI-only file বা markup Google result-এ উপস্থিতির শর্ত নয়; সাধারণ crawlability, indexability ও উপকারী content-ই মূল। এই catalog অন্য assistant-এর discovery সহজ করার জন্য, ranking guarantee নয়।
