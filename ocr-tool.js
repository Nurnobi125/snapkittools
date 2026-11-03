/* SnapKit OCR tool: extracts text from images in the browser.
   Uses Tesseract.js (loaded from jsDelivr on first use) and JSZip for .docx export.
   Images are processed locally and are not uploaded to SnapKit. */
(function () {
  'use strict';

  var TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  var JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  var LANGS = [
    ['eng', 'English'],
    ['ben', 'Bangla (বাংলা)'],
    ['eng+ben', 'English + Bangla']
  ];

  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Strip characters that are not allowed in XML 1.0
  function cleanText(s) {
    return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
  }

  // Minimal valid .docx parts: one paragraph per line of text.
  function docxParts(text) {
    var lines = cleanText(text).replace(/\r\n?/g, '\n').split('\n');
    var body = lines.map(function (line) {
      return '<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>';
    }).join('');
    return {
      contentTypes: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '</Types>',
      rels: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>',
      document: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>' +
        '</w:body></w:document>'
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { docxParts: docxParts };
    return;
  }

  var loaded = {};
  function loadScript(url) {
    if (loaded[url]) return loaded[url];
    loaded[url] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = url;
      el.async = true;
      el.onload = resolve;
      el.onerror = function () { delete loaded[url]; reject(new Error('Could not load ' + url)); };
      document.head.appendChild(el);
    });
    return loaded[url];
  }

  function injectStyles() {
    if (document.getElementById('ocr-tool-style')) return;
    var css =
      '.ocr-box{border:1px solid var(--line);background:var(--white);border-radius:16px;padding:18px;margin:18px 0 8px;color:var(--ink)}' +
      '.ocr-row{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-bottom:12px}' +
      '.ocr-box label{display:block;font-size:13px;font-weight:700;margin-bottom:5px}' +
      '.ocr-box input[type=file],.ocr-box select,.ocr-box textarea{width:100%;font:inherit;color:var(--ink);background:transparent;border:1px solid var(--line);border-radius:10px;padding:10px}' +
      '.ocr-box select{min-width:190px}' +
      '.ocr-field{flex:1 1 220px}' +
      '.ocr-btn{font:inherit;font-weight:750;border:0;border-radius:10px;padding:11px 16px;cursor:pointer;background:#26382e;color:#fff}' +
      ':root[data-theme="dark"] .ocr-btn{background:#caff6c;color:#10200f}' +
      '.ocr-btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}' +
      '.ocr-btn[disabled]{opacity:.5;cursor:not-allowed}' +
      '.ocr-status{font-size:14px;color:var(--muted);min-height:22px;margin:6px 0}' +
      '.ocr-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin:4px 0 10px}' +
      '.ocr-bar i{display:block;height:100%;width:0;background:#83a84f;transition:width .2s}' +
      '.ocr-box textarea{min-height:200px;resize:vertical;line-height:1.5}' +
      '.ocr-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
      '.ocr-note{font-size:13px;color:var(--muted);margin:10px 0 0}';
    var style = document.createElement('style');
    style.id = 'ocr-tool-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function mount(root) {
    injectStyles();
    var defaultLang = root.getAttribute('data-lang') || 'eng';

    var box = el('div', { 'class': 'ocr-box' });

    var row = el('div', { 'class': 'ocr-row' });
    var f1 = el('div', { 'class': 'ocr-field' });
    f1.appendChild(el('label', { 'for': 'ocr-file' }, 'Choose image(s)'));
    var file = el('input', { type: 'file', id: 'ocr-file', accept: 'image/*', multiple: 'multiple' });
    f1.appendChild(file);
    var f2 = el('div', { 'class': 'ocr-field' });
    f2.appendChild(el('label', { 'for': 'ocr-lang' }, 'Text language'));
    var lang = el('select', { id: 'ocr-lang' });
    LANGS.forEach(function (l) {
      var o = el('option', { value: l[0] }, l[1]);
      if (l[0] === defaultLang) o.selected = true;
      lang.appendChild(o);
    });
    f2.appendChild(lang);
    row.appendChild(f1);
    row.appendChild(f2);

    var run = el('button', { type: 'button', 'class': 'ocr-btn' }, 'Extract text');
    var status = el('p', { 'class': 'ocr-status', 'aria-live': 'polite' }, 'Choose one or more images, then select Extract text.');
    var barWrap = el('div', { 'class': 'ocr-bar', 'aria-hidden': 'true' });
    var bar = el('i');
    barWrap.appendChild(bar);

    var out = el('textarea', { id: 'ocr-out', 'aria-label': 'Extracted text', placeholder: 'Extracted text will appear here. You can edit it before copying or downloading.' });

    var actions = el('div', { 'class': 'ocr-actions' });
    var copy = el('button', { type: 'button', 'class': 'ocr-btn ghost' }, 'Copy text');
    var txt = el('button', { type: 'button', 'class': 'ocr-btn ghost' }, 'Download .txt');
    var docx = el('button', { type: 'button', 'class': 'ocr-btn ghost' }, 'Download Word (.docx)');
    [copy, txt, docx].forEach(function (b) { b.disabled = true; actions.appendChild(b); });

    var note = el('p', { 'class': 'ocr-note' }, 'The first run downloads the OCR engine and language data, so it can take a little longer. Your images stay in this browser tab.');

    box.appendChild(row);
    box.appendChild(run);
    box.appendChild(status);
    box.appendChild(barWrap);
    box.appendChild(out);
    box.appendChild(actions);
    box.appendChild(note);
    root.appendChild(box);

    function setBusy(busy) { run.disabled = busy; file.disabled = busy; lang.disabled = busy; }
    function syncButtons() { var has = out.value.trim().length > 0; copy.disabled = txt.disabled = docx.disabled = !has; }
    out.addEventListener('input', syncButtons);

    run.addEventListener('click', function () {
      var files = Array.prototype.filter.call(file.files || [], function (f) { return /^image\//.test(f.type); });
      if (!files.length) { status.textContent = 'Please choose at least one image file (JPG, PNG, WebP, BMP or similar).'; return; }
      setBusy(true);
      out.value = '';
      syncButtons();
      bar.style.width = '2%';
      status.textContent = 'Loading the OCR engine…';
      var worker = null;
      var current = 0;

      loadScript(TESSERACT_URL).then(function () {
        return window.Tesseract.createWorker(lang.value, 1, {
          logger: function (m) {
            if (m && m.status === 'recognizing text') {
              var p = (current + m.progress) / files.length;
              bar.style.width = Math.max(4, Math.round(p * 100)) + '%';
              status.textContent = 'Reading image ' + (current + 1) + ' of ' + files.length + '… ' + Math.round(m.progress * 100) + '%';
            } else if (m && m.status) {
              status.textContent = 'Preparing: ' + m.status + '…';
            }
          }
        });
      }).then(function (w) {
        worker = w;
        var parts = [];
        var chain = Promise.resolve();
        files.forEach(function (f, i) {
          chain = chain.then(function () {
            current = i;
            return worker.recognize(f).then(function (res) {
              var t = (res && res.data && res.data.text ? res.data.text : '').trim();
              parts.push(files.length > 1 ? '--- ' + f.name + ' ---\n' + t : t);
            });
          });
        });
        return chain.then(function () { return parts.join('\n\n'); });
      }).then(function (text) {
        out.value = text;
        bar.style.width = '100%';
        status.textContent = text.trim() ? 'Done. Check the text for mistakes, then copy or download it.' : 'No text was found. Try a sharper, higher-contrast image or crop closer to the text.';
        syncButtons();
      }).catch(function (err) {
        bar.style.width = '0';
        status.textContent = 'Something went wrong: ' + (err && err.message ? err.message : 'the OCR engine could not run') + '. Check your internet connection (the engine loads from a CDN) and try again.';
      }).then(function () {
        setBusy(false);
        if (worker) { try { worker.terminate(); } catch (e) { /* ignore */ } }
      });
    });

    copy.addEventListener('click', function () {
      var done = function () { status.textContent = 'Text copied.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(out.value).then(done, function () { out.select(); document.execCommand('copy'); done(); });
      } else { out.select(); document.execCommand('copy'); done(); }
    });

    txt.addEventListener('click', function () {
      download(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), 'extracted-text.txt');
    });

    docx.addEventListener('click', function () {
      status.textContent = 'Creating Word file…';
      loadScript(JSZIP_URL).then(function () {
        var parts = docxParts(out.value);
        var zip = new window.JSZip();
        zip.file('[Content_Types].xml', parts.contentTypes);
        zip.folder('_rels').file('.rels', parts.rels);
        zip.folder('word').file('document.xml', parts.document);
        return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      }).then(function (blob) {
        download(blob, 'extracted-text.docx');
        status.textContent = 'Word file downloaded. It contains the text only, not the original layout or pictures.';
      }).catch(function () {
        status.textContent = 'Could not create the Word file. Check your internet connection and try again, or use Download .txt.';
      });
    });
  }

  function init() {
    var roots = document.querySelectorAll('[data-ocr-app]');
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
