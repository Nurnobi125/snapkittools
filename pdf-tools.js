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
    const isBn = document.documentElement.lang === 'bn';
    const T = isBn ? {
      dropImg: 'ছবির ফাইল এখানে ছাড়ুন', dropSvg: 'SVG ফাইল এখানে ছাড়ুন', dropPdfs: 'PDF ফাইল এখানে ছাড়ুন', dropPdf: 'একটি PDF এখানে ছাড়ুন',
      subImg: 'এক বা একাধিক ছবি · প্রতি ছবিতে একটি পৃষ্ঠা', subSvg: 'একটি ভেক্টর SVG · PDF পেজে বসানো হবে', subPdfs: 'একাধিক PDF · তালিকার ক্রমেই জোড়া হবে', subPdf: 'শুধু PDF ফাইল',
      btnImg: 'ছবি বাছুন', btnSvg: 'SVG বাছুন', btnPdf: 'PDF বাছুন',
      noFiles: 'এখনও কোনো ফাইল বাছেননি।',
      pickImg: 'একটি ছবি বেছে নিন।', pickSvg: 'একটি SVG বেছে নিন।', pickPdf: 'একটি PDF বেছে নিন।',
      firstImg: 'আগে একটি ছবি বেছে নিন।', firstSvg: 'আগে একটি SVG বেছে নিন।', firstPdf: 'আগে একটি PDF বেছে নিন।',
      minMerge: 'একত্র করতে অন্তত দুটি PDF বেছে নিন।',
      settings: 'PDF পেজ সেটিংস', pageSize: 'পেজের ধরন', orientation: 'দিক / Orientation',
      autoOrient: 'Auto — প্রতিটি ছবির shape অনুযায়ী', portrait: 'Portrait — সব পেজ লম্বা', landscape: 'Landscape — সব পেজ আড়াআড়ি',
      fit: 'ছবি পেজে বসানোর নিয়ম', contain: 'Fit — পুরো ছবি, অনুপাত ঠিক থাকবে', fill: 'Fill — পুরো পেজ ভরবে, অনুপাত বদলাতে পারে',
      margin: 'পেজের চারপাশে margin (mm)', bg: 'স্বচ্ছ ছবির background', title: 'PDF document title (optional)',
      keepPages: 'যে পৃষ্ঠাগুলো রাখতে চান (উদাহরণ: 1-3,5)', rotAngle: 'ঘোরানোর কোণ',
      runImg: 'PDF তৈরি করুন', runSvg: 'SVG থেকে PDF তৈরি করুন', runPageImg: 'Convert page to image', runCount: 'পৃষ্ঠা সংখ্যা দেখুন', runMerge: 'PDF একত্র করুন', runExtract: 'নির্বাচিত পৃষ্ঠা ডাউনলোড', runRotate: 'ঘোরানো PDF ডাউনলোড',
      processing: 'PDF প্রসেস হচ্ছে… ফাইলের আকার অনুযায়ী কিছুটা সময় লাগতে পারে।',
      done: 'কাজ শেষ—PDF ডাউনলোড হয়েছে।',
      safeReady: 'ফাইল আপনার ব্রাউজারেই প্রসেস হবে।',
      fileLimit: 'প্রতিটি ফাইলের আকার ৪০ MB-এর কম রাখুন।',
      marginErr: 'Margin ০ থেকে ৪০ mm-এর মধ্যে দিন।',
      marginLarge: 'Page margin খুব বড়; কম margin বেছে নিন।',
      imgLarge: 'ছবির মাপ খুব বড়; ১২০০০ পিক্সেলের কম মাপের ছবি ব্যবহার করুন।',
      pageRangeErr: 'পৃষ্ঠা এভাবে লিখুন: 1-3,5',
      pageBoundsErr: (max) => `পৃষ্ঠা 1 থেকে ${max}-এর মধ্যে দিন।`,
      pageAtLeastOne: 'অন্তত একটি পৃষ্ঠা নম্বর দিন।',
      pageCountMsg: (c) => `এই PDF-এ ${c}টি পৃষ্ঠা আছে।`,
      convertFail: (k, m) => `${k} PDF-এ রূপান্তর করা যায়নি। (${m})`,
      openFail: (m) => `PDF খোলা বা প্রসেস করা যায়নি। ফাইলটি password-protected বা damaged হলে আগে unlock/repair করুন। (${m})`
    } : {
      dropImg: 'Drop image files here', dropSvg: 'Drop SVG file here', dropPdfs: 'Drop PDF files here', dropPdf: 'Drop a PDF here',
      subImg: 'One or more images · one page per image', subSvg: 'Vector SVG artwork · placed onto PDF page', subPdfs: 'Multiple PDFs · merged in listed order', subPdf: 'PDF files only · processed privately in browser',
      btnImg: 'Choose images', btnSvg: 'Choose SVG', btnPdf: 'Choose PDF',
      noFiles: 'No files selected yet.',
      pickImg: 'Choose an image file.', pickSvg: 'Choose an SVG file.', pickPdf: 'Choose a PDF file.',
      firstImg: 'Please choose an image first.', firstSvg: 'Please choose an SVG first.', firstPdf: 'Please choose a PDF first.',
      minMerge: 'Choose at least two PDFs to merge.',
      settings: 'PDF Page Settings', pageSize: 'Page size', orientation: 'Orientation',
      autoOrient: 'Auto — match image dimensions', portrait: 'Portrait — vertical pages', landscape: 'Landscape — horizontal pages',
      fit: 'Image placement', contain: 'Fit — show full image, keep proportions', fill: 'Fill — fill whole page',
      margin: 'Page margins (mm)', bg: 'Background for transparency', title: 'PDF document title (optional)',
      keepPages: 'Pages to keep (e.g. 1-3, 5)', rotAngle: 'Rotation angle',
      runImg: 'Create PDF', runSvg: 'Convert SVG to PDF', runPageImg: 'Convert page to image', runCount: 'Count pages', runMerge: 'Merge PDFs', runExtract: 'Download selected pages', runRotate: 'Download rotated PDF',
      processing: 'Processing PDF in your browser… this may take a moment.',
      done: 'Done — your PDF has been downloaded.',
      safeReady: 'Files are processed securely in your browser.',
      fileLimit: 'Please keep each file under 40 MB.',
      marginErr: 'Margin must be between 0 and 40 mm.',
      marginLarge: 'Page margin is too large. Choose a smaller margin.',
      imgLarge: 'Image is too large. Use an image under 12,000 pixels.',
      pageRangeErr: 'Enter pages like this: 1-3,5',
      pageBoundsErr: (max) => `Enter pages between 1 and ${max}.`,
      pageAtLeastOne: 'Please enter at least one page number.',
      pageCountMsg: (c) => `This PDF contains ${c} page${c === 1 ? '' : 's'}.`,
      convertFail: (k, m) => `Could not convert ${k} to PDF. (${m})`,
      openFail: (m) => `Could not open or process the PDF. Check if it is password-protected or damaged. (${m})`
    };

    const merge = tool === 'pdf-merge';
    const extract = tool === 'pdf-extract';
    const imageToPdf = tool === 'pdf-image';
    const info = tool === 'pdf-info';
    const toImage = tool === 'pdf-to-image';
    const svgToPdf = tool === 'svg-to-pdf';
    const imageFiles = imageToPdf || svgToPdf;
    const multiple = merge || imageToPdf ? 'multiple' : '';

    const upload = `<div class="drop" id="pdf-drop"><div class="uploadicon">＋</div><strong>${imageToPdf ? T.dropImg : svgToPdf ? T.dropSvg : merge ? T.dropPdfs : T.dropPdf}</strong><small>${imageToPdf ? T.subImg : svgToPdf ? T.subSvg : merge ? T.subPdfs : T.subPdf}</small><br><button class="btn" id="pdf-browse" type="button">${imageToPdf ? T.btnImg : svgToPdf ? T.btnSvg : T.btnPdf}</button><input id="pdf-input" type="file" accept="${imageToPdf ? 'image/*,.svg' : svgToPdf ? 'image/svg+xml,.svg' : 'application/pdf,.pdf'}" ${multiple} class="hidden"></div><div id="pdf-files" class="status pdf-file-list">${T.noFiles}</div>`;
    const imageSettings = imageFiles ? `<fieldset class="pdf-settings"><legend>${T.settings}</legend><label for="pdf-page-size">${T.pageSize}</label><select id="pdf-page-size"><option value="a4">A4</option><option value="a3">A3</option><option value="a5">A5</option><option value="letter">Letter</option><option value="legal">Legal</option><option value="tabloid">Tabloid</option></select><label for="pdf-orientation">${T.orientation}</label><select id="pdf-orientation"><option value="auto">${T.autoOrient}</option><option value="portrait">${T.portrait}</option><option value="landscape">${T.landscape}</option></select>${svgToPdf ? '<label for="pdf-vector-scale">SVG render resolution</label><select id="pdf-vector-scale"><option value="1">Standard · 1×</option><option value="2" selected>High · 2×</option><option value="3">Print · 3×</option><option value="4">Maximum · 4×</option></select>' : ''}<label for="pdf-fit">${T.fit}</label><select id="pdf-fit"><option value="contain">${T.contain}</option><option value="fill">${T.fill}</option></select><label for="pdf-margin">${T.margin}</label><input id="pdf-margin" type="number" min="0" max="40" value="8" inputmode="decimal"><label for="pdf-background">${T.bg}</label><input id="pdf-background" type="color" value="#ffffff" aria-label="Transparent image background color"><label for="pdf-title">${T.title}</label><input id="pdf-title" type="text" maxlength="120" placeholder="${svgToPdf ? 'Vector Document' : 'My PDF Document'}"></fieldset>` : '';

    root.innerHTML = `${imageFiles ? `<div class="pdf-image-layout"><section class="pdf-upload-column" aria-label="${imageToPdf ? 'Image files' : 'SVG file'}">${upload}</section>${imageSettings}</div>` : `${upload}${extract ? `<label style="font-size:12px;color:#647066;display:block;margin-top:12px">${T.keepPages}<input id="pdf-range" value="1" inputmode="numeric" style="display:block;width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin-top:5px"></label>` : ''}`}
      ${toImage ? '<div class="controls"><label for="pdf-page-number">Page number</label><input id="pdf-page-number" type="number" min="1" value="1" inputmode="numeric" style="width:70px"><label for="pdf-image-format">Format</label><select id="pdf-image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></div>' : ''}
      ${tool === 'pdf-rotate' ? `<div class="controls"><label for="pdf-angle">${T.rotAngle}</label><select id="pdf-angle"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></div>` : ''}
      <div class="controls ${imageFiles ? 'pdf-action-row' : ''}"><button class="btn" id="pdf-run" type="button">${imageToPdf ? T.runImg : svgToPdf ? T.runSvg : toImage ? T.runPageImg : info ? T.runCount : merge ? T.runMerge : extract ? T.runExtract : T.runRotate}</button></div>
      <p class="status" id="pdf-status">${T.safeReady} ${toImage ? 'PDF.js renderer loads from CDN on first use.' : 'pdf-lib loads from CDN when needed.'}</p>`;

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
      list.textContent = accepted.length ? accepted.map((file, index) => `${index + 1}. ${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`).join('\n') : imageFiles ? (svgToPdf ? T.pickSvg : T.pickImg) : T.pickPdf;
      list.style.whiteSpace = 'pre-line';
      const fileKind = imageToPdf ? (isBn ? 'ছবি' : 'image') : svgToPdf ? 'SVG' : 'PDF';
      status.textContent = accepted.length ? (isBn ? `✓ ${accepted.length}টি ${fileKind} ফাইল যোগ হয়েছে। ব্রাউজারেই আছে; আপলোড হয় না।` : `✓ ${accepted.length} ${fileKind} file${accepted.length === 1 ? '' : 's'} selected. Processed locally in your browser.`) : `${fileKind} ${T.noFiles}`;
    }

    root.querySelector('#pdf-browse').onclick = () => picker.click();
    picker.onchange = () => setFiles(picker.files);
    drop.ondragover = (event) => { event.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (event) => { event.preventDefault(); drop.classList.remove('drag'); setFiles(event.dataTransfer.files); };

    root.querySelector('#pdf-run').onclick = async () => {
      const files = picker._pdfFiles || [];
      if (!files.length) { status.textContent = imageToPdf ? T.firstImg : svgToPdf ? T.firstSvg : T.firstPdf; return; }
      if (merge && files.length < 2) { status.textContent = T.minMerge; return; }
      if (imageFiles && files.some((file) => file.size > 40 * 1024 * 1024)) { status.textContent = T.fileLimit; return; }
      status.textContent = T.processing;
      try {
        if (toImage) {
          status.textContent = 'Rendering selected page…';
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
        const { PDFDocument, degrees, rgb } = await loadPdfLib();
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
          if (!Number.isFinite(marginMm) || marginMm < 0 || marginMm > 40) throw new Error(T.marginErr);
          const margin = marginMm * 72 / 25.4;
          const bg = root.querySelector('#pdf-background').value;
          const background = rgb(parseInt(bg.slice(1, 3), 16) / 255, parseInt(bg.slice(3, 5), 16) / 255, parseInt(bg.slice(5, 7), 16) / 255);
          output.setTitle(root.querySelector('#pdf-title').value.trim() || (svgToPdf ? 'SVG artwork' : 'Images to PDF'));
          for (const file of files) {
            const renderScale = svgToPdf ? Number(root.querySelector('#pdf-vector-scale').value) : 1;
            const image = await embedImage(output, file, renderScale, isBn, T);
            const landscape = orientation === 'landscape' || (orientation === 'auto' && image.width > image.height);
            const pageWidth = landscape ? baseSize[1] : baseSize[0];
            const pageHeight = landscape ? baseSize[0] : baseSize[1];
            const page = output.addPage([pageWidth, pageHeight]);
            page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: background });
            const boxWidth = pageWidth - margin * 2;
            const boxHeight = pageHeight - margin * 2;
            if (boxWidth <= 0 || boxHeight <= 0) throw new Error(T.marginLarge);
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
          status.textContent = T.pageCountMsg(source.getPageCount());
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
            const indices = parsePageRange(root.querySelector('#pdf-range').value, output.getPageCount(), T);
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
        status.textContent = T.done;
      } catch (error) {
        status.textContent = toImage ? error.message : imageFiles
          ? T.convertFail(svgToPdf ? 'SVG' : 'Image', error.message)
          : T.openFail(error.message);
      }
    };
  }

  async function embedImage(pdf, file, renderScale = 1, isBn = false, T) {
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
      if (!width || !height || width > 12000 || height > 12000) throw new Error(T ? T.imgLarge : 'Image is too large (max 12,000px).');
      const outputWidth = Math.round(width * renderScale);
      const outputHeight = Math.round(height * renderScale);
      if (outputWidth > 10000 || outputHeight > 10000 || outputWidth * outputHeight > 30000000) throw new Error('Render size is too large for this device. Choose a lower SVG resolution.');
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Browser could not process this image.');
      context.drawImage(bitmap || image, 0, 0, outputWidth, outputHeight);
      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('Could not prepare image for PDF.');
      return pdf.embedPng(new Uint8Array(await pngBlob.arrayBuffer()));
    } finally {
      if (bitmap && typeof bitmap.close === 'function') bitmap.close();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  function parsePageRange(value, pageCount, T) {
    const pages = new Set();
    for (const part of value.split(',').map((item) => item.trim()).filter(Boolean)) {
      const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) throw new Error(T ? T.pageRangeErr : 'Enter pages like this: 1-3,5');
      const start = Number(match[1]);
      const end = Number(match[2] || match[1]);
      if (start < 1 || end < start || end > pageCount) throw new Error(T ? T.pageBoundsErr(pageCount) : `Pages must be between 1 and ${pageCount}.`);
      for (let page = start; page <= end; page++) pages.add(page - 1);
    }
    if (!pages.size) throw new Error(T ? T.pageAtLeastOne : 'Enter at least one page number.');
    return [...pages].sort((a, b) => a - b);
  }

  window.SnapKitPdf = { render };

  if (typeof document !== 'undefined') {
    const init = () => {
      document.querySelectorAll('[data-tool-pdf]').forEach((el) => {
        if (!el._mounted) {
          el._mounted = true;
          render(el.getAttribute('data-tool-pdf'), el);
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