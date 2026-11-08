(() => {
  'use strict';
  const isBn = document.documentElement.lang === 'bn';

  function render(root) {
    const toolId = root.getAttribute('data-tool-id') || 'word-count';

    let html = '';
    if (toolId === 'word-count' || toolId === 'essay-word-counter') {
      html = `
        <div class="util-card">
          <label for="u-text" style="font-weight:700;display:block;margin-bottom:8px">${isBn ? 'আপনার লেখা এখানে পেস্ট বা টাইপ করুন' : 'Paste or type your text here'}:</label>
          <textarea id="u-text" rows="8" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:14px;font:inherit;resize:vertical" placeholder="${isBn ? 'লেখা লিখুন…' : 'Start typing or paste text…'}"></textarea>
          <div id="u-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:14px">
            <div class="stat-pill" style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px;text-align:center"><b id="s-words" style="font-size:22px;display:block;color:#26382e">0</b><span style="font-size:12px;color:#65736a">${isBn ? 'শব্দ (Words)' : 'Words'}</span></div>
            <div class="stat-pill" style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px;text-align:center"><b id="s-chars" style="font-size:22px;display:block;color:#26382e">0</b><span style="font-size:12px;color:#65736a">${isBn ? 'অক্ষর (Chars)' : 'Characters'}</span></div>
            <div class="stat-pill" style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px;text-align:center"><b id="s-chars-ns" style="font-size:22px;display:block;color:#26382e">0</b><span style="font-size:12px;color:#65736a">${isBn ? 'স্পেস ছাড়া' : 'No Spaces'}</span></div>
            <div class="stat-pill" style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px;text-align:center"><b id="s-reading" style="font-size:22px;display:block;color:#26382e">0s</b><span style="font-size:12px;color:#65736a">${isBn ? 'পড়ার সময়' : 'Reading Time'}</span></div>
          </div>
          <div style="margin-top:12px;display:flex;gap:10px">
            <button class="btn" id="u-clear" type="button">${isBn ? 'মুছে ফেলুন' : 'Clear Text'}</button>
          </div>
        </div>
      `;
      root.innerHTML = html;
      const ta = root.querySelector('#u-text');
      const wEl = root.querySelector('#s-words');
      const cEl = root.querySelector('#s-chars');
      const cnsEl = root.querySelector('#s-chars-ns');
      const rEl = root.querySelector('#s-reading');
      const clearBtn = root.querySelector('#u-clear');

      const update = () => {
        const val = ta.value;
        const words = val.trim() ? (val.trim().match(/\S+/g) || []).length : 0;
        const chars = val.length;
        const charsNoSpaces = val.replace(/\s/g, '').length;
        const readSeconds = Math.ceil(words / 3.3);
        const readTime = readSeconds >= 60 ? `${Math.ceil(readSeconds / 60)} min` : `${readSeconds}s`;

        wEl.textContent = words;
        cEl.textContent = chars;
        cnsEl.textContent = charsNoSpaces;
        rEl.textContent = readTime;
      };
      ta.oninput = update;
      clearBtn.onclick = () => { ta.value = ''; update(); ta.focus(); };
    } else if (toolId === 'character-count') {
      html = `
        <div class="util-card">
          <label for="u-text" style="font-weight:700;display:block;margin-bottom:8px">${isBn ? 'টেক্সট লিখুন বা পেস্ট করুন' : 'Enter or paste text'}:</label>
          <textarea id="u-text" rows="8" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:14px;font:inherit;resize:vertical" placeholder="${isBn ? 'এখানে টেক্সট দিন…' : 'Enter your text…'}"></textarea>
          <div style="display:flex;gap:14px;margin-top:14px;flex-wrap:wrap">
            <div style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px 20px;text-align:center"><b id="s-chars" style="font-size:22px;display:block;color:#26382e">0</b><span style="font-size:12px;color:#65736a">${isBn ? 'মোট অক্ষর' : 'Total Characters'}</span></div>
            <div style="background:#fff;border:1px solid #e7ebe5;border-radius:12px;padding:12px 20px;text-align:center"><b id="s-chars-ns" style="font-size:22px;display:block;color:#26382e">0</b><span style="font-size:12px;color:#65736a">${isBn ? 'স্পেস ছাড়া অক্ষর' : 'Without Spaces'}</span></div>
          </div>
        </div>
      `;
      root.innerHTML = html;
      const ta = root.querySelector('#u-text');
      ta.oninput = () => {
        root.querySelector('#s-chars').textContent = ta.value.length;
        root.querySelector('#s-chars-ns').textContent = ta.value.replace(/\s/g, '').length;
      };
    } else if (toolId === 'json-format' || toolId === 'json-minify') {
      html = `
        <div class="util-card">
          <label for="u-json" style="font-weight:700;display:block;margin-bottom:8px">${isBn ? 'JSON পেস্ট করুন' : 'Paste JSON'}:</label>
          <textarea id="u-json" rows="8" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:14px;font:13px ui-monospace,monospace;resize:vertical" placeholder='{"name":"SnapKit","free":true}'></textarea>
          <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn" id="u-format" type="button">${isBn ? 'সুন্দরভাবে সাজান (Beautify 2 spaces)' : 'Format JSON (2 spaces)'}</button>
            <button class="btn" id="u-minify" type="button" style="background:#4b584f">${isBn ? 'ছোট করুন (Minify)' : 'Minify JSON'}</button>
            <button class="btn" id="u-copy" type="button" style="background:#fff;color:#26382e;border:1px solid #cbd4c9">${isBn ? 'কপি করুন' : 'Copy'}</button>
          </div>
          <p id="u-status" style="font-size:13px;color:#65736a;margin-top:10px"></p>
        </div>
      `;
      root.innerHTML = html;
      const ta = root.querySelector('#u-json');
      const st = root.querySelector('#u-status');
      const runFormat = (indent) => {
        try {
          if (!ta.value.trim()) return;
          const parsed = JSON.parse(ta.value);
          ta.value = JSON.stringify(parsed, null, indent);
          st.textContent = isBn ? '✓ বৈধ JSON — ফরম্যাট সফল!' : '✓ Valid JSON formatted successfully!';
          st.style.color = '#315d20';
        } catch (e) {
          st.textContent = `Error: ${e.message}`;
          st.style.color = '#c53929';
        }
      };
      root.querySelector('#u-format').onclick = () => runFormat(2);
      root.querySelector('#u-minify').onclick = () => runFormat(0);
      root.querySelector('#u-copy').onclick = () => {
        navigator.clipboard.writeText(ta.value);
        st.textContent = isBn ? 'ক্লিপবোর্ডে কপি হয়েছে!' : 'Copied to clipboard!';
      };
      if (toolId === 'json-minify') {
        setTimeout(() => runFormat(0), 10);
      }
    } else if (toolId === 'password-generator') {
      html = `
        <div class="util-card">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
            <label for="u-len" style="font-weight:700">${isBn ? 'দৈর্ঘ্য' : 'Length'}:</label>
            <input id="u-len" type="number" min="6" max="64" value="16" style="width:70px;padding:8px;border:1px solid #cbd4c9;border-radius:8px">
            <label><input id="u-sym" type="checkbox" checked> ${isBn ? 'স্পেশাল চিহ্ন (!@#$)' : 'Symbols (!@#$)'}</label>
            <label><input id="u-num" type="checkbox" checked> ${isBn ? 'সংখ্যা (0-9)' : 'Numbers (0-9)'}</label>
            <button class="btn" id="u-gen" type="button">${isBn ? 'নতুন পাসওয়ার্ড বানান' : 'Generate Password'}</button>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <input id="u-out" type="text" readonly style="flex:1;padding:12px;border:1px solid #cbd4c9;border-radius:10px;font:16px ui-monospace,monospace;background:#fff;font-weight:700">
            <button class="btn" id="u-copy" type="button">${isBn ? 'কপি' : 'Copy'}</button>
          </div>
          <p id="u-st" style="font-size:13px;color:#65736a;margin-top:8px"></p>
        </div>
      `;
      root.innerHTML = html;
      const gen = () => {
        const len = Number(root.querySelector('#u-len').value) || 16;
        const sym = root.querySelector('#u-sym').checked;
        const num = root.querySelector('#u-num').checked;
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (num) chars += '0123456789';
        if (sym) chars += '!@#$%^&*()_+~|}{[]:;?><,./-=';
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        let pwd = '';
        for (let i = 0; i < len; i++) pwd += chars[arr[i] % chars.length];
        root.querySelector('#u-out').value = pwd;
        root.querySelector('#u-st').textContent = '';
      };
      root.querySelector('#u-gen').onclick = gen;
      root.querySelector('#u-copy').onclick = () => {
        navigator.clipboard.writeText(root.querySelector('#u-out').value);
        root.querySelector('#u-st').textContent = isBn ? 'কপিকৃত!' : 'Copied!';
      };
      gen();
    } else if (toolId === 'uuid-generator') {
      html = `
        <div class="util-card">
          <div style="display:flex;gap:10px;align-items:center">
            <input id="u-uuid" type="text" readonly style="flex:1;padding:12px;border:1px solid #cbd4c9;border-radius:10px;font:16px ui-monospace,monospace;background:#fff;font-weight:700">
            <button class="btn" id="u-gen" type="button">${isBn ? 'নতুন তৈরি করুন' : 'Generate New'}</button>
            <button class="btn" id="u-copy" type="button" style="background:#fff;color:#26382e;border:1px solid #cbd4c9">${isBn ? 'কপি' : 'Copy'}</button>
          </div>
          <p id="u-st" style="font-size:13px;color:#65736a;margin-top:8px"></p>
        </div>
      `;
      root.innerHTML = html;
      const gen = () => {
        root.querySelector('#u-uuid').value = crypto.randomUUID();
        root.querySelector('#u-st').textContent = '';
      };
      root.querySelector('#u-gen').onclick = gen;
      root.querySelector('#u-copy').onclick = () => {
        navigator.clipboard.writeText(root.querySelector('#u-uuid').value);
        root.querySelector('#u-st').textContent = isBn ? 'কপিকৃত!' : 'Copied!';
      };
      gen();
    } else if (toolId === 'base64-encode') {
      html = `
        <div class="util-card">
          <label for="u-in" style="font-weight:700;display:block;margin-bottom:8px">Input Text:</label>
          <textarea id="u-in" rows="4" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:12px;font:inherit" placeholder="Hello World"></textarea>
          <div style="margin:10px 0;display:flex;gap:10px">
            <button class="btn" id="u-enc" type="button">Encode to Base64</button>
            <button class="btn" id="u-dec" type="button" style="background:#4b584f">Decode from Base64</button>
          </div>
          <label for="u-out" style="font-weight:700;display:block;margin-bottom:8px">Result:</label>
          <textarea id="u-out" rows="4" readonly style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:12px;font:13px ui-monospace,monospace;background:#fff"></textarea>
        </div>
      `;
      root.innerHTML = html;
      const input = root.querySelector('#u-in');
      const output = root.querySelector('#u-out');
      root.querySelector('#u-enc').onclick = () => {
        try { output.value = btoa(unescape(encodeURIComponent(input.value))); } catch (e) { output.value = e.message; }
      };
      root.querySelector('#u-dec').onclick = () => {
        try { output.value = decodeURIComponent(escape(atob(input.value.trim()))); } catch (e) { output.value = e.message; }
      };
    } else if (toolId === 'sha256-hash') {
      html = `
        <div class="util-card">
          <label for="u-in" style="font-weight:700;display:block;margin-bottom:8px">Text to hash:</label>
          <textarea id="u-in" rows="3" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:12px;font:inherit" placeholder="Enter text…"></textarea>
          <label for="u-hash" style="font-weight:700;display:block;margin:12px 0 6px">SHA-256 Digest:</label>
          <input id="u-hash" type="text" readonly style="width:100%;padding:12px;border:1px solid #cbd4c9;border-radius:10px;font:14px ui-monospace,monospace;background:#fff">
        </div>
      `;
      root.innerHTML = html;
      const ta = root.querySelector('#u-in');
      const out = root.querySelector('#u-hash');
      const hash = async () => {
        if (!ta.value) { out.value = ''; return; }
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ta.value));
        out.value = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      };
      ta.oninput = hash;
      hash();
    } else if (toolId === 'percentage') {
      html = `
        <div class="util-card" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          <label>What is <input id="p-x" type="number" value="15" style="width:80px;padding:8px;border:1px solid #cbd4c9;border-radius:8px"> % of <input id="p-y" type="number" value="200" style="width:90px;padding:8px;border:1px solid #cbd4c9;border-radius:8px"> ?</label>
          <button class="btn" id="p-calc" type="button">Calculate</button>
          <span style="font-size:18px;font-weight:800;color:#26382e" id="p-res">= 30</span>
        </div>
      `;
      root.innerHTML = html;
      const calc = () => {
        const x = Number(root.querySelector('#p-x').value) || 0;
        const y = Number(root.querySelector('#p-y').value) || 0;
        root.querySelector('#p-res').textContent = `= ${(x * y / 100).toLocaleString()}`;
      };
      root.querySelector('#p-calc').onclick = calc;
      root.querySelector('#p-x').oninput = calc;
      root.querySelector('#p-y').oninput = calc;
    } else {
      // Generic runner for other utilities
      html = `
        <div class="util-card">
          <label for="u-in" style="font-weight:700;display:block;margin-bottom:8px">${isBn ? 'ইনপুট দিন' : 'Input'}:</label>
          <textarea id="u-in" rows="5" style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:12px;font:inherit" placeholder="${isBn ? 'এখানে টেক্সট দিন…' : 'Enter input here…'}"></textarea>
          <div style="margin:12px 0">
            <button class="btn" id="u-run" type="button">${isBn ? 'প্রসেস করুন' : 'Process'}</button>
          </div>
          <label for="u-out" style="font-weight:700;display:block;margin-bottom:8px">${isBn ? 'ফলাফল' : 'Result'}:</label>
          <textarea id="u-out" rows="5" readonly style="width:100%;border:1px solid #cbd4c9;border-radius:12px;padding:12px;font:13px ui-monospace,monospace;background:#fff"></textarea>
        </div>
      `;
      root.innerHTML = html;
      const inp = root.querySelector('#u-in');
      const outp = root.querySelector('#u-out');
      root.querySelector('#u-run').onclick = () => {
        const v = inp.value;
        if (toolId === 'url-encode') outp.value = encodeURIComponent(v);
        else if (toolId === 'url-parser') {
          try {
            const u = new URL(v);
            outp.value = JSON.stringify({ origin: u.origin, pathname: u.pathname, search: u.search, hash: u.hash }, null, 2);
          } catch (e) { outp.value = e.message; }
        } else {
          outp.value = v;
        }
      };
    }
  }

  window.SnapKitUtility = { render };

  if (typeof document !== 'undefined') {
    const init = () => {
      document.querySelectorAll('[data-tool-utility]').forEach((el) => {
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