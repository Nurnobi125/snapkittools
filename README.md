# SnapKit — GitHub Pages-এ বিনামূল্যে প্রকাশ

The site and Windows apps are published by Rafix Technologies. The Windows apps page links users to the official DownGo website and Microsoft Store listings; this static site does not host installers.

এই ফোল্ডারটি একটি সম্পূর্ণ static website। সাইট চালাতে কোনো paid service, database বা API key লাগে না। আগে থেকেই তৈরি search landing page ব্যবহার করতে build step লাগবে না। নতুন/বদলানো SEO পেজ বানাতে চাইলে Node.js দিয়ে `scripts/generate-seo-pages.mjs` চালান। `index.html`-সহ এই ফোল্ডারের **ভেতরের সব ফাইল** GitHub repository-র root-এ রাখুন।

## GitHub Pages চালু করুন

1. GitHub-এ একটি **public** repository তৈরি করুন। নিজের মূল user site চাইলে repository-র নাম `YOUR-USERNAME.github.io` দিন। অন্য নাম ব্যবহার করলে ঠিকানা হবে `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`। GitHub Free-এ Pages প্রকাশের জন্য public repository লাগে।
2. এই ফোল্ডারের ভেতরের ফাইলগুলো repository root-এ upload/commit করুন—যাতে `index.html` root-এই থাকে; `outputs/index.html` হিসেবে নয়।
3. repository-র **Settings → Pages** খুলুন। **Build and deployment → Source**-এ **Deploy from a branch**, branch হিসেবে `main`, folder হিসেবে `/(root)` বেছে **Save** করুন।
4. কিছুক্ষণ পর Settings → Pages-এ প্রকাশিত URL দেখা যাবে। আপডেট প্রকাশে কয়েক মিনিট লাগতে পারে।
5. `site-config.json`-এ `siteUrl`-এর placeholder বদলে আপনার আসল Pages URL লিখুন। User site উদাহরণ: `https://YOUR-USERNAME.github.io`; project site উদাহরণ: `https://YOUR-USERNAME.github.io/snapkit`। URL-এ repository path থাকলে সেটিও দিতে হবে। তারপর `node scripts/generate-seo-pages.mjs` চালিয়ে canonical ও Open Graph URL, `sitemap.xml` ও `robots.txt` তৈরি/আপডেট করুন, এবং পরিবর্তিত ফাইলগুলো GitHub-এ আপলোড করুন। Generator placeholder, HTTP, query বা fragment-সহ URL-কে প্রকাশযোগ্য URL হিসেবে গ্রহণ করে না।
6. GitHub repository-র **Settings → Pages → Custom domain**-এ `snapkittools.online` লিখে Save করুন। এরপর domain provider-এর DNS-এ apex/root `@` host-এর জন্য GitHub Pages-এর চারটি `A` record যোগ করুন: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`। চাইলে `www` host-এর `CNAME` আপনার GitHub Pages default hostname (`YOUR-USERNAME.github.io`)-এ দিন। DNS ছড়িয়ে পড়তে ২৪ ঘণ্টা পর্যন্ত লাগতে পারে; তারপর Pages settings-এ HTTPS চালু করুন। [GitHub-এর custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) দেখুন।
7. প্রকাশিত ঠিকানাটি খুলে দেখে তারপর Google Search Console-এ property যোগ করে ownership verify করুন। Search Console-এর Sitemaps অংশে `sitemap.xml` জমা দিন এবং URL Inspection দিয়ে homepage ও গুরুত্বপূর্ণ tool page crawl-এর জন্য request করুন। এটি indexing ত্বরান্বিত করতে সাহায্য করতে পারে; indexing বা search ranking নিশ্চিত করে না।

## SEO প্রস্তুতি ও বাস্তব সীমা

- পেজে আলাদা page title ও description, social sharing metadata, semantic heading, English/Bangla ভাষা চিহ্ন, internal links এবং tool-specific help content রাখা হয়েছে। SEO landing pages build script থেকে তৈরি হয়।
- প্রকাশযোগ্য আসল site URL না জানা পর্যন্ত canonical URL ও absolute sitemap ইচ্ছাকৃতভাবে যোগ করা হয়নি। Deploy হওয়ার পর `site-config.json`-এ সঠিক URL (custom domain বা GitHub Pages-এর repository path-সহ) বসিয়ে generator চালান।
- `robots.txt` crawler-দের সাইট পড়তে অনুমতি দেয়। Sitemap কেবল valid HTTPS site URL কনফিগার করা থাকলে তৈরি হয়।
- Search result-এ প্রথম/দ্বিতীয় স্থান বা “১০০% SEO” নিশ্চিত করার উপায় নেই। Ranking নির্ভর করে প্রতিযোগিতা, উপযোগী ও মৌলিক content, domain history, links, performance, crawl/index state এবং Google-এর নিজস্ব ব্যবস্থার ওপর। Search Console-এ indexing, Core Web Vitals, mobile usability ও search queries নিয়মিত দেখুন।

## সাইটে কী কাজ করে

- PNG/JPEG/WebP কনভার্ট এবং ডাউনলোড; BMP আউটপুটও তৈরি হয়। AVIF আউটপুট শুধু ব্রাউজার সমর্থন করলে দেখায়।
- ছবির মাপ বদলে PNG হিসেবে ডাউনলোড।
- নতুন PNG কপি তৈরি করে সাধারণ EXIF তথ্য বাদ দেওয়ার চেষ্টা।
- আনুমানিক পাঁচটি প্রধান রং বের করা।
- OG card-এর নমুনা দেখা, responsive layout, FAQ, privacy page এবং custom 404 page।
- PDF merge, selected-page extraction, rotation, image-to-PDF, page count, and PDF page-to-PNG/JPG run in the browser. pdf-lib and PDF.js lazy-load from jsDelivr only when a PDF tool needs them; files are not uploaded to SnapKit. PDF-to-image accepts PDFs up to 100 MB and renders one page at a time. SVG can be converted to PNG, JPG, or a rasterized printable PDF.
- Image-to-PDF-এ প্রতিটি ছবির সর্বোচ্চ ফাইল আকার ৪০ MB; খুব বড় বা অনেক ছবি একসাথে নিলে ডিভাইসের memory সীমা প্রযোজ্য।
- `everyday-tools.html`-এ ৫০০+ searchable browser tools: text, developer, math/date, quick tools, and hundreds of practical unit-conversion pairs. The list displays 36 cards per page.
- মূল সাইটের default ভাষা English। বাংলা সংস্করণ `index-bn.html` এবং বাংলা privacy page `privacy-bn.html`; English/Bangla switch link দুই হোমপেজ ও privacy পাতায় আছে। `privacy.html` English সংস্করণ। দুটো ভাষার ফাইলই GitHub repository-তে প্রকাশ করুন।
- সাঁইত্রিশটি specific English search landing page: image, PDF, and SVG tools plus 20 common text, developer, and calculator tools. `/tools/` links to every landing page; 500+ remaining small tools stay searchable in the catalog. প্রতিটি পেজে আলাদা title, description, steps, সীমাবদ্ধতা ও internal links থাকে; বৈধ site URL দিলে canonical URL-ও তৈরি হয়।

## সীমা ও খরচ

- বর্তমান সাইটে নিজস্ব সার্ভার খরচ নেই: সব tool client-side এবং hosting GitHub Pages-এর ফ্রি tier-এ। নিজের domain কিনলে আলাদা খরচ হতে পারে; ব্যবহার না করলেও চলে।
- GitHub Pages static site host করে; এখানে backend, PHP/Python server, database বা server-side video converter চালানো যায় না।
- GitHub Pages-এর নীতিতে ফ্রি হোস্টিংকে মূলত বাণিজ্যিক লেনদেন বা commercial SaaS চালানোর জন্য ব্যবহার করার সীমাবদ্ধতা আছে। এই বিনামূল্যের static utility/project showcase-এর বাইরে paid API, subscription বা ads-নির্ভর ব্যবসা শুরু করার আগে বর্তমান নীতি দেখে উপযুক্ত hosting বেছে নিন।
- ছবি আপনার ব্রাউজারে থাকে, তবে GitHub নিজস্ব hosting request log রাখতে পারে—privacy page-এ তা বলা আছে।
- ইনপুট হিসেবে ব্রাউজার-সমর্থিত PNG, JPEG, WebP, GIF, BMP, SVG, AVIF, HEIC/HEIF ও TIFF খোলা যেতে পারে; প্রকৃত সাপোর্ট ব্রাউজার ও ডিভাইসভেদে আলাদা। অ্যানিমেটেড GIF কনভার্ট করলে শুধু প্রথম ফ্রেম থাকে। খুব বড় ছবি ডিভাইসের memory সীমায় ব্যর্থ হতে পারে।
- HEIC→JPG-এর মতো query জনপ্রিয় হতে পারে, কিন্তু সাধারণ browser decoding নির্ভরযোগ্য নয়; তাই কাজ না করা SEO landing page বানিয়ে promise করা হয়নি। HEIC decoder যোগ করলে library, file size, browser limits ও privacy disclosure আগে যাচাই করুন।
- EXIF strip-কে সংবেদনশীল ফাইলের জন্য পূর্ণাঙ্গ forensic metadata erasure বলে ধরে নেবেন না।
- PDF tools password-protected/damaged file-এ ব্যর্থ হতে পারে; PDF compress, OCR, বা text editing এই সংস্করণে নেই। বড় ফাইল ও image-to-PDF রূপান্তরে browser memory সীমা প্রযোজ্য।
- YouTube/Instagram/TikTok downloader, MP3 extractor বা SVG optimizer এই MVP-তে নেই; এগুলোর জন্য উপযুক্ত অনুমতি, platform policy, এবং অনেক ক্ষেত্রে server-side কাজ লাগে।
- PDF library attribution: [pdf-lib (MIT)](https://github.com/Hopding/pdf-lib) handles PDF edits; [PDF.js (Apache-2.0)](https://github.com/mozilla/pdf.js) renders PDF pages. Libraries load from jsDelivr only when needed.

## ফ্রি hosting-এর বর্তমান নির্দেশনা

GitHub-এর অফিসিয়াল গাইডে branch থেকে প্রকাশ করতে `Settings → Pages → Deploy from a branch` বেছে root folder নির্বাচন করার পদ্ধতি দেওয়া আছে: [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart) এবং [publishing source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)। ব্যবহার/নীতির সীমা পরিবর্তিত হতে পারে: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)।

## SEO যাচাই ও আপডেট

### Google Search Console-এ জমা দেওয়া

1. GitHub Pages-এ সাইট প্রকাশিত ও খোলা যাচ্ছে নিশ্চিত করুন। `site-config.json`-এ সেই exact HTTPS URL বসিয়ে generator চালান; তৈরি `sitemap.xml`, `robots.txt` ও canonical-সহ HTML ফাইলগুলো repository-তে প্রকাশ করুন। Sitemap খুলে URL-গুলো আপনার প্রকাশিত ঠিকানার সঙ্গে মেলে কি না দেখুন।
2. [Google Search Console](https://search.google.com/search-console/) খুলে **URL-prefix property** হিসেবে সম্পূর্ণ সাইট URL যোগ করুন—project site হলে `/repository-name/` অংশসহ। Google দেওয়া verification পদ্ধতি অনুসরণ করুন। HTML file পদ্ধতি নিলে verification ফাইলটি repository root-এ যোগ করে প্রকাশিত URL-এ খোলে কি না যাচাই করুন; verify হওয়ার পর ফাইলটি সরাবেন না।
3. সঠিক property নির্বাচন করে **Sitemaps** রিপোর্টে শুধু `sitemap.xml` লিখে Submit করুন। রিপোর্টে Google sitemap পড়েছে কি না ও URL discovery status দেখুন।
4. **URL Inspection**-এ homepage এবং প্রধান tool landing page-এর প্রকাশিত URL পরীক্ষা করুন। Live test-এ page available হলে প্রয়োজনমতো **Request indexing** দিন। অনেক URL-এর জন্য বারবার আলাদা request না দিয়ে sitemap ব্যবহার করুন।
5. পরবর্তী দিন/সপ্তাহগুলোতে **Pages/Indexing** ও **Performance** রিপোর্ট দেখুন। Excluded/duplicate/crawled-not-indexed URL থাকলে কারণ ও পেজের নিজস্ব উপযোগিতা যাচাই করুন। সার্চে ফল দেখাতে সময় লাগতে পারে।

**গুরুত্বপূর্ণ:** এই repository-র ফাইল থেকে Search Console ownership verify, live sitemap submit, URL inspection বা Google indexing status দেখা সম্ভব নয়। এসব করতে প্রকাশিত URL এবং সেই Search Console property-তে আপনার owner/full-user access লাগবে। Google-এর live reports-ই প্রকৃত অবস্থা জানায়; sitemap বা indexing request কোনো পেজকে index বা rank করার নিশ্চয়তা দেয় না। Search Console ছাড়া প্রকৃত query performance বা দৈনিক search volume জানা যায় না। কেবল একই template-এ format নাম পাল্টে শত শত পাতার কনটেন্ট বানাবেন না—প্রতিটি landing page-এ আলাদা ও সঠিক ব্যবহার-তথ্য এবং কাজ করা converter থাকা জরুরি।

এই সাতটি route জনপ্রিয় image-format intent এবং বর্তমানে কাজ করা browser-side output অনুযায়ী বাছাই করা হয়েছে; এগুলো Google Keyword Planner-এর volume claim নয়। একটি স্বাধীন conversion service-এর 2026 report-এ HEIC→JPEG, WebP→JPG/JPEG ও PNG→WebP বেশি দেখা গেছে, কিন্তু সেটি Google search volume নয়: [Convert.Online report](https://convert.online/reports/file-conversions-2026)। Google-এর people-first ও sitemap নির্দেশনা: [helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)।








