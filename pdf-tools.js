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
    const multiple = merge || imageToPdf ? 'multiple' : '';
    root.innerHTML = `<div class="drop" id="pdf-drop"><div class="uploadicon">＋</div><strong>${imageToPdf ? 'ছবির ফাইল এখানে ছাড়ুন' : merge ? 'PDF ফাইল এখানে ছাড়ুন' : 'একটি PDF এখানে ছাড়ুন'}</strong><small>${imageToPdf ? 'এক বা একাধিক ছবি · প্রতি ছবিতে একটি পৃষ্ঠা' : merge ? 'একাধিক PDF · তালিকার ক্রমেই জোড়া হবে' : 'শুধু PDF ফাইল'}</small><br><button class="btn" id="pdf-browse" type="button">${imageToPdf ? 'ছবি বাছুন' : 'PDF বাছুন'}</button><input id="pdf-input" type="file" accept="${imageToPdf ? 'image/*' : 'application/pdf,.pdf'}" ${multiple} class="hidden"></div>
      <div id="pdf-files" class="status">এখনও কোনো ফাইল বাছেননি।</div>
      ${extract ? '<label style="font-size:12px;color:#647066;display:block;margin-top:12px">যে পৃষ্ঠাগুলো রাখতে চান (উদাহরণ: 1-3,5)<input id="pdf-range" value="1" inputmode="numeric" style="display:block;width:100%;padding:10px;border:1px solid #e7ebe5;border-radius:9px;margin-top:5px"></label>' : ''}
      ${imageToPdf ? '<div class="controls"><label for="pdf-page-size">পৃষ্ঠার আকার</label><select id="pdf-page-size"><option value="a4">A4</option><option value="letter">Letter</option></select></div>' : ''}
      ${toImage ? '<div class="controls"><label for="pdf-page-number">Page number</label><input id="pdf-page-number" type="number" min="1" value="1" inputmode="numeric"><label for="pdf-image-format">Image format</label><select id="pdf-image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></div>' : ''}
      ${tool === 'pdf-rotate' ? '<div class="controls"><label for="pdf-angle">ঘোরানোর কোণ</label><select id="pdf-angle"><option value="90">৯০°</option><option value="180">১৮০°</option><option value="270">২৭০°</option></select></div>' : ''}
      <div class="controls"><button class="btn" id="pdf-run" type="button">${imageToPdf ? 'PDF তৈরি করুন' : toImage ? 'Convert page to image' : info ? 'পৃষ্ঠা সংখ্যা দেখুন' : merge ? 'PDF একত্র করুন' : extract ? 'নির্বাচিত পৃষ্ঠা ডাউনলোড' : 'ঘোরানো PDF ডাউনলোড'}</button></div>
      <p class="status" id="pdf-status">ফাইল আপনার ব্রাউজারেই প্রসেস হবে। ${toImage ? 'PDF.js renderer loads from CDN on first use.' : 'pdf-lib loads from CDN when needed.'}</p>`;

    const picker = root.querySelector('#pdf-input');
    const drop = root.querySelector('#pdf-drop');
    const list = root.querySelector('#pdf-files');
    const status = root.querySelector('#pdf-status');
    function setFiles(files) {
      const selected = imageToPdf
        ? [...files].filter((file) => file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(file.name))
        : [...files].filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      const accepted = merge || imageToPdf ? selected : selected.slice(0, 1);
      picker._pdfFiles = accepted;
      list.textContent = accepted.length ? accepted.map((file, index) => `${index + 1}. ${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`).join('\n') : 'একটি PDF বেছে নিন।';
      if (imageToPdf && !accepted.length) list.textContent = 'একটি ছবি বেছে নিন।';
      list.style.whiteSpace = 'pre-line';
      const language = document.documentElement.lang;
      status.textContent = accepted.length ? (language === 'en' ? `✓ ${accepted.length} ${imageToPdf ? 'image' : 'PDF'} file${accepted.length === 1 ? '' : 's'} selected successfully. Safe in your browser; not uploaded.` : `✓ ${accepted.length}টি ${imageToPdf ? 'ছবি' : 'PDF'} ফাইল সফলভাবে যোগ হয়েছে। ব্রাউজারেই আছে; সার্ভারে আপলোড হয়নি।`) : imageToPdf ? 'ছবির ফাইলটি পাওয়া যায়নি।' : 'PDF ফাইলটি পাওয়া যায়নি।';
    }
    root.querySelector('#pdf-browse').onclick = () => picker.click();
    picker.onchange = () => setFiles(picker.files);
    drop.ondragover = (event) => { event.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave = () => drop.classList.remove('drag');
    drop.ondrop = (event) => { event.preventDefault(); drop.classList.remove('drag'); setFiles(event.dataTransfer.files); };
    root.querySelector('#pdf-run').onclick = async () => {
      const files = picker._pdfFiles || [];
      if (!files.length) { status.textContent = imageToPdf ? 'আগে একটি ছবি বেছে নিন।' : 'আগে একটি PDF বেছে নিন।'; return; }
      if (merge && files.length < 2) { status.textContent = 'একত্র করতে অন্তত দুটি PDF বেছে নিন।'; return; }
      if (imageToPdf && files.some((file) => file.size > 40 * 1024 * 1024)) { status.textContent = 'প্রতিটি ছবির আকার ৪০ MB-এর কম রাখুন।'; return; }
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
        if (imageToPdf) {
          const output = await PDFDocument.create();
          const pageSize = root.querySelector('#pdf-page-size').value;
          const baseSize = pageSize === 'letter' ? [612, 792] : [595.28, 841.89];
          for (const file of files) {
            const image = await embedImage(output, file);
            const landscape = image.width / image.height > baseSize[0] / baseSize[1];
            const pageWidth = landscape ? baseSize[1] : baseSize[0];
            const pageHeight = landscape ? baseSize[0] : baseSize[1];
            const margin = 28;
            const scale = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height);
            const width = image.width * scale;
            const height = image.height * scale;
            const page = output.addPage([pageWidth, pageHeight]);
            page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
          }
          bytes = await output.save();
          filename = 'snapkit-images.pdf';
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
        status.textContent = toImage ? error.message : imageToPdf
          ? `ছবি PDF-এ রূপান্তর করা যায়নি। অন্য ছবি চেষ্টা করুন। (${error.message})`
          : error.message.startsWith('পৃষ্ঠা') || error.message.startsWith('অন্তত')
            ? error.message
            : `PDF খোলা বা প্রসেস করা যায়নি। ফাইলটি password-protected বা damaged হলে আগে সেটি unlock/repair করুন। (${error.message})`;
      }
    };
  }

  async function embedImage(pdf, file) {
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
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('এই ব্রাউজারে ছবিটি প্রসেস করা যায়নি।');
      context.drawImage(bitmap || image, 0, 0, width, height);
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
