(() => {
  'use strict';
  const isBn = document.documentElement.lang === 'bn';
  const T = isBn ? {
    drop: 'ছবি এখানে ছাড়ুন',
    or: 'অথবা ডিভাইস থেকে ছবি বাছুন',
    pick: 'ছবি বাছুন',
    convertBtn: (to) => `${to}-তে রূপান্তর ও ডাউনলোড`,
    resizeBtn: 'রিসাইজ ও ডাউনলোড',
    cleanBtn: 'মেটাডেটা পরিষ্কার কপি ডাউনলোড',
    paletteBtn: 'রং বের করুন',
    quality: 'আউটপুট মান (Quality)',
    width: 'প্রস্থ (Width px)',
    height: 'উচ্চতা (Height px)',
    keepRatio: 'অনুপাত ঠিক রাখুন',
    ready: 'ফাইল আপনার ব্রাউজারেই প্রসেস হবে। কোনো সার্ভারে আপলোড হয় না।',
    first: 'আগে একটি ছবি বেছে নিন।',
    converting: 'প্রসেস হচ্ছে…',
    done: 'কাজ শেষ—ফাইল ডাউনলোড হয়েছে।',
    copied: 'হেক্স কোড কপি হয়েছে!',
    bad: 'এই ছবিটি এই ব্রাউজারে খোলা যাচ্ছে না।'
  } : {
    drop: 'Drop your image here',
    or: 'or choose an image from your device',
    pick: 'Choose Image',
    convertBtn: (to) => `Convert to ${to} & Download`,
    resizeBtn: 'Resize & Download',
    cleanBtn: 'Download Clean Copy (Strip EXIF)',
    paletteBtn: 'Extract Dominant Colors',
    quality: 'Output Quality',
    width: 'Width (px)',
    height: 'Height (px)',
    keepRatio: 'Maintain Aspect Ratio',
    ready: 'Files are processed securely in your browser. Nothing is uploaded to any server.',
    first: 'Please choose an image file first.',
    converting: 'Processing image…',
    done: 'Done — your file has been downloaded.',
    copied: 'Hex code copied!',
    bad: 'This image could not be opened in this browser.'
  };

  const EXT_MAP = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/bmp': 'bmp'
  };

  function formatBytes(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function render(root) {
    const specialMode = root.getAttribute('data-mode') || ''; // 'resize', 'clean', 'palette', 'social-preview'
    const targetMime = root.getAttribute('data-mime') || 'image/png';
    const fromFormat = (root.getAttribute('data-from') || 'Image').toUpperCase();
    const toFormat = (root.getAttribute('data-to') || EXT_MAP[targetMime] || 'PNG').toUpperCase();
    const isLossy = targetMime === 'image/jpeg' || targetMime === 'image/webp';

    let currentFile = null;
    let currentImg = null;

    if (specialMode === 'social-preview') {
      root.innerHTML = `
        <div class="util-card">
          <label style="font-weight:700;display:block;margin-bottom:6px">Page Title:
            <input id="og-title" type="text" value="SnapKit — Free Online Tools" style="width:100%;padding:10px;border:1px solid #cbd4c9;border-radius:9px;margin-top:4px">
          </label>
          <label style="font-weight:700;display:block;margin:12px 0 6px">Description:
            <input id="og-desc" type="text" value="Fast, free browser tools with no file upload and no sign-up." style="width:100%;padding:10px;border:1px solid #cbd4c9;border-radius:9px;margin-top:4px">
          </label>
          <div style="margin-top:16px;border:1px solid #cbd4c9;border-radius:14px;overflow:hidden;background:#fff;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.06)">
            <div style="height:190px;background:linear-gradient(135deg,#caff6c,#eceaff);display:grid;place-items:center;font-size:48px;font-weight:900;color:#26382e">✳</div>
            <div style="padding:14px">
              <small style="text-transform:uppercase;color:#65736a;font-weight:700;font-size:11px;letter-spacing:1px">SNAPKITTOOLS.ONLINE</small>
              <b id="og-preview-title" style="display:block;font-size:16px;margin:4px 0;color:#17251f">SnapKit — Free Online Tools</b>
              <p id="og-preview-desc" style="margin:0;font-size:13px;color:#65736a">Fast, free browser tools with no file upload and no sign-up.</p>
            </div>
          </div>
        </div>
      `;
      const tIn = root.querySelector('#og-title');
      const dIn = root.querySelector('#og-desc');
      const pt = root.querySelector('#og-preview-title');
      const pd = root.querySelector('#og-preview-desc');
      const sync = () => { pt.textContent = tIn.value || 'Title'; pd.textContent = dIn.value || 'Description'; };
      tIn.oninput = sync;
      dIn.oninput = sync;
      return;
    }

    let controlsHtml = '';
    if (specialMode === 'resize') {
      controlsHtml = `
        <div class="controls" style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <label style="font-size:13px;font-weight:600">${T.width} <input id="res-w" type="number" min="10" max="10000" style="width:90px;padding:8px"></label>
          <label style="font-size:13px;font-weight:600">${T.height} <input id="res-h" type="number" min="10" max="10000" style="width:90px;padding:8px"></label>
          <label style="font-size:13px"><input id="res-ratio" type="checkbox" checked> ${T.keepRatio}</label>
          <button class="btn" id="conv-run" type="button" style="padding:11px 18px;font-size:13px">${T.resizeBtn}</button>
        </div>
      `;
    } else if (specialMode === 'clean') {
      controlsHtml = `
        <div class="controls" style="margin-top:14px">
          <button class="btn" id="conv-run" type="button" style="padding:11px 18px;font-size:13px">${T.cleanBtn}</button>
        </div>
      `;
    } else if (specialMode === 'palette') {
      controlsHtml = `
        <div class="controls" style="margin-top:14px">
          <button class="btn" id="conv-run" type="button" style="padding:11px 18px;font-size:13px">${T.paletteBtn}</button>
        </div>
        <div id="palette-swatches" style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"></div>
      `;
    } else {
      controlsHtml = `
        <div class="controls" style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          ${isLossy ? `<label for="conv-q" style="font-size:13px;font-weight:600">${T.quality} <b id="conv-qv">90%</b></label><input id="conv-q" type="range" min="30" max="100" value="90" style="accent-color:#688b39">` : ''}
          <button class="btn" id="conv-run" type="button" style="padding:11px 18px;font-size:13px">${T.convertBtn(toFormat)}</button>
        </div>
      `;
    }

    root.innerHTML = `
      <div class="drop" id="conv-drop">
        <div class="uploadicon">＋</div>
        <strong>${T.drop}</strong>
        <small>${T.or}</small><br>
        <button class="btn" id="conv-browse" type="button">${T.pick}</button>
        <input id="conv-file" type="file" accept="image/*,.svg,.heic,.heif,.webp,.avif,.bmp" class="hidden">
        <img class="preview" id="conv-preview" alt="Preview">
      </div>
      ${controlsHtml}
      <p class="status" id="conv-status">${T.ready}</p>
    `;

    const drop = root.querySelector('#conv-drop');
    const input = root.querySelector('#conv-file');
    const preview = root.querySelector('#conv-preview');
    const status = root.querySelector('#conv-status');
    const runBtn = root.querySelector('#conv-run');
    const browseBtn = root.querySelector('#conv-browse');
    const qSlider = root.querySelector('#conv-q');
    const qVal = root.querySelector('#conv-qv');

    if (qSlider && qVal) {
      qSlider.oninput = () => { qVal.textContent = qSlider.value + '%'; };
    }

    browseBtn.onclick = () => input.click();
    input.onchange = () => { if (input.files[0]) load(input.files[0]); };

    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (e) => {
      e.preventDefault();
      drop.classList.remove('drag');
      if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
    };

    function load(f) {
      currentFile = f;
      const url = URL.createObjectURL(f);
      currentImg = new Image();
      currentImg.onload = () => {
        preview.src = url;
        preview.style.display = 'block';
        preview.style.margin = '14px auto 0';
        status.textContent = `${f.name} · ${currentImg.naturalWidth}×${currentImg.naturalHeight}px · ${formatBytes(f.size)}`;

        if (specialMode === 'resize') {
          const wIn = root.querySelector('#res-w');
          const hIn = root.querySelector('#res-h');
          wIn.value = currentImg.naturalWidth;
          hIn.value = currentImg.naturalHeight;
          const ratio = currentImg.naturalWidth / currentImg.naturalHeight;
          wIn.oninput = () => {
            if (root.querySelector('#res-ratio').checked && wIn.value) {
              hIn.value = Math.round(Number(wIn.value) / ratio);
            }
          };
          hIn.oninput = () => {
            if (root.querySelector('#res-ratio').checked && hIn.value) {
              wIn.value = Math.round(Number(hIn.value) * ratio);
            }
          };
        }
      };
      currentImg.onerror = () => {
        status.textContent = T.bad;
      };
      currentImg.src = url;
    }

    if (!runBtn) return;

    runBtn.onclick = async () => {
      if (!currentImg || !currentFile) {
        status.textContent = T.first;
        return;
      }
      status.textContent = T.converting;

      if (specialMode === 'palette') {
        const c = document.createElement('canvas');
        c.width = 80; c.height = 80;
        const ctx = c.getContext('2d');
        ctx.drawImage(currentImg, 0, 0, 80, 80);
        const data = ctx.getImageData(0, 0, 80, 80).data;
        const bins = {};
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i] >> 4, g = data[i + 1] >> 4, b = data[i + 2] >> 4;
          const k = (r << 8) | (g << 4) | b;
          bins[k] = (bins[k] || 0) + 1;
        }
        const top = Object.entries(bins).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => {
          const n = Number(k), r = ((n >> 8) & 15) * 17, g = ((n >> 4) & 15) * 17, b = (n & 15) * 17;
          return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        });
        const out = root.querySelector('#palette-swatches');
        out.innerHTML = top.map(hex => `
          <div style="flex:1;min-width:70px;height:80px;background:${hex};border-radius:12px;display:flex;align-items:end;padding:8px;font:11px ui-monospace,monospace;color:#fff;text-shadow:0 1px 3px #000;cursor:pointer" title="Click to copy hex">
            ${hex.toUpperCase()}
          </div>
        `).join('');
        out.querySelectorAll('div').forEach((d, i) => {
          d.onclick = () => {
            navigator.clipboard.writeText(top[i]);
            status.textContent = `${top[i]} ${T.copied}`;
          };
        });
        status.textContent = isBn ? 'রং বের করা হয়েছে। হেক্স কোড কপি করতে বক্সে ক্লিক করুন।' : 'Colors extracted. Click any swatch to copy hex code.';
        return;
      }

      let w = currentImg.naturalWidth;
      let h = currentImg.naturalHeight;

      if (specialMode === 'resize') {
        w = Number(root.querySelector('#res-w').value) || w;
        h = Number(root.querySelector('#res-h').value) || h;
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      const outMime = specialMode === 'clean' ? 'image/png' : targetMime;
      if (outMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(currentImg, 0, 0, w, h);

      const quality = qSlider ? Number(qSlider.value) / 100 : 0.92;
      canvas.toBlob((blob) => {
        if (!blob) {
          status.textContent = T.bad;
          return;
        }
        const ext = EXT_MAP[blob.type || outMime] || (specialMode === 'clean' ? 'png' : toFormat.toLowerCase());
        const baseName = currentFile.name.replace(/\.[^.]+$/, '');
        const filename = `${baseName}-${specialMode === 'resize' ? 'resized' : specialMode === 'clean' ? 'clean' : 'converted'}.${ext}`;

        const a = document.createElement('a');
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

        status.textContent = `${T.done} (${w}×${h}px, ${formatBytes(blob.size)})`;
      }, outMime, quality);
    };
  }

  window.SnapKitConverter = { render };

  if (typeof document !== 'undefined') {
    const init = () => {
      document.querySelectorAll('[data-tool-converter]').forEach((el) => {
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