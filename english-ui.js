(() => {
  const phrases = {
    'সব টুল': 'All tools', '১০০+ দৈনন্দিন টুল': '100+ everyday tools', 'কীভাবে কাজ করে': 'How it works', 'গোপনীয়তা': 'Privacy', '১০০% ফ্রি': '100% free',
    'আপনার প্রতিদিনের ছোট্ট টুলবক্স': 'Your everyday toolbox', 'ছোট কাজ,': 'Small tasks,', 'ঝটপট শেষ।': 'done in a snap.',
    'ছবি কনভার্ট, রিসাইজ কিংবা মেটাডেটা পরিষ্কার—দ্রুত করুন, সরাসরি ব্রাউজারে। কোনো অ্যাকাউন্ট লাগবে না।': 'Convert, resize, or clean image metadata right in your browser. No account required.',
    'আপনার ফাইল,': 'Your files,', 'আপনার কাছেই।': 'stay on your device.', 'ছবি আপনার ডিভাইসেই প্রসেস হয়। সার্ভারে আপলোড করতে হয় না।': 'Images are processed on your device. They are never uploaded to a SnapKit server.',
    'কোন কাজটা করবেন?': 'What would you like to do?', 'দ্রুত শুরু করুন — কোনো সাইন-আপ নেই': 'Get started — no sign-up required',
    'টুল খুঁজুন': 'Search tools', 'টুল খুঁজুন… যেমন PDF, resize, color': 'Search tools… e.g. PDF, resize, color',
    'ছবি কনভার্ট': 'Image converter', 'PNG, JPG, WebP—ফরম্যাট বদলান মুহূর্তে।': 'Convert between PNG, JPG, and WebP in seconds.',
    'ছবি রিসাইজ': 'Resize image', 'সঠিক মাপ দিন, মান বজায় রেখে ডাউনলোড নিন।': 'Set the dimensions and download your resized image.',
    'মেটাডেটা পরিষ্কার': 'Remove image metadata', 'নতুন কপি বানিয়ে ছবির EXIF তথ্য মুছে ফেলুন।': 'Create a new copy without common EXIF metadata.',
    'কালার প্যালেট': 'Color palette', 'ছবি থেকে পাঁচটি প্রধান রঙ খুঁজে বের করুন।': 'Find five prominent colors in an image.',
    'OG প্রিভিউ': 'Social preview', 'সোশ্যাল শেয়ারের কার্ড কেমন দেখাবে, দেখে নিন।': 'Preview how your link may look when shared.',
    'আরও টুল আসছে': 'More tools coming soon', 'SVG এবং আরও দরকারি টুল এক জায়গায়।': 'More useful tools, including SVG tools, are on the way.',
    'PDF একত্র করুন': 'Merge PDFs', 'একাধিক PDF এক ফাইলে জোড়া লাগান।': 'Combine multiple PDF files into one.',
    'PDF পৃষ্ঠা বের করুন': 'Extract PDF pages', 'নির্বাচিত পৃষ্ঠা আলাদা PDF হিসেবে নিন।': 'Save selected pages as a separate PDF.',
    'PDF ঘোরান': 'Rotate PDF', 'সব পৃষ্ঠা ৯০°, ১৮০° বা ২৭০° ঘুরিয়ে নিন।': 'Rotate every page by 90°, 180°, or 270°.',
    'টেক্সট, ডেভেলপার, হিসাব, তারিখ ও ইউনিট কনভার্টার এক জায়গায়।': 'Text, developer, math, date, and unit converters in one place.',
    'জনপ্রিয় ফরম্যাট কনভার্টার': 'Popular format converters', 'ফ্রি · ব্রাউজারেই কাজ করে': 'Free · works in your browser',
    'সহজ, দ্রুত, ব্যক্তিগত—এটাই SnapKit।': 'Simple, fast, private — that is SnapKit.', 'ব্রাউজারেই প্রসেসিং': 'Processed in your browser', 'কোনো অ্যাকাউন্ট নয়': 'No account required', 'কোনো ফাইল আপলোড নয়': 'No file uploads',
    'প্রায়ই জানতে চান': 'Frequently asked questions', 'আমার ছবি কি কোনো সার্ভারে আপলোড হয়?': 'Are my images uploaded to a server?',
    'এই সংস্করণে ছবি আপনার ব্রাউজারের মধ্যেই খোলে ও প্রসেস হয়। ফাইল SnapKit সার্ভারে পাঠানো হয় না।': 'Images open and process in your browser in this version. Files are not sent to SnapKit servers.',
    'কেন কিছু ছবি খোলে না?': 'Why will some images not open?', 'আপনার ব্রাউজারের ছবি ফরম্যাট সমর্থনের ওপর নির্ভর করে। বিশেষ করে HEIC/HEIF সব ব্রাউজারে চলে না। ফাইলটি JPEG বা PNG-তে রূপান্তর করে আবার চেষ্টা করুন।': 'Image support depends on your browser. HEIC/HEIF in particular does not work in every browser. Try converting the file to JPEG or PNG first.',
    'EXIF ক্লিনার কি সব তথ্য মুছে দেয়?': 'Does the EXIF cleaner remove all metadata?', 'এটি ছবিকে নতুন PNG কপি হিসেবে তৈরি করে, এতে সাধারণত EXIF থাকে না। প্রতিটি ফরম্যাটের সব metadata মুছে যাওয়ার নিশ্চয়তা নয়; সংবেদনশীল ছবির ক্ষেত্রে যাচাই করে নিন।': 'It creates a new PNG copy that usually has no EXIF data. It does not guarantee removal of every kind of metadata; check sensitive images before sharing.',
    'ছোট টুল, বড় স্বস্তি।': 'Small tools, less hassle.', 'ছবি টুলগুলো চালাতে JavaScript চালু করুন।': 'Enable JavaScript to use the image tools.',
    'ছবি বেছে নিন, বাকিটা SnapKit করবে।': 'Choose an image and SnapKit will take it from there.', 'ছবি এখানে ছাড়ুন': 'Drop an image here', 'অথবা ডিভাইস থেকে একটি ছবি বাছুন': 'or choose an image from your device',
    'ছবি বাছুন': 'Choose image', 'ফাইল আপনার ব্রাউজারেই থাকবে।': 'Your file stays in your browser.', 'শিরোনাম': 'Title', 'বর্ণনা': 'Description',
    'ছবি কনভার্ট': 'Image converter', 'PNG, JPG, WebP, BMP ও ব্রাউজার-সমর্থিত AVIF-এ বদলান। GIF-এর কেবল প্রথম ফ্রেম থাকবে; HEIC/TIFF সাপোর্ট ব্রাউজারভেদে আলাদা।': 'Convert to PNG, JPG, WebP, BMP, or browser-supported AVIF. GIF conversion keeps only the first frame; HEIC/TIFF support varies by browser.',
    'নতুন প্রস্থ ও উচ্চতা দিন, তারপর ডাউনলোড করুন।': 'Enter a new width and height, then download the image.', 'ছবির নতুন কপি তৈরি হবে; সাধারণত EXIF metadata এতে থাকে না।': 'A new image copy is created; it usually does not contain EXIF metadata.',
    'ছবি থেকে প্রধান পাঁচটি রঙ বের করুন।': 'Extract five prominent colors from an image.', 'শিরোনাম ও বর্ণনা লিখে শেয়ার কার্ডের নমুনা দেখুন।': 'Enter a title and description to preview a social share card.', 'আরও দরকারি ফ্রি টুল নিয়ে কাজ চলছে।': 'We are working on more useful free tools.',
    'একাধিক PDF বেছে নিয়ে এক ফাইলে মার্জ করুন।': 'Choose multiple PDFs and combine them into one file.', 'পৃষ্ঠা নম্বর বা রেঞ্জ লিখে নতুন PDF তৈরি করুন।': 'Enter page numbers or ranges to create a new PDF.', 'সব পৃষ্ঠা ৯০°, ১৮০° বা ২৭০° ঘোরান।': 'Rotate every page by 90°, 180°, or 270°.',
    'বন্ধ করুন': 'Close', 'আগে একটি ছবি বেছে নিন।': 'Choose an image first.', 'একটি ছবি ফাইল বেছে নিন।': 'Choose an image file.', 'এই ফরম্যাটটি এই ব্রাউজারে খোলা যাচ্ছে না। JPEG বা PNG রূপান্তর করে চেষ্টা করুন।': 'This browser cannot open this format. Try converting it to JPEG or PNG.',
    'ফরম্যাট': 'Format', 'প্রস্থ': 'Width', 'উচ্চতা': 'Height', 'রিসাইজ ও ডাউনলোড': 'Resize and download', 'কনভার্ট ও ডাউনলোড': 'Convert and download', 'রঙ বের করুন': 'Extract colors',
    'ছবি থেকে PDF': 'Image to PDF', 'PDF পৃষ্ঠা সংখ্যা': 'PDF page counter', 'ছবির ফাইল এখানে ছাড়ুন': 'Drop image files here', 'এক বা একাধিক ছবি · প্রতি ছবিতে একটি পৃষ্ঠা': 'One or more images · one page per image', 'PDF তৈরি করুন': 'Create PDF', 'পৃষ্ঠা আকার': 'Page size',
    'এই ফরম্যাটে রূপান্তর সম্ভব হয়নি। অন্য ফরম্যাট চেষ্টা করুন।': 'This format could not be converted. Try another format.', 'এই ব্রাউজারে নির্বাচিত ফরম্যাটটি সমর্থিত নয়; PNG ফাইল ডাউনলোড হয়েছে.': 'This browser does not support the selected format; a PNG file was downloaded.',
    'কাজ শেষ—ফাইল ডাউনলোড হয়েছে।': 'Done — your file has been downloaded.', 'কাজ শেষ—PDF ডাউনলোড হয়েছে।': 'Done — your PDF has been downloaded.', 'রঙগুলো ছবির আনুমানিক প্রধান রং।': 'These are approximate prominent colors from the image.',
    'মাপ ১ থেকে ৮০০০ পিক্সেলের মধ্যে দিন।': 'Enter dimensions between 1 and 8,000 pixels.', 'কোনো PDF ফাইল বাছেননি।': 'No PDF selected.',
    'PDF ফাইল এখানে ছাড়ুন': 'Drop PDF files here', 'একটি PDF এখানে ছাড়ুন': 'Drop a PDF here', 'একাধিক PDF · তালিকার ক্রমেই জোড়া হবে': 'Multiple PDFs · merged in the listed order', 'শুধু PDF ফাইল': 'PDF files only',
    'PDF বাছুন': 'Choose PDFs', 'এখনও কোনো ফাইল বাছেননি।': 'No files selected yet.', 'একটি PDF বেছে নিন।': 'Choose a PDF.', 'PDF ফাইলটি পাওয়া যায়নি।': 'No PDF file found.',
    'একটি ছবি বেছে নিন।': 'Choose an image.', 'ছবির ফাইলটি পাওয়া যায়নি।': 'No image file found.', 'প্রতিটি ছবির আকার ৪০ MB-এর কম রাখুন।': 'Keep each image under 40 MB.', 'ছবির মাপ খুব বড়; ১২০০০ পিক্সেলের কম মাপের ছবি ব্যবহার করুন।': 'The image is too large. Use an image under 12,000 pixels in each dimension.', 'এই ব্রাউজারে ছবিটি প্রসেস করা যায়নি।': 'This image could not be processed in this browser.', 'ছবিটি PDF-এর জন্য প্রস্তুত করা যায়নি।': 'The image could not be prepared for the PDF.',
    'ঘোরানোর কোণ': 'Rotation angle', 'নির্বাচিত পৃষ্ঠা ডাউনলোড': 'Download selected pages', 'ঘোরানো PDF ডাউনলোড': 'Download rotated PDF', 'PDF প্রসেস হচ্ছে… ফাইলের আকার অনুযায়ী কিছুটা সময় লাগতে পারে।': 'Processing PDF… this may take a moment depending on the file size.',
    '৯০°': '90°', '১৮০°': '180°', '২৭০°': '270°',
    'ফাইল আপনার ব্রাউজারেই প্রসেস হবে। প্রথম PDF কাজের সময়ে pdf-lib CDN থেকে লোড হবে।': 'Your file is processed in your browser. pdf-lib loads from a CDN the first time you use a PDF tool.',
    'আগে একটি PDF বেছে নিন।': 'Choose a PDF first.', 'একত্র করতে অন্তত দুটি PDF বেছে নিন।': 'Choose at least two PDFs to merge.', 'একটি PDF বেছে নিন।': 'Choose one PDF.',
    'পৃষ্ঠা এভাবে লিখুন: 1-3,5': 'Enter pages like this: 1-3,5', 'অন্তত একটি পৃষ্ঠা নম্বর দিন।': 'Enter at least one page number.',
    'ফাইল আপনার ডিভাইসেই থাকবে।': 'Your files stay on your device.', 'PDF খোলা বা প্রসেস করা যায়নি। ফাইলটি password-protected বা damaged হলে আগে সেটি unlock/repair করুন।': 'Could not open or process the PDF. If it is password-protected or damaged, unlock or repair it first.',
    'ছবি PDF-এ রূপান্তর করা যায়নি। অন্য ছবি চেষ্টা করুন।': 'The image could not be converted to PDF. Try another image.',
    'SnapKit — ছোট কাজ, ঝটপট শেষ': 'SnapKit — Small tasks, done in a snap', 'দ্রুত, ফ্রি ব্রাউজার টুল—কোনো অ্যাকাউন্ট লাগবে না।': 'Fast, free browser tools — no account required.', 'English': 'English', 'বাংলা': 'বাংলা'
  };
  const attributes = ['aria-label', 'placeholder', 'title', 'value', 'alt'];
  const translateText = (value) => {
    const trimmed = value.trim();
    if (phrases[trimmed]) return value.replace(trimmed, phrases[trimmed]);
    const selected = trimmed.match(/^(\d+)টি (PDF|ছবি) বাছা হয়েছে। ফাইল আপনার ডিভাইসেই থাকবে।$/);
    if (selected) {
      const noun = selected[2] === 'ছবি' ? 'image' : 'PDF';
      return value.replace(trimmed, `${selected[1]} ${noun}${selected[1] === '1' ? '' : 's'} selected. Your files stay on your device.`);
    }
    const page = trimmed.match(/^পৃষ্ঠা 1 থেকে (\d+)-এর মধ্যে দিন।$/);
    if (page) return value.replace(trimmed, `Enter a page number from 1 to ${page[1]}.`);
    const pdfError = trimmed.match(/^PDF খোলা বা প্রসেস করা যায়নি। ফাইলটি password-protected বা damaged হলে আগে সেটি unlock\/repair করুন। \((.*)\)$/);
    if (pdfError) return value.replace(trimmed, `Could not open or process the PDF. If it is password-protected or damaged, unlock or repair it first. (${pdfError[1]})`);
    const imageError = trimmed.match(/^ছবি PDF-এ রূপান্তর করা যায়নি। অন্য ছবি চেষ্টা করুন। \((.*)\)$/);
    if (imageError) return value.replace(trimmed, `The image could not be converted to PDF. Try another image. (${imageError[1]})`);
    const count = trimmed.match(/^(\d+)টি টুল পাওয়া গেছে$/);
    if (count) return value.replace(trimmed, `${count[1]} tools found`);
    const pageCount = trimmed.match(/^এই PDF-এ (\d+)টি পৃষ্ঠা আছে।$/);
    if (pageCount) return value.replace(trimmed, `This PDF has ${pageCount[1]} page${pageCount[1] === '1' ? '' : 's'}.`);
    return value;
  };
  const translate = (root) => {
    if (root.nodeType === Node.TEXT_NODE) {
      const translated = translateText(root.nodeValue);
      if (translated !== root.nodeValue) root.nodeValue = translated;
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    }
    if (root.nodeType === Node.ELEMENT_NODE) {
      for (const element of [root, ...root.querySelectorAll('*')]) {
        for (const attribute of attributes) {
          const value = element.getAttribute(attribute);
          if (value && phrases[value]) element.setAttribute(attribute, phrases[value]);
        }
      }
    }
  };
  document.documentElement.lang = 'en';
  const dialog = document.querySelector('#overlay');
  if (dialog) {
    translate(dialog);
    new MutationObserver((records) => records.forEach((record) => {
      if (record.type === 'childList') record.addedNodes.forEach((node) => { if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translate(node); });
      else translate(record.target);
    })).observe(dialog, { subtree: true, childList: true, characterData: true });
  }
})();
