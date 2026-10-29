(() => {
  let pdfLibPromise;
  let pdfJsPromise;
  const pdfJsVersion = '5.4.624';
  function loadPdfJs() {
    if (!pdfJsPromise) pdfJsPromise = import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/build/pdf.mjs`).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/build/pdf.worker.mjs`;
      return pdfjs;
    }).catch((error) => { pdfJsPromise = null; throw new Error(`PDF renderer could not load. Check your internet connection and try again. (${error.message})`); });
    return pdfJsPromise;
  }
  const libraryUrl = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  function loadPdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (!pdfLibPromise) pdfLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = libraryUrl;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => window.PDFLib ? resolve(window.PDFLib) : reject(new Error('PDF library did not start.'));
      script.onerror = () => { pdfLibPromise = null; reject(new Error('PDF library could not load. Check your internet connection and try again.')); };
      document.head.append(script);
    });
    return pdfLibPromise;
  }

  function render(tool, root) {
    const merge = tool === 'pdf-merge';
    const extract = tool === 'pdf-extract';
    const imageToPdf = tool === 'pdf-image';
    const info = tool === 'pdf-info';
    const toImage = tool === 'pdf-to-image';
    const svgToPdf = tool === 'svg-to-pdf';
    const imageFiles = imageToPdf || svgToPdf;
    const multiple = merge || imageToPdf ? 'multiple' : '';
    root.innerHTML = `<div class="drop" id="pdf-drop"><div class="uploadicon">＋</div><strong>${imageToPdf ? 'ছবির ফাইল এখানে ছাড়ুন' : svgToPdf ? 'SVG ফাইল এখানে ছাড়ুন' : merge ? 'PDF ফাইল এখানে ছাড়ুন' : 'একটি PDF এখানে ছাড়ুন'}</strong><small>${imageToPdf ? 'এক বা একাধিক ছবি · প্রতি ছবিতে একটি পৃষ্ঠা' : svgToPdf ? 'একটি ভেক্টর SVG · PDF পেজে বসানো হবে' : merge ? 'একাধিক PDF · তালিকার ক্রমেই জোড়া হবে' : 'শুধু PDF ফাইল'}</small><br><button class="btn" id="pdf-browse" type="button">${imageToPdf ? 'ছবি বাছুন' : svgToPdf ? 'SVG বাছুন' : 'PDF বাছুন'}</button><input id="pdf-input" type="file" accept="${imageToPdf ? 'image/*,.svg' : svgToPdf ? 'image/svg+xml,.svg' : 'application/pdf,.pdf'}" ${multiple} class="hidden"></div>
      <div id="pdf-files" class="status">এখনও কোনো ফাইল বাছেননি।</div>
      ${extract ? '<label style="font-size:12px;color:#647066;display:block;margin-top:12px">যে পৃষ্ঠাগুলো রাখতে চান (উদাহরণ: 1-3,5)<input id="pdf-range" value="1" inputmode="numeric" style="display:block;width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin-top:5px"></label>' : ''}
      ${imageFiles ? `<fieldset class="pdf-settings" style="display:grid;grid-template-columns:1fr;gap:8px;border:1px solid #e7ebe5;border-radius:12px;padding:12px;margin:12px 0"><legend>PDF পেজ সেটিংস</legend><label for="pdf-page-size">পেজের ধরন</label><select id="pdf-page-size"><option value="a4">A4</option><option value="a3">A3</option><option value="a5">A5</option><option value="letter">Letter</option><option value="legal">Legal</option><option value="tabloid">Tabloid</option></select><label for="pdf-orientation">দিক / Orientation</label><select id="pdf-orientation"><option value="auto">Auto — প্রতিটি ছবির shape অনুযায়ী</option><option value="portrait">Portrait — সব পেজ লম্বা</option><option value="landscape">Landscape — সব পেজ আড়াআড়ি</option></select>${svgToPdf ? '<label for="pdf-vector-scale">SVG render resolution</label><select id="pdf-vector-scale"><option value="1">Standard · 1×</option><option value="2" selected>High · 2×</option><option value="3">Print · 3×</option><option value="4">Maximum · 4×</option></select>' : ''}<label for="pdf-fit">ছবি পেজে বসানোর নিয়ম</label><select id="pdf-fit"><option value="contain">Fit — পুরো ছবি, অনুপাত ঠিক থাকবে</option><option value="fill">Fill — পুরো পেজ ভরবে, অনুপাত বদলাতে পারে</option></select><label for="pdf-margin">পেজের চারপাশে margin (mm)</label><input id="pdf-margin" type="number" min="0" max="40" value="8" inputmode="decimal"><label for="pdf-background">স্বচ্ছ ছবির background</label><input id="pdf-background" type="color" value="#ffffff" aria-label="Transparent image background color"><label for="pdf-title">PDF document title (optional)</label><input id="pdf-title" type="text" maxlength="120" placeholder="My photo document"></fieldset>` : ''}
      ${toImage ? '<div class="controls"><label for="pdf-page-number">Page number</label><input id="pdf-page-number" type="number" min="1" value="1" inputmode="numeric"><label for="pdf-image-format">Image format</label><select id="pdf-image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></div>' : ''}
      ${tool === 'pdf-rotate' ? '<div class="controls"><label for="pdf-angle">ঘোরানোর কোণ</label><select id="pdf-angle"><option value="90">৯০°</option><option value="180">১৮০°</option><option value="270">২৭০°</option></select></div>' : ''}
      <div class="controls"><button class="btn" id="pdf-run" type="button">${imageToPdf ? 'PDF তৈরি করুন' : svgToPdf ? 'SVG থেকে PDF তৈরি করুন' : toImage ? 'Convert page to image' : info ? 'পৃষ্ঠা সংখ্যা দেখুন' : merge ? 'PDF একত্র করুন' : extract ? 'নির্বাচিত পৃষ্ঠা ডাউনলোড' : 'ঘোরানো PDF ডাউনলোড'}</button></div>
      <p class="status" id="pdf-status">ফাইল আপনার ব্রাউজারেই প্রসেস হবে। ${toImage ? 'PDF.js renderer loads from CDN on first use.' : 'pdf-lib loads from CDN when needed.'}</p>`;

    const picker = root.querySelector('#pdf-input');
    const drop = root.querySelector('#pdf-drop');
    const list = root.querySelector('#pdf-files');
    const status = root.querySelector('#pdf-status');
    function setFiles(files) {
      const selected = imageToPdf
        ? [...files].filter((file) => file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(file.name))
        : svgToPdf
          ? [...files].filter((file) => file.type === 'image/svg+xml' || /\.svg$/i.test(file.name))
        : [...files].filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      const accepted = merge || imageToPdf ? selected : selected.slice(0, 1);
      picker._pdfFiles = accepted;
      list.textContent = accepted.length ? accepted.map((file, index) => `${index + 1}. ${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`).join('\n') : imageFiles ? (svgToPdf ? 'একটি SVG বেছে নিন।' : 'একটি ছবি বেছে নিন।') : 'একটি PDF বেছে নিন।';
      if (imageToPdf && !accepted.length) list.textContent = 'একটি ছবি বেছে নিন।';
      list.style.whiteSpace = 'pre-line';
      const language = document.documentElement.lang;
      const fileKind = imageToPdf ? 'ছবি' : svgToPdf ? 'SVG' : 'PDF';
      status.textContent = accepted.length ? (language === 'en' ? `✓ ${accepted.length} ${imageToPdf ? 'image' : svgToPdf ? 'SVG' : 'PDF'} file${accepted.length === 1 ? '' : 's'} selected successfully. Safe in your browser; not uploaded.` : `✓ ${accepted.length}টি ${fileKind} ফাইল সফলভাবে যোগ হয়েছে। ব্রাউজারেই আছে; সার্ভারে আপলোড হয়নি।`) : `${fileKind} ফাইলটি পাওয়া যায়নি।`;
    }
    root.querySelector('#pdf-browse').onclick = () => picker.click();
    picker.onchange = () => setFiles(picker.files);
    drop.ondragover = (event) => { event.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (event) => { event.preventDefault(); drop.classList.remove('drag'); setFiles(event.dataTransfer.files); };
    root.querySelector('#pdf-run').onclick = async () => {
      const files = picker._pdfFiles || [];
      if (!files.length) { status.textContent = imageToPdf ? 'আগে একটি ছবি বেছে নিন।' : svgToPdf ? 'আগে একটি SVG বেছে নিন।' : 'আগে একটি PDF বেছে নিন।'; return; }
      if (merge && files.length < 2) { status.textContent = 'একত্র করতে অন্তত দুটি PDF বেছে নিন।'; return; }
        if (imageFiles && files.some((file) => file.size > 40 * 1024 * 1024)) { status.textContent = 'প্রতিটি ফাইলের আকার ৪০ MB-এর কম রাখুন।'; return; }
      status.textContent = 'PDF প্রসেস হচ্ছে… ফাইলের আকার অনুযায়ী কিছুটা সময় লাগতে পারে।';
      try {
        if (toImage) {
          status.textContent = 'Rendering the selected page…';
          const pdfjs = await loadPdfJs();
          const file = files[0];
          if (file.size > 100 * 1024 * 1024) throw new Error('Keep the PDF below 100 MB for browser rendering.');
          const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
          const pageNumber = Number(root.querySelector('#pdf-page-number').value);
          if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pdf.numPages) { await pdf.destroy(); throw new Error(`Choose a page from 1 to ${pdf.numPages}.`); }
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.5 });
          if (viewport.width > 6000 || viewport.height > 6000 || viewport.width * viewport.height > 24000000) { await pdf.destroy(); throw new Error('This page is too large to render on this device.'); }
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d', { alpha: false });
          if (!context) { await pdf.destroy(); throw new Error('This browser cannot render the PDF page.'); }
          context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          const format = root.querySelector('#pdf-image-format').value;
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, format, 0.92));
          if (!blob) { await pdf.destroy(); throw new Error('Could not create an image from this page.'); }
          const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
          anchor.href = url; anchor.download = `pdf-page-${pageNumber}.${format === 'image/jpeg' ? 'jpg' : 'png'}`; anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1500);
          status.textContent = `Page ${pageNumber} of ${pdf.numPages} downloaded as ${format === 'image/jpeg' ? 'JPG' : 'PNG'}.`;
          await pdf.destroy(); return;
        }
        const { PDFDocument, degrees } = await loadPdfLib();
        let bytes;
        let filename;
        if (imageFiles) {
          const output = await PDFDocument.create();
          const pageSize = root.querySelector('#pdf-page-size').value;
          const sizes = { a3: [841.89, 1190.55], a4: [595.28, 841.89], a5: [419.53, 595.28], letter: [612, 792], legal: [612, 1008], tabloid: [792, 1224] };
          const baseSize = sizes[pageSize] || sizes.a4;
          const orientation = root.querySelector('#pdf-orientation').value;
          const fit = root.querySelector('#pdf-fit').value;
          const marginMm = Number(root.querySelector('#pdf-margin').value);
          if (!Number.isFinite(marginMm) || marginMm < 0 || marginMm > 40) throw new Error('Margin ০ থেকে ৪০ mm-এর মধ্যে দিন।');
          const margin = marginMm * 72 / 25.4;
          const bg = root.querySelector('#pdf-background').value;
          const background = { r: parseInt(bg.slice(1, 3), 16) / 255, g: parseInt(bg.slice(3, 5), 16) / 255, b: parseInt(bg.slice(5, 7), 16) / 255 };
          output.setTitle(root.querySelector('#pdf-title').value.trim() || (svgToPdf ? 'SVG artwork' : 'Images to PDF'));
          for (const file of files) {
            const renderScale = svgToPdf ? Number(root.querySelector('#pdf-vector-scale').value) : 1;
            const image = await embedImage(output, file, renderScale);
            const landscape = orientation === 'landscape' || (orientation === 'auto' && image.width > image.height);
            const pageWidth = landscape ? baseSize[1] : baseSize[0];
            const pageHeight = landscape ? baseSize[0] : baseSize[1];
            const page = output.addPage([pageWidth, pageHeight]);
            page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: background });
            const boxWidth = pageWidth - margin * 2;
            const boxHeight = pageHeight - margin * 2;
            if (boxWidth <= 0 || boxHeight <= 0) throw new Error('Page margin খুব বড়; কম margin বেছে নিন।');
            let width = boxWidth, height = boxHeight;
            if (fit === 'contain') {
              const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
              width = image.width * scale; height = image.height * scale;
            }
            page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
          }
          bytes = await output.save();
          filename = svgToPdf ? 'snapkit-vector-artwork.pdf' : 'snapkit-images.pdf';
        } else if (info) {
          const source = await PDFDocument.load(await files[0].arrayBuffer());
          status.textContent = `এই PDF-এ ${source.getPageCount()}টি পৃষ্ঠা আছে।`;
          return;
        } else if (merge) {
          const output = await PDFDocument.create();
          for (const file of files) {
            const source = await PDFDocument.load(await file.arrayBuffer());
            const pages = await output.copyPages(source, source.getPageIndices());
            pages.forEach((page) => output.addPage(page));
          }
          bytes = await output.save();
          filename = 'snapkit-merged.pdf';
        } else {
          const output = await PDFDocument.load(await files[0].arrayBuffer());
          if (extract) {
            const indices = parsePageRange(root.querySelector('#pdf-range').value, output.getPageCount());
            const selected = await PDFDocument.create();
            const pages = await selected.copyPages(output, indices);
            pages.forEach((page) => selected.addPage(page));
            bytes = await selected.save();
            filename = 'snapkit-pages.pdf';
          } else {
            const angle = Number(root.querySelector('#pdf-angle').value);
            for (const page of output.getPages()) page.setRotation(degrees((page.getRotation().angle + angle) % 360));
            bytes = await output.save();
            filename = 'snapkit-rotated.pdf';
          }
        }
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        status.textContent = 'কাজ শেষ—PDF ডাউনলোড হয়েছে।';
      } catch (error) {
        status.textContent = toImage ? error.message : imageFiles
          ? `${svgToPdf ? 'SVG' : 'ছবি'} PDF-এ রূপান্তর করা যায়নি। অন্য ফাইল চেষ্টা করুন। (${error.message})`
          : error.message.startsWith('পৃষ্ঠা') || error.message.startsWith('অন্তত')
            ? error.message
            : `PDF খোলা বা প্রসেস করা যায়নি। ফাইলটি password-protected বা damaged হলে আগে সেটি unlock/repair করুন। (${error.message})`;
      }
    };
  }

  async function embedImage(pdf, file, renderScale = 1) {
    const name = file.name.toLowerCase();
    const jpeg = file.type === 'image/jpeg' || /\.(jpe?g)$/i.test(name);
    const png = file.type === 'image/png' || name.endsWith('.png');
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (jpeg) return pdf.embedJpg(bytes);
    if (png) return pdf.embedPng(bytes);

    let bitmap;
    let image;
    let objectUrl;
    try {
      if (typeof createImageBitmap === 'function' && !/\.svg$/i.test(name) && !file.type.includes('svg')) {
        bitmap = await createImageBitmap(file);
      } else {
        objectUrl = URL.createObjectURL(file);
        image = new Image();
        image.src = objectUrl;
        await image.decode();
      }
      const width = bitmap ? bitmap.width : image.naturalWidth;
      const height = bitmap ? bitmap.height : image.naturalHeight;
      if (!width || !height || width > 12000 || height > 12000) throw new Error('ছবির মাপ খুব বড়; ১২০০০ পিক্সেলের কম মাপের ছবি ব্যবহার করুন।');
      const outputWidth = Math.round(width * renderScale);
      const outputHeight = Math.round(height * renderScale);
      if (outputWidth > 10000 || outputHeight > 10000 || outputWidth * outputHeight > 30000000) throw new Error('Render size is too large for this device. Choose a lower SVG resolution.');
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('এই ব্রাউজারে ছবিটি প্রসেস করা যায়নি।');
      context.drawImage(bitmap || image, 0, 0, outputWidth, outputHeight);
      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('ছবিটি PDF-এর জন্য প্রস্তুত করা যায়নি।');
      return pdf.embedPng(new Uint8Array(await pngBlob.arrayBuffer()));
    } finally {
      if (bitmap && typeof bitmap.close === 'function') bitmap.close();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  function parsePageRange(value, pageCount) {
    const pages = new Set();
    for (const part of value.split(',').map((item) => item.trim()).filter(Boolean)) {
      const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) throw new Error('পৃষ্ঠা এভাবে লিখুন: 1-3,5');
      const start = Number(match[1]);
      const end = Number(match[2] || match[1]);
      if (start < 1 || end < start || end > pageCount) throw new Error(`পৃষ্ঠা 1 থেকে ${pageCount}-এর মধ্যে দিন।`);
      for (let page = start; page <= end; page++) pages.add(page - 1);
    }
    if (!pages.size) throw new Error('অন্তত একটি পৃষ্ঠা নম্বর দিন।');
    return [...pages].sort((a, b) => a - b);
  }

  window.SnapKitPdf = { render };
})();
