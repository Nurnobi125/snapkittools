(() => {
  const bn = document.documentElement.lang === 'bn';
  const T = bn ? {
    drop: 'একটি PDF এখানে ছাড়ুন', or: 'শুধু PDF ফাইল · আপলোড হয় না', pick: 'PDF বাছুন',
    mode: 'কীভাবে ভাগ করবেন', every: 'প্রতিটি পৃষ্ঠা আলাদা PDF', ranges: 'নিজের রেঞ্জ অনুযায়ী (যেমন 1-3, 4-6, 9)', nth: 'প্রতি N পৃষ্ঠায় একটি PDF',
    rangeLabel: 'রেঞ্জ (কমা দিয়ে আলাদা করুন; প্রতিটি রেঞ্জ একটি নতুন PDF)', nLabel: 'N =',
    run: 'PDF ভাগ করুন', ready: 'ফাইল আপনার ব্রাউজারেই প্রসেস হবে। pdf-lib প্রথমবার CDN থেকে লোড হয়।',
    first: 'আগে একটি PDF বেছে নিন।', loading: 'লাইব্রেরি লোড হচ্ছে…', working: 'ভাগ হচ্ছে…',
    pages: 'পৃষ্ঠা', files: 'টি ফাইল তৈরি হয়েছে', zip: 'সব একসাথে ZIP ডাউনলোড', save: 'ডাউনলোড',
    badRange: 'রেঞ্জ ঠিক নেই। উদাহরণ: 1-3, 4-6, 9। পৃষ্ঠা ১ থেকে', badN: 'N অবশ্যই ১ বা তার বেশি হতে হবে।',
    tooMany: 'একসাথে সর্বোচ্চ ৫০০টি ফাইল তৈরি করা যায়। বড় N বা কম রেঞ্জ দিন।',
    open: 'PDF খোলা যায়নি। পাসওয়ার্ড-সুরক্ষিত বা নষ্ট ফাইল সমর্থিত নয়।', lib: 'PDF লাইব্রেরি লোড হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।', more: 'আরও'
  } : {
    drop: 'Drop a PDF here', or: 'PDF files only · nothing is uploaded', pick: 'Choose PDF',
    mode: 'How to split', every: 'Every page as its own PDF', ranges: 'By my own ranges (e.g. 1-3, 4-6, 9)', nth: 'One PDF for every N pages',
    rangeLabel: 'Ranges (comma-separated; each range becomes a new PDF)', nLabel: 'N =',
    run: 'Split PDF', ready: 'Files stay in your browser. pdf-lib loads from a CDN on first use.',
    first: 'Choose a PDF first.', loading: 'Loading PDF library…', working: 'Splitting…',
    pages: 'pages', files: ' files created', zip: 'Download all as ZIP', save: 'Download',
    badRange: 'Invalid range. Example: 1-3, 4-6, 9. Pages run from 1 to', badN: 'N must be 1 or more.',
    tooMany: 'At most 500 files can be created at once. Use a larger N or fewer ranges.',
    open: 'This PDF could not be opened. Password-protected or damaged files are not supported.', lib: 'The PDF library could not load. Check your connection and try again.', more: 'more'
  };
  const LIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  let libPromise;
  function loadLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (!libPromise) libPromise = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = LIB; s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer';
      s.onload = () => window.PDFLib ? res(window.PDFLib) : rej(new Error(T.lib));
      s.onerror = () => { libPromise = null; rej(new Error(T.lib)); };
      document.head.append(s);
    });
    return libPromise;
  }
  // Minimal store-only ZIP writer (no compression; PDFs are already compressed).
  const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function makeZip(files) {
    const enc = new TextEncoder(), d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = [], central = []; let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, f.data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    }
    const cSize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  }
  const pad = (n, w) => String(n).padStart(w, '0');
  const kb = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

  function render(root) {
    let file = null;
    root.innerHTML = `<div class="drop" id="s-drop"><div class="uploadicon">＋</div><strong>${T.drop}</strong><small>${T.or}</small><br><button class="btn" id="s-browse" type="button">${T.pick}</button><input id="s-file" type="file" accept="application/pdf,.pdf" class="hidden"></div>
<div class="controls"><label for="s-mode">${T.mode}</label><select id="s-mode"><option value="every">${T.every}</option><option value="ranges">${T.ranges}</option><option value="nth">${T.nth}</option></select></div>
<div class="controls" id="s-range-row" style="display:none"><label for="s-range">${T.rangeLabel}</label><input id="s-range" type="text" value="1-3, 4-6" style="min-width:220px;border:1px solid #e7ebe5;border-radius:9px;padding:9px 11px"></div>
<div class="controls" id="s-n-row" style="display:none"><label for="s-n">${T.nLabel}</label><input id="s-n" type="number" min="1" value="2" style="width:80px"></div>
<div class="controls"><button class="btn" id="s-run" type="button">${T.run}</button></div>
<p class="status" id="s-status">${T.ready}</p><div id="s-out"></div>`;
    const $ = (s) => root.querySelector(s), status = (s) => { $('#s-status').textContent = s; };
    const input = $('#s-file'), drop = $('#s-drop');
    const setFile = (f) => { if (f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name))) { file = f; status(`✓ ${f.name} · ${kb(f.size)}`); } else { file = null; status(T.first); } };
    $('#s-browse').onclick = () => input.click();
    input.onchange = () => setFile(input.files[0]);
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('drag'); setFile(e.dataTransfer.files[0]); };
    $('#s-mode').onchange = () => { const m = $('#s-mode').value; $('#s-range-row').style.display = m === 'ranges' ? '' : 'none'; $('#s-n-row').style.display = m === 'nth' ? '' : 'none'; };

    $('#s-run').onclick = async () => {
      if (!file) { status(T.first); return; }
      const out = $('#s-out'); out.innerHTML = ''; status(T.loading);
      let lib, src, total;
      try { lib = await loadLib(); } catch (e) { status(e.message); return; }
      try { src = await lib.PDFDocument.load(await file.arrayBuffer()); total = src.getPageCount(); } catch (e) { status(T.open); return; }
      // Build the page groups first so bad input is reported before any work happens.
      const mode = $('#s-mode').value, groups = [];
      if (mode === 'every') { for (let i = 0; i < total; i++) groups.push({ pages: [i], label: `page-${i + 1}` }); }
      else if (mode === 'nth') {
        const n = Math.floor(Number($('#s-n').value));
        if (!(n >= 1)) { status(T.badN); return; }
        for (let i = 0; i < total; i += n) { const end = Math.min(total, i + n); groups.push({ pages: Array.from({ length: end - i }, (_, k) => i + k), label: end - i === 1 ? `page-${i + 1}` : `pages-${i + 1}-${end}` }); }
      } else {
        for (const tok of $('#s-range').value.split(',').map((x) => x.trim()).filter(Boolean)) {
          const m = tok.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
          const a = m ? Number(m[1]) : 0, b = m ? Number(m[2] || m[1]) : 0;
          if (!m || a < 1 || b < a || b > total) { status(`${T.badRange} ${total}.`); return; }
          groups.push({ pages: Array.from({ length: b - a + 1 }, (_, k) => a - 1 + k), label: a === b ? `page-${a}` : `pages-${a}-${b}` });
        }
        if (!groups.length) { status(`${T.badRange} ${total}.`); return; }
      }
      if (groups.length > 500) { status(T.tooMany); return; }
      status(T.working);
      const base = file.name.replace(/\.pdf$/i, '') || 'document', made = [], w = String(groups.length).length;
      try {
        for (let g = 0; g < groups.length; g++) {
          const doc = await lib.PDFDocument.create();
          (await doc.copyPages(src, groups[g].pages)).forEach((p) => doc.addPage(p));
          const data = await doc.save();
          made.push({ name: `${base}-${pad(g + 1, w)}-${groups[g].label}.pdf`, data, count: groups[g].pages.length });
          if (g % 10 === 9) { status(`${T.working} ${g + 1}/${groups.length}`); await new Promise((r) => setTimeout(r)); }
        }
      } catch (e) { status(e.message || T.open); return; }
      const shown = made.slice(0, 40);
      for (const f of shown) {
        const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-top:1px solid #e7ebe5;padding:8px 0;font-size:13px';
        const label = document.createElement('span'); label.style.cssText = 'flex:1;min-width:160px'; label.textContent = `${f.name} · ${f.count} ${T.pages} · ${kb(f.data.length)}`;
        const a = document.createElement('a'); a.className = 'btn'; a.style.textDecoration = 'none'; a.textContent = T.save; a.href = URL.createObjectURL(new Blob([f.data], { type: 'application/pdf' })); a.download = f.name;
        row.append(label, a); out.append(row);
      }
      if (made.length > shown.length) { const m = document.createElement('p'); m.className = 'status'; m.textContent = `+ ${made.length - shown.length} ${T.more} (ZIP)`; out.append(m); }
      if (made.length > 1) {
        const z = document.createElement('a'); z.className = 'btn'; z.style.cssText = 'display:inline-block;text-decoration:none;margin-top:12px'; z.textContent = T.zip;
        z.href = URL.createObjectURL(makeZip(made)); z.download = `${base}-split.zip`; out.append(z);
      }
      status(`✓ ${made.length}${T.files}`);
    };
  }
  window.SnapKitSplit = { render };

  if (typeof document !== 'undefined') {
    const init = () => {
      document.querySelectorAll('[data-tool-split]').forEach((el) => {
        if (!el._mounted) {
          el._mounted = true;
          render(el);
        }
      });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
