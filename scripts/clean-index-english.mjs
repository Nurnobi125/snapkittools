import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');
let html = await readFile(indexPath, 'utf8');

html = html.replace('<h2 id="modal-title">ছবি কনভার্ট</h2><p class="sub" id="modal-sub">ছবি বেছে নিন, বাকিটা SnapKit করবে।</p></div><button class="close" id="close" aria-label="বন্ধ করুন">', '<h2 id="modal-title">Image Converter</h2><p class="sub" id="modal-sub">Choose an image and SnapKit will process it.</p></div><button class="close" id="close" aria-label="Close">');

html = html.replace('<noscript><div class="shell" style="padding:18px;background:#fff4d8;border-radius:12px">ছবি টুলগুলো চালাতে JavaScript চালু করুন।</div></noscript>', '<noscript><div class="shell" style="padding:18px;background:#fff4d8;border-radius:12px">Please enable JavaScript to use SnapKit free online tools.</div></noscript>');

const bnConfigs = `configs={convert:['ছবি কনভার্ট','PNG, JPG, WebP, BMP ও ব্রাউজার-সমর্থিত AVIF-এ বদলান। GIF-এর কেবল প্রথম ফ্রেম থাকবে; HEIC/TIFF সাপোর্ট ব্রাউজারভেদে আলাদা।'],resize:['ছবি রিসাইজ','নতুন প্রস্থ ও উচ্চতা দিন, তারপর ডাউনলোড করুন।'],clean:['মেটাডেটা পরিষ্কার','ছবির নতুন কপি তৈরি হবে; সাধারণত EXIF metadata এতে থাকে না।'],palette:['কালার প্যালেট','ছবি থেকে প্রধান পাঁচটি রঙ বের করুন।'],og:['OG প্রিভিউ','শিরোনাম ও বর্ণনা লিখে শেয়ার কার্ডের নমুনা দেখুন।'],compress:['Image compressor','Reduce image file size in your browser. Optionally set a max size such as 100 KB.'],split:['Split PDF','Separate a PDF into single pages, your own ranges, or equal parts.'],soon:['শিগগিরই আসছে','আরও দরকারি ফ্রি টুল নিয়ে কাজ চলছে।'],'pdf-merge':['PDF একত্র করুন','একাধিক PDF বেছে নিয়ে এক ফাইলে মার্জ করুন।'],'pdf-extract':['PDF পৃষ্ঠা বের করুন','পৃষ্ঠা নম্বর বা রেঞ্জ লিখে নতুন PDF তৈরি করুন।'],'pdf-rotate':['PDF ঘোরান','সব পৃষ্ঠা ৯০°, ১৮০° বা ২৭০° ঘোরান।'],'pdf-image':['Image to PDF','Convert one or more images into a PDF in your browser.'],'pdf-info':['PDF page counter','Check the number of pages in a PDF.'],'pdf-to-image':['PDF to image','Save a selected PDF page as a PNG or JPG image.'],'svg-to-png':['SVG to PNG','Convert an SVG graphic to a PNG image.'],'svg-to-jpg':['SVG to JPG','Convert an SVG graphic to a JPG image.'],'svg-to-pdf':['SVG to PDF','Convert SVG artwork to PDF with page size, orientation, render-resolution, margin, and fit controls.']}`;

const enConfigs = `configs={convert:['Image converter','Convert between PNG, JPG, WebP, BMP, and browser-supported AVIF in seconds.'],resize:['Resize image','Set new dimensions and download the resized image.'],clean:['Remove image metadata','Create a clean copy without common EXIF metadata.'],palette:['Color palette','Extract five prominent colors from the image.'],og:['Social preview','Preview how your link card will look when shared.'],compress:['Image compressor','Reduce image file size in your browser. Optionally set a max size such as 100 KB.'],split:['Split PDF','Separate a PDF into single pages, your own ranges, or equal parts.'],soon:['More tools coming soon','We are building more free online browser utilities.'],'pdf-merge':['Merge PDFs','Combine multiple PDF files into one.'],'pdf-extract':['Extract PDF pages','Save selected pages as a new PDF document.'],'pdf-rotate':['Rotate PDF','Rotate all pages by 90°, 180°, or 270°.'],'pdf-image':['Image to PDF','Convert one or more images into a PDF in your browser.'],'pdf-info':['PDF page counter','Check the number of pages in a PDF.'],'pdf-to-image':['PDF to image','Save a selected PDF page as a PNG or JPG image.'],'svg-to-png':['SVG to PNG','Convert vector SVG graphics to a PNG image.'],'svg-to-jpg':['SVG to JPG','Convert vector SVG graphics to a JPG image.'],'svg-to-pdf':['SVG to PDF','Convert SVG artwork to PDF with page size, orientation, render-resolution, margin, and fit controls.']}`;

