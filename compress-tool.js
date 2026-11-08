(() => {
  const bn = document.documentElement.lang === 'bn';
  const T = bn ? {
    drop: 'ছবি এখানে ছাড়ুন', or: 'অথবা ডিভাইস থেকে এক বা একাধিক ছবি বাছুন', pick: 'ছবি বাছুন',
    fmt: 'আউটপুট', same: 'একই ফরম্যাট', quality: 'মান', maxkb: 'সর্বোচ্চ সাইজ (KB, ঐচ্ছিক)', maxw: 'সর্বোচ্চ প্রস্থ (px, ঐচ্ছিক)',
    run: 'কমপ্রেস করুন', ready: 'ফাইল আপনার ব্রাউজারেই থাকবে। সার্ভারে আপলোড হয় না।', first: 'আগে ছবি বেছে নিন।',
    working: 'কমপ্রেস হচ্ছে…', save: 'ডাউনলোড', all: 'সব ডাউনলোড', bad: 'এই ছবিটি খোলা যায়নি',
    bigger: 'ফলাফল মূল ফাইলের চেয়ে বড় হয়েছে। মূল ফাইলটিই রাখুন, অথবা WebP/JPG বেছে নিন।',
    pngNote: 'PNG লসলেস, তাই মান কমালে সাইজ কমে না। আরও ছোট করতে WebP বা JPG বেছে নিন, অথবা সর্বোচ্চ সাইজ দিন।',
    miss: 'এই সাইজে পৌঁছানো যায়নি। কম প্রস্থ দিয়ে আবার চেষ্টা করুন।', saved: 'সাশ্রয়', done: 'শেষ',
    switched: 'সাইজ সীমা মানতে PNG-র বদলে WebP/JPG ব্যবহার হয়েছে।'
  } : {
    drop: 'Drop images here', or: 'or choose one or more images from your device', pick: 'Choose images',
    fmt: 'Output', same: 'Same format', quality: 'Quality', maxkb: 'Max size (KB, optional)', maxw: 'Max width (px, optional)',
    run: 'Compress', ready: 'Files stay in your browser. Nothing is uploaded.', first: 'Choose an image first.',
    working: 'Compressing…', save: 'Download', all: 'Download all', bad: 'This image could not be opened',
    bigger: 'The result is larger than the original. Keep the original, or choose WebP or JPG.',
    pngNote: 'PNG is lossless, so lowering quality does not shrink it. Choose WebP or JPG for a much smaller file, or set a max size.',
    miss: 'Could not reach that size. Try again with a smaller max width.', saved: 'saved', done: 'Done',
    switched: 'Saved as WebP/JPG instead of PNG so it can reach the size limit.'
  };
  const EXT = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
  const kb = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
  const toBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));
  let webpOk;
  async function webpSupported() {
    if (webpOk === undefined) { const c = document.createElement('canvas'); c.width = c.height = 1; const b = await toBlob(c, 'image/webp', .8); webpOk = !!b && b.type === 'image/webp'; }
    return webpOk;
  }
  function draw(img, w, h, type) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
    x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
    return c;
  }
  // Quality for lossy formats; with a size limit, search quality then shrink the dimensions until it fits.
  async function compress(img, type, quality, maxBytes, maxW) {
    let w = img.naturalWidth, h = img.naturalHeight;
    if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    const lossy = type !== 'image/png';
    if (!maxBytes) return { blob: await toBlob(draw(img, w, h, type), type, quality), w, h, hit: true };
    let best = null;
    for (let step = 0; step < 14; step++) {
      const c = draw(img, w, h, type);
      if (lossy) {
        let lo = .05, hi = .95, found = null;
        for (let i = 0; i < 7; i++) {
          const q = (lo + hi) / 2, b = await toBlob(c, type, q);
          if (b && b.size <= maxBytes) { found = b; lo = q; } else hi = q;
        }
        if (found) return { blob: found, w, h, hit: true };
        best = { blob: await toBlob(c, type, .05), w, h, hit: false };
      } else {
        const b = await toBlob(c, type);
        best = { blob: b, w, h, hit: b.size <= maxBytes };
        if (best.hit) return best;
      }
      w = Math.max(16, Math.round(w * .85)); h = Math.max(16, Math.round(h * .85));
      if (w <= 16 || h <= 16) break;
    }
    return best;
  }
  function openImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => res({ img, url }); img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(T.bad)); }; img.src = url;
    });
  }
  function render(root, defaultTargetKb) {
    let files = [];
    root.innerHTML = `<div class="drop" id="drop"><div class="uploadicon">＋</div><strong>${T.drop}</strong><small>${T.or}</small><br><button class="btn" id="c-browse" type="button">${T.pick}</button><input id="c-file" type="file" accept="image/jpeg,image/png,image/webp,image/*" multiple class="hidden"></div>
<div class="controls"><label for="c-fmt">${T.fmt}</label><select id="c-fmt"><option value="same">${T.same}</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select>
<label for="c-q">${T.quality} <b id="c-qv">75</b></label><input id="c-q" type="range" min="10" max="95" value="75"></div>
<div class="controls"><label for="c-kb">${T.maxkb}</label><input id="c-kb" type="number" min="5" max="20000" placeholder="100" style="width:90px"><label for="c-w">${T.maxw}</label><input id="c-w" type="number" min="16" max="12000" placeholder="1920" style="width:90px"><button class="btn" id="c-run" type="button">${T.run}</button></div>
<p class="status" id="c-status">${T.ready}</p><div id="c-out"></div>`;
    const $ = (s) => root.querySelector(s), status = (s) => { $('#c-status').textContent = s; };
    const input = $('#c-file'), drop = $('#drop');
    const targetVal = Number(defaultTargetKb) || Number(root.getAttribute('data-target-kb')) || Number(new URLSearchParams(location.search).get('kb'));
    if (targetVal >= 5 && targetVal <= 20000) $('#c-kb').value = String(Math.round(targetVal));
    $('#c-browse').onclick = () => input.click();
    const take = (list) => { files = [...list].filter((f) => f.type.startsWith('image/')); status(files.length ? `${files.length} · ${files.map((f) => f.name).join(', ').slice(0, 120)}` : T.first); };
    input.onchange = () => take(input.files);
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('drag'); take(e.dataTransfer.files); };
    $('#c-q').oninput = () => { $('#c-qv').textContent = $('#c-q').value; };
    $('#c-run').onclick = async () => {
      if (!files.length) { status(T.first); return; }
      const out = $('#c-out'); out.innerHTML = ''; status(T.working);
      const q = Number($('#c-q').value) / 100, maxBytes = (Number($('#c-kb').value) || 0) * 1024, maxW = Number($('#c-w').value) || 0;
      const canWebp = await webpSupported(); const results = [];
      for (const f of files) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-top:1px solid #e7ebe5;padding:10px 0;font-size:13px';
        out.append(row);
        try {
          const { img, url } = await openImage(f);
          let type = $('#c-fmt').value === 'same' ? (f.type === 'image/png' ? 'image/png' : f.type === 'image/webp' && canWebp ? 'image/webp' : 'image/jpeg') : $('#c-fmt').value;
          if (type === 'image/webp' && !canWebp) type = 'image/jpeg';
          let switched = false;
          if (type === 'image/png' && maxBytes) { type = canWebp ? 'image/webp' : 'image/jpeg'; switched = true; }
          const r = await compress(img, type, q, maxBytes, maxW); URL.revokeObjectURL(url);
          const name = `${f.name.replace(/\.[^.]+$/, '')}-compressed.${EXT[r.blob.type] || 'jpg'}`;
          const pct = Math.round((1 - r.blob.size / f.size) * 100);
          let note = '';
          if (r.blob.size >= f.size) note = T.bigger; else if (type === 'image/png' && !maxBytes && !maxW) note = T.pngNote;
          if (switched) note = (T.switched + (maxBytes && !r.hit ? ' ' + T.miss : ''));
          else if (maxBytes && !r.hit) note = T.miss;
          const a = document.createElement('a'); a.className = 'btn'; a.style.textDecoration = 'none'; a.textContent = T.save; a.href = URL.createObjectURL(r.blob); a.download = name;
          row.innerHTML = `<span style="flex:1;min-width:160px"><b></b><br><small style="color:#647066"></small></span>`;
          row.querySelector('b').textContent = f.name;
          row.querySelector('small').textContent = `${kb(f.size)} → ${kb(r.blob.size)} (${pct > 0 ? `${pct}% ${T.saved}` : '+' + Math.abs(pct) + '%'}) · ${r.w}×${r.h}px${note ? ' · ' + note : ''}`;
          row.append(a); results.push(a);
        } catch (e) { row.textContent = `${f.name}: ${e.message || T.bad}`; }
      }
      if (results.length > 1) {
        const all = document.createElement('button'); all.className = 'btn'; all.type = 'button'; all.textContent = T.all; all.style.marginTop = '10px';
        all.onclick = () => results.forEach((a, i) => setTimeout(() => a.click(), i * 350)); out.append(all);
      }
      status(T.done);
    };
  }
  window.SnapKitCompress = { render };

  if (typeof document !== 'undefined') {
    const init = () => {
      document.querySelectorAll('[data-tool-compress]').forEach((el) => {
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