html = html.replace(bnConfigs, enConfigs);

html = html.replace('content.innerHTML=\'<p style="color:#758078">আমরা আরও দরকারি ছোট টুল যোগ করছি। এখন ছবি কনভার্ট, রিসাইজ, EXIF পরিষ্কার ও কালার প্যালেট ব্যবহার করতে পারবেন।</p>\'', 'content.innerHTML=\'<p style="color:#758078">We are working on adding more everyday browser utilities. Right now you can convert images, resize, clean metadata, and extract color palettes.</p>\'');

html = html.replace('<div class="uploadicon">＋</div><strong>ছবি এখানে ছাড়ুন</strong><small>অথবা ডিভাইস থেকে একটি ছবি বাছুন</small><br><button class="btn" id="browse">ছবি বাছুন</button>', '<div class="uploadicon">＋</div><strong>Drop an image here</strong><small>or choose an image from your device</small><br><button class="btn" id="browse">Choose image</button>');

html = html.replace('<p class="status" id="status">ফাইল আপনার ব্রাউজারেই থাকবে।</p>', '<p class="status" id="status">Files stay in your browser. Nothing is uploaded.</p>');

html = html.replace("'<label>ফরম্যাট</label><select id=\"format\">", "'<label>Format</label><select id=\"format\">");
html = html.replace("'<label>আউটপুট প্রস্থ (px, ঐচ্ছিক)</label>", "'<label>Output width (px, optional)</label>");
html = html.replace("<label>আউটপুট উচ্চতা (px, ঐচ্ছিক)</label>", "<label>Output height (px, optional)</label>");
html = html.replace("<label>JPG-এর মান</label>", "<label>JPG Quality</label>");
html = html.replace("<label>স্বচ্ছ অংশের পেছনের রং</label>", "<label>Background color for transparency</label>");
html = html.replace('<button class="btn" id="run">কনভার্ট ও ডাউনলোড</button>', '<button class="btn" id="run">Convert &amp; Download</button>');

html = html.replace("'<label>প্রস্থ</label>", "'<label>Width</label>");
html = html.replace("<label>উচ্চতা</label>", "<label>Height</label>");
html = html.replace('<button class="btn" id="run">রিসাইজ ও ডাউনলোড</button>', '<button class="btn" id="run">Resize &amp; Download</button>');
html = html.replace('<button class="btn" id="run">পরিষ্কার কপি ডাউনলোড</button>', '<button class="btn" id="run">Download Clean Copy</button>');
html = html.replace('<button class="btn" id="run">রঙ বের করুন</button>', '<button class="btn" id="run">Extract Colors</button>');

html = html.replace("setStatus('একটি ছবি ফাইল বেছে নিন।')", "setStatus('Please choose an image file.')");
html = html.replace("setStatus('এই ফরম্যাটটি এই ব্রাউজারে খোলা যাচ্ছে না। JPEG বা PNG রূপান্তর করে চেষ্টা করুন।')", "setStatus('This format cannot be opened in this browser. Try converting to JPEG or PNG.')");
html = html.replace("setStatus('আগে একটি ছবি বেছে নিন।')", "setStatus('Choose an image first.')");
html = html.replace("setStatus('রঙগুলো ছবির আনুমানিক প্রধান রং।')", "setStatus('These are approximate prominent colors from the image.')");
html = html.replace("setStatus('মাপ ১ থেকে ৮০০০ পিক্সেলের মধ্যে দিন।')", "setStatus('Enter dimensions between 1 and 8,000 pixels.')");
html = html.replace("setStatus('SVG output-এর মাপ ১ থেকে ১২০০০ পিক্সেলের মধ্যে দিন।')", "setStatus('Enter SVG dimensions between 1 and 12,000 pixels.')");
html = html.replace("setStatus('এই ফরম্যাটে রূপান্তর সম্ভব হয়নি। অন্য ফরম্যাট চেষ্টা করুন।')", "setStatus('This format could not be converted. Try another format.')");
html = html.replace("setStatus(type!==selected?'এই ব্রাউজারে নির্বাচিত ফরম্যাটটি সমর্থিত নয়; PNG ফাইল ডাউনলোড হয়েছে.':current==='clean'?'পরিষ্কার কপি ডাউনলোড হয়েছে।':'কাজ শেষ—ফাইল ডাউনলোড হয়েছে।')", "setStatus(type!==selected?'This browser does not support the selected format; a PNG was downloaded.':current==='clean'?'Clean copy downloaded successfully.':'Done — file downloaded successfully.')");

await writeFile(indexPath, html, 'utf8');
console.log('Successfully cleaned English index.html');
