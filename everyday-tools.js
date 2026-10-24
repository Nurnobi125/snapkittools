(() => {
  const categories = ['Text', 'Developer', 'Math & dates', 'Unit converters', 'Quick fun'];
  const textField = [{ id: 'text', label: 'Text', type: 'textarea', placeholder: 'Paste or type your text here…' }];
  const field = (id, label, type = 'text', placeholder = '', value = '') => ({ id, label, type, placeholder, value });
  const tools = [];
  const add = (id, title, category, description, fields = textField) => tools.push({ id, title, category, description, fields });

  [
    ['word-count','Word Counter','Count words, characters, sentences, and reading time.'],['character-count','Character Counter','Count characters with or without spaces.'],['line-count','Line Counter','Count total, non-empty, and blank lines.'],['sentence-count','Sentence Counter','Count sentences and estimate average sentence length.'],['uppercase','UPPERCASE Converter','Convert text to uppercase.'],['lowercase','lowercase Converter','Convert text to lowercase.'],['title-case','Title Case Converter','Capitalize the first letter of each word.'],['sentence-case','Sentence Case Converter','Capitalize the start of sentences.'],['reverse-text','Reverse Text','Reverse characters in a text string.'],['remove-duplicate-lines','Remove Duplicate Lines','Keep the first copy of each line.'],['sort-lines-a-z','Sort Lines A to Z','Sort lines alphabetically.'],['sort-lines-z-a','Sort Lines Z to A','Sort lines in reverse alphabetical order.'],['reverse-line-order','Reverse Line Order','Flip the order of lines.'],['remove-empty-lines','Remove Empty Lines','Remove blank or whitespace-only lines.'],['trim-lines','Trim Lines','Remove leading and trailing spaces from each line.'],['collapse-spaces','Collapse Extra Spaces','Replace repeated spaces and tabs with one space.'],['slug-generator','URL Slug Generator','Turn a title into a clean URL slug.'],['extract-emails','Email Extractor','Find email addresses in pasted text.'],['extract-urls','URL Extractor','Find web links in pasted text.'],['base64-encode','Base64 Encoder','Encode UTF-8 text as Base64.'],['base64-decode','Base64 Decoder','Decode Base64 text as UTF-8.'],['url-encode','URL Component Encoder','Encode text for safe use in a URL.'],['url-decode','URL Component Decoder','Decode URL-encoded text.'],['html-escape','HTML Escape','Escape special characters for HTML.'],['html-unescape','HTML Unescape','Decode common HTML entities.'],['add-line-numbers','Add Line Numbers','Prefix every line with its line number.'],['remove-diacritics','Remove Diacritics','Convert accented letters to plain Latin where possible.'],['text-diff','Text Compare','Show lines that differ between two texts.'],['word-frequency','Word Frequency Counter','Count words and sort by frequency.'],['character-frequency','Character Frequency Counter','Count each non-space character.'],['text-to-morse','Text to Morse Code','Convert letters and numbers to Morse code.'],['morse-to-text','Morse Code to Text','Decode Morse code.'],['text-to-binary','Text to Binary','Convert UTF-8 bytes to binary.'],['binary-to-text','Binary to Text','Decode binary bytes as UTF-8.'],['find-replace','Find and Replace','Replace every matching phrase in your text.'],['lorem-ipsum','Lorem Ipsum Generator','Generate placeholder paragraphs.']
  ].forEach(([id, title, desc]) => {
    let fields = textField;
    if (id === 'find-replace') fields = [field('text','Text to edit','textarea'),field('find','Find'),field('replace','Replace with')];
    if (id === 'text-diff') fields = [field('left','Original text','textarea'),field('right','Changed text','textarea')];
    if (id === 'lorem-ipsum') fields = [field('count','Paragraphs','number','1 to 20','3')];
    add(id, title, 'Text', desc, fields);
  });

  [
    ['json-format','JSON Formatter','Format JSON with readable indentation.'],['json-minify','JSON Minifier','Remove extra whitespace from valid JSON.'],['json-validate','JSON Validator','Check whether JSON parses and show a useful result.'],['csv-to-json','CSV to JSON','Turn comma-separated rows into JSON objects.'],['json-to-csv','JSON to CSV','Convert an array of JSON objects into CSV.'],['csv-to-tsv','CSV to TSV','Convert comma-separated values to tab-separated values.'],['xml-escape','XML Escape','Escape XML special characters.'],['xml-unescape','XML Unescape','Decode common XML entities.'],['jwt-decode','JWT Decoder','Read a JWT header and payload without verifying the signature.'],['uuid-generator','UUID v4 Generator','Create a random UUID using browser cryptography.'],['password-generator','Password Generator','Generate a random password on this device.'],['random-number','Random Number Generator','Choose a secure random integer in a range.'],['sha256-hash','SHA-256 Hash','Create a SHA-256 digest with the Web Crypto API.'],['regex-tester','Regex Tester','Find matches using a regular expression.'],['url-parser','URL Parser','Break a URL into its parts.'],['query-string-parser','Query String Parser','List the parameters from a URL or query string.'],['hex-to-rgb','HEX to RGB','Convert a hex color code to RGB values.'],['rgb-to-hex','RGB to HEX','Convert RGB color values to a hex code.'],['css-gradient','CSS Gradient Generator','Create CSS for a two-color linear gradient.'],['unix-to-date','Unix Timestamp to Date','Convert Unix seconds or milliseconds to a local date.'],['date-to-unix','Date to Unix Timestamp','Convert a date and time to Unix seconds.'],['decimal-to-binary','Decimal to Binary','Convert an integer to base 2.'],['binary-to-decimal','Binary to Decimal','Convert base 2 to a decimal integer.'],['decimal-to-hex','Decimal to Hex','Convert an integer to base 16.'],['hex-to-decimal','Hex to Decimal','Convert a hexadecimal integer to decimal.'],['binary-to-hex','Binary to Hex','Convert a binary integer to hexadecimal.'],['hex-to-binary','Hex to Binary','Convert a hexadecimal integer to binary.'],['json-stringify','JSON String Escape','Quote a string as a JSON value.']
  ].forEach(([id,title,desc]) => {
    let fields = textField;
    if (['json-to-csv','json-stringify'].includes(id)) fields = [field('text','JSON or text','textarea')];
    if (['csv-to-json','csv-to-tsv','xml-escape','xml-unescape','jwt-decode','json-format','json-minify','json-validate'].includes(id)) fields = textField;
    if (id === 'regex-tester') fields = [field('text','Text to search','textarea'),field('pattern','Regular expression'),field('flags','Flags (optional)','text','g, i, m')];
    if (id === 'url-parser' || id === 'query-string-parser') fields = [field('text','URL or query string','text','https://example.com/?q=hello')];
    if (id === 'hex-to-rgb') fields = [field('hex','HEX color','text','#78a24a')];
    if (id === 'rgb-to-hex') fields = [field('r','Red (0–255)','number','0','120'),field('g','Green (0–255)','number','0','162'),field('b','Blue (0–255)','number','0','74')];
    if (id === 'css-gradient') fields = [field('start','Start color','text','#caff6c'),field('end','End color','text','#eceaff'),field('angle','Angle in degrees','number','90','135')];
    if (id === 'unix-to-date') fields = [field('value','Unix timestamp','number','Seconds or milliseconds')];
    if (id === 'date-to-unix') fields = [field('value','Date and time','datetime-local')];
    if (['decimal-to-binary','binary-to-decimal','decimal-to-hex','hex-to-decimal','binary-to-hex','hex-to-binary'].includes(id)) fields = [field('value','Integer value','text','Enter a whole number')];
    if (id === 'uuid-generator') fields = [];
    if (id === 'password-generator') fields = [field('length','Password length','number','8 to 128','20')];
    if (id === 'random-number') fields = [field('min','Minimum','number','0','1'),field('max','Maximum','number','100','100')];
    if (id === 'sha256-hash') fields = textField;
    if (id === 'json-stringify') fields = [field('text','Text','textarea')];
    add(id,title,'Developer',desc,fields);
  });

  [
    ['percentage','Percentage Calculator','Find X percent of a number.'],['percent-change','Percent Change Calculator','Calculate the percentage change from an old value to a new one.'],['discount','Discount Calculator','Calculate the sale price after a discount.'],['tip','Tip Calculator','Calculate a tip and total bill.'],['split-bill','Bill Splitter','Split a total evenly between people.'],['sum','Add Numbers','Add a list of numbers.'],['average','Average Calculator','Calculate the mean of a list.'],['median','Median Calculator','Find the middle value of a number list.'],['min-max','Minimum and Maximum','Find the smallest and largest values.'],['standard-deviation','Standard Deviation','Calculate population standard deviation.'],['factorial','Factorial Calculator','Calculate n factorial for a non-negative integer.'],['prime-check','Prime Number Checker','Check whether an integer is prime.'],['gcd','GCD Calculator','Find the greatest common divisor of integers.'],['lcm','LCM Calculator','Find the least common multiple of integers.'],['ratio-simplifier','Ratio Simplifier','Reduce a two-number ratio.'],['decimal-to-fraction','Decimal to Fraction','Approximate a decimal as a simple fraction.'],['age-calculator','Age Calculator','Calculate age from a date of birth.'],['date-difference','Date Difference','Count the days between two dates.'],['add-days','Date Add or Subtract','Add or subtract days from a date.'],['business-days','Business Days Counter','Count weekdays between two dates.'],['weekday-finder','Day of Week Finder','Find which weekday a date falls on.'],['simple-calculator','Two-Number Calculator','Add, subtract, multiply, or divide two numbers.'],['compound-interest','Compound Growth Calculator','Estimate growth from a starting amount, rate, and period.'],['percentage-of-total','Percentage of Total','Find what percent one value is of another.'],['hours-to-minutes','Hours to Minutes','Convert hours into minutes.'],['minutes-to-hours','Minutes to Hours','Convert minutes into hours and minutes.']
  ].forEach(([id,title,desc]) => {
    let fields = [field('values','Numbers (comma or space separated)','text','12, 18, 24')];
    if (['percentage','percentage-of-total'].includes(id)) fields = [field('a',id==='percentage'?'Percent':'Part','number'),field('b',id==='percentage'?'Number':'Total','number')];
    if (id==='percent-change') fields=[field('a','Old value','number'),field('b','New value','number')];
    if (id==='discount') fields=[field('a','Original price','number'),field('b','Discount percent','number')];
    if (id==='tip') fields=[field('a','Bill amount','number'),field('b','Tip percent','number','15','15')];
    if (id==='split-bill') fields=[field('a','Total amount','number'),field('b','Number of people','number')];
    if (id==='factorial'||id==='prime-check') fields=[field('n','Integer','number','0 or larger')];
    if (id==='gcd'||id==='lcm'||id==='ratio-simplifier') fields=[field('a','First integer','number'),field('b','Second integer','number')];
    if (id==='decimal-to-fraction') fields=[field('value','Decimal','number','0.75')];
    if (id==='age-calculator'||id==='weekday-finder') fields=[field('date','Date of birth / date','date')];
    if (id==='date-difference'||id==='business-days') fields=[field('a','Start date','date'),field('b','End date','date')];
    if (id==='add-days') fields=[field('date','Date','date'),field('days','Days to add (negative to subtract)','number')];
    if (id==='simple-calculator') fields=[field('a','First number','number'),{id:'op',label:'Operation',type:'select',options:[['+','Add (+)'],['-','Subtract (−)'],['*','Multiply (×)'],['/','Divide (÷)']]},field('b','Second number','number')];
    if (id==='compound-interest') fields=[field('a','Starting amount','number'),field('b','Annual rate (%)','number'),field('c','Years','number')];
    if (id==='hours-to-minutes'||id==='minutes-to-hours') fields=[field('value','Value','number')];
    add(id,title,'Math & dates',desc,fields);
  });

  const conversions = [
    ['celsius-fahrenheit','Celsius to Fahrenheit','C','F','x × 9/5 + 32'],['fahrenheit-celsius','Fahrenheit to Celsius','F','C','(x − 32) × 5/9'],['celsius-kelvin','Celsius to Kelvin','C','K','x + 273.15'],['kelvin-celsius','Kelvin to Celsius','K','C','x − 273.15'],
    ['km-to-miles','Kilometers to Miles','km','mi','x × 0.621371'],['miles-to-km','Miles to Kilometers','mi','km','x × 1.609344'],['kg-to-lb','Kilograms to Pounds','kg','lb','x × 2.204623'],['lb-to-kg','Pounds to Kilograms','lb','kg','x ÷ 2.204623'],
    ['cm-to-inches','Centimeters to Inches','cm','in','x ÷ 2.54'],['inches-to-cm','Inches to Centimeters','in','cm','x × 2.54'],['meters-to-feet','Meters to Feet','m','ft','x × 3.28084'],['feet-to-meters','Feet to Meters','ft','m','x ÷ 3.28084'],
    ['liters-to-gallons','Liters to US Gallons','L','US gal','x × 0.264172'],['gallons-to-liters','US Gallons to Liters','US gal','L','x × 3.785412'],['ml-to-liters','Milliliters to Liters','mL','L','x ÷ 1000'],['liters-to-ml','Liters to Milliliters','L','mL','x × 1000'],
    ['kmh-to-mph','Kilometers per Hour to MPH','km/h','mph','x × 0.621371'],['mph-to-kmh','MPH to Kilometers per Hour','mph','km/h','x × 1.609344'],['sqm-to-sqft','Square Meters to Square Feet','m²','ft²','x × 10.76391'],['sqft-to-sqm','Square Feet to Square Meters','ft²','m²','x ÷ 10.76391'],
    ['bytes-to-kb','Bytes to Kilobytes','B','kB','x ÷ 1000'],['kb-to-bytes','Kilobytes to Bytes','kB','B','x × 1000'],['bytes-to-kib','Bytes to Kibibytes','B','KiB','x ÷ 1024'],['kib-to-bytes','Kibibytes to Bytes','KiB','B','x × 1024'],
    ['mb-to-mib','Megabytes to Mebibytes','MB','MiB','x ÷ 1.048576'],['mib-to-mb','Mebibytes to Megabytes','MiB','MB','x × 1.048576'],['gb-to-gib','Gigabytes to Gibibytes','GB','GiB','x ÷ 1.073742'],['gib-to-gb','Gibibytes to Gigabytes','GiB','GB','x × 1.073742'],
    ['grams-to-ounces','Grams to Ounces','g','oz','x ÷ 28.3495'],['ounces-to-grams','Ounces to Grams','oz','g','x × 28.3495'],['kpa-to-psi','Kilopascals to PSI','kPa','psi','x × 0.145038'],['psi-to-kpa','PSI to Kilopascals','psi','kPa','x × 6.894757']
  ];
  conversions.forEach(([id,title,from,to,formula])=>add(id,title,'Unit converters',`Convert ${from} to ${to}. Formula: ${formula}.`,[field('value',`Value (${from})`,'number')]));

  // Add concrete pairwise conversions with shared standard-unit base factors.
  const generatedConversions = new Map();
  const unitGroups = {
    Length: [['Millimeters','mm',.001],['Centimeters','cm',.01],['Meters','m',1],['Kilometers','km',1000],['Inches','in',.0254],['Feet','ft',.3048],['Yards','yd',.9144],['Miles','mi',1609.344],['Nautical miles','nmi',1852]],
    Area: [['Square millimeters','mm²',1e-6],['Square centimeters','cm²',1e-4],['Square meters','m²',1],['Hectares','ha',10000],['Square kilometers','km²',1e6],['Square inches','in²',.00064516],['Square feet','ft²',.09290304],['Square yards','yd²',.83612736],['Acres','ac',4046.8564224]],
    Volume: [['Milliliters','mL',.001],['Liters','L',1],['Cubic centimeters','cm³',.001],['Cubic meters','m³',1000],['US teaspoons','tsp',.0049289216],['US tablespoons','tbsp',.0147867648],['US fluid ounces','US fl oz',.0295735296],['US cups','US cup',.2365882365],['US pints','US pt',.473176473],['US quarts','US qt',.946352946],['US gallons','US gal',3.785411784],['UK pints','UK pt',.56826125],['UK gallons','UK gal',4.54609]],
    Mass: [['Micrograms','µg',1e-6],['Milligrams','mg',.001],['Grams','g',1],['Kilograms','kg',1000],['Metric tonnes','t',1e6],['Ounces','oz',28.349523125],['Pounds','lb',453.59237],['Stones','st',6350.29318],['US short tons','short ton',907184.74]],
    Data: [['Bits','bit',.125],['Bytes','B',1],['Kilobytes (decimal)','kB',1000],['Megabytes (decimal)','MB',1e6],['Gigabytes (decimal)','GB',1e9],['Terabytes (decimal)','TB',1e12],['Petabytes (decimal)','PB',1e15],['Kibibytes','KiB',1024],['Mebibytes','MiB',1048576],['Gibibytes','GiB',1073741824],['Tebibytes','TiB',1099511627776]],
    Speed: [['Meters per second','m/s',1],['Kilometers per hour','km/h',1/3.6],['Miles per hour','mph',.44704],['Feet per second','ft/s',.3048],['Knots','kn',.5144444444]],
    Pressure: [['Pascals','Pa',1],['Kilopascals','kPa',1000],['Bars','bar',1e5],['Atmospheres','atm',101325],['PSI','psi',6894.757293],['Torr','Torr',133.322368]],
    Energy: [['Joules','J',1],['Kilojoules','kJ',1000],['Calories','cal',4.184],['Kilocalories','kcal',4184],['Watt-hours','Wh',3600],['Kilowatt-hours','kWh',3600000],['BTU','BTU',1055.055852],['Electronvolts','eV',1.602176634e-19]],
    Power: [['Watts','W',1],['Kilowatts','kW',1000],['Horsepower (mechanical)','hp',745.699872],['Metric horsepower','PS',735.49875],['BTU per hour','BTU/h',.29307107]],
    Time: [['Milliseconds','ms',.001],['Seconds','s',1],['Minutes','min',60],['Hours','h',3600],['Days','d',86400],['Weeks','wk',604800]]
  };
  const slugPart=(label)=>label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const titles=new Set(tools.map(x=>x.title.toLowerCase()));
  for(const [group,units] of Object.entries(unitGroups)) for(let a=0;a<units.length;a++) for(let b=0;b<units.length;b++){
    if(a===b) continue; const [from,fromUnit,fromFactor]=units[a],[to,toUnit,toFactor]=units[b],title=from+' to '+to;
    if(titles.has(title.toLowerCase())) continue; const id=slugPart(group)+'-'+slugPart(from)+'-to-'+slugPart(to);
    generatedConversions.set(id,{factor:fromFactor/toFactor,toUnit});
    add(id,title,'Unit converters',`Convert ${from.toLowerCase()} (${fromUnit}) to ${to.toLowerCase()} (${toUnit}) using standard ${group.toLowerCase()} units.`,[field('value',`Value (${fromUnit})`,'number')]); titles.add(title.toLowerCase());
  }

  [
    ['coin-flip','Coin Flip','Flip a virtual coin using browser randomness.'],['dice-roller','Dice Roller','Roll one or more six-sided dice.'],['random-choice','Random Choice Picker','Choose one item from a list of options.'],['random-color','Random Color Generator','Generate a random HEX color.'],['color-contrast','Color Contrast Checker','Calculate contrast ratio between two HEX colors.']
  ].forEach(([id,title,desc])=>{
    const fields=id==='coin-flip'||id==='random-color'?[]:id==='dice-roller'?[field('count','Number of dice','number','1 to 20','2')]:id==='random-choice'?[field('text','Options (one per line)','textarea')]:[field('a','Foreground HEX','text','#17251f'),field('b','Background HEX','text','#caff6c')];
    add(id,title,'Quick fun',desc,fields);
  });

  const search = document.querySelector('#search');
  const grid = document.querySelector('#grid');
  const categoryBar = document.querySelector('#categories');
  const overlay = document.querySelector('#overlay');
  const form = document.querySelector('#tool-form');
  const outputWrap = document.querySelector('#output-wrap');
  const output = document.querySelector('#output');
  const notice = document.querySelector('#notice');
  let activeCategory = 'All';
  let activeTool = null;
  let currentPage=0; const pageSize=36;
  document.querySelector('#result-count').textContent = `${tools.length} tools`;
  document.title = `${tools.length}+ Free Everyday Tools — SnapKit`;
  document.querySelector('h1').innerHTML = `${tools.length}+ small tools.<br><em>Big time saver.</em>`;

  function renderCategories() {
    categoryBar.replaceChildren();
    ['All', ...categories].forEach((name) => {
      const button = document.createElement('button');
      button.className = `category${activeCategory === name ? ' active' : ''}`;
      button.textContent = name === 'All' ? `All (${tools.length})` : `${name} (${tools.filter((item) => item.category === name).length})`;
      button.onclick = () => { activeCategory = name; currentPage=0; renderCategories(); renderTools(); };
      categoryBar.append(button);
    });
  }
  function renderTools() {
    const query = search.value.trim().toLowerCase();
    const matches = tools.filter((item) => (activeCategory === 'All' || item.category === activeCategory) && `${item.title} ${item.description} ${item.id} ${item.category}`.toLowerCase().includes(query));
    grid.replaceChildren();
    document.querySelector('.results-head strong').textContent = `${matches.length} ${matches.length === 1 ? 'tool' : 'tools'}`;
    if (!matches.length) { document.querySelector('#pagination').replaceChildren(); const empty=document.createElement('div');empty.className='empty';empty.textContent='No matching tools. Try another search.';grid.append(empty);return; }
    const pageCount=Math.ceil(matches.length/pageSize); currentPage=Math.min(currentPage,pageCount-1);
    matches.slice(currentPage*pageSize,(currentPage+1)*pageSize).forEach((item) => {
      const card = document.createElement('button');
      card.className='card';card.type='button';
      const cat=document.createElement('div');cat.className='cat';cat.textContent=item.category;
      const title=document.createElement('h3');title.textContent=item.title;
      const desc=document.createElement('p');desc.textContent=item.description;
      card.append(cat,title,desc);card.onclick=()=>open(item);grid.append(card);
    });
    const pager=document.querySelector('#pagination');pager.replaceChildren();if(pageCount>1){const prev=document.createElement('button');prev.className='category';prev.textContent='Previous';prev.disabled=currentPage===0;prev.onclick=()=>{currentPage--;renderTools()};const label=document.createElement('span');label.textContent=`Page ${currentPage+1} of ${pageCount}`;const next=document.createElement('button');next.className='category';next.textContent='Next';next.disabled=currentPage>=pageCount-1;next.onclick=()=>{currentPage++;renderTools()};pager.append(prev,label,next);}
  }
  function open(item) {
    activeTool=item;outputWrap.classList.add('hidden');notice.textContent='';notice.className='notice';
    document.querySelector('#dialog-category').textContent=item.category;
    document.querySelector('#dialog-title').textContent=item.title;
    document.querySelector('#dialog-desc').textContent=item.description;
    form.replaceChildren();
    item.fields.forEach((spec)=>{
      const label=document.createElement('label');label.className='field';
      const caption=document.createElement('span');caption.textContent=spec.label;label.append(caption);
      let control;
      if(spec.type==='textarea'){control=document.createElement('textarea');control.rows=5;}
      else if(spec.type==='select'){control=document.createElement('select');spec.options.forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;control.append(option);});}
      else{control=document.createElement('input');control.type=spec.type||'text';if(spec.type==='number')control.step='any';}
      control.id=`field-${spec.id}`;control.name=spec.id;if(spec.placeholder)control.placeholder=spec.placeholder;if(spec.value)control.value=spec.value;label.append(control);form.append(label);
    });
    if(!item.fields.length){const hint=document.createElement('p');hint.className='notice';hint.textContent='Press the button to generate a result.';form.append(hint);}
    const run=document.createElement('button');run.className='run';run.type='submit';run.textContent='Run tool';form.append(run);
    overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
    const first=form.querySelector('textarea,input,select,button');if(first)first.focus();
  }
  function values() { const result={};activeTool.fields.forEach((spec)=>{result[spec.id]=form.elements[spec.id]?.value??'';});return result; }
  form.onsubmit=async(event)=>{event.preventDefault();notice.textContent='';notice.className='notice';try{const result=await calculate(activeTool.id,values());output.textContent=typeof result==='string'?result:JSON.stringify(result,null,2);outputWrap.classList.remove('hidden');}catch(error){notice.textContent=error.message||'Could not complete this tool.';notice.classList.add('error');}};
  document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(output.textContent);notice.textContent='Copied.';}catch{notice.textContent='Copy is unavailable in this browser. Select the result and copy it.';}};
  document.querySelector('#close').onclick=close;
  overlay.onclick=(event)=>{if(event.target===overlay)close();};
  function close(){overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');}
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')close();if(event.key==='/'&&!overlay.classList.contains('show')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();search.focus();}});
  search.oninput=()=>{currentPage=0;renderTools();};
  renderCategories();renderTools();
  const requestedTool=new URLSearchParams(location.search).get('tool');if(requestedTool){const selected=tools.find((item)=>item.id===requestedTool);if(selected)open(selected);}

  const numberList=(text)=>{const values=text.split(/[\s,;]+/).filter(Boolean).map(Number);if(!values.length||values.some((n)=>!Number.isFinite(n)))throw new Error('Enter one or more valid numbers.');return values;};
  const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
  const validHex=(v)=>{const m=v.trim().match(/^#?([\da-f]{3}|[\da-f]{6})$/i);if(!m)throw new Error('Enter a 3- or 6-digit HEX color.');let h=m[1];if(h.length===3)h=[...h].map((x)=>x+x).join('');return h.toLowerCase();};
  const csvParse=(text)=>{const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted&&c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}row.push(cell);if(row.some((v)=>v!==''))rows.push(row);return rows;};
  const csvQuote=(v)=>{const s=String(v??'');return /[",\r\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};
  const textMorse={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
  const fromMorse=Object.fromEntries(Object.entries(textMorse).map(([a,b])=>[b,a]));

  async function calculate(id,v){
    const text=v.text||'';const num=(key)=>{const n=Number(v[key]);if(!Number.isFinite(n))throw new Error(`Enter a valid number for ${key}.`);return n;};
    if(id==='word-count'){const words=text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[];return `Words: ${words.length}\nUnicode characters (with spaces): ${Array.from(text).length}\nCharacters (without spaces): ${text.replace(/\s/g,'').length}\nLines: ${text?text.split(/\r\n|\r|\n/).length:0}\nEstimated reading time: ${Math.max(1,Math.ceil(words.length/200))} min`;}
    if(id==='character-count')return `Unicode characters: ${Array.from(text).length}\nWithout spaces: ${text.replace(/\s/g,'').length}\nUTF-8 bytes: ${new TextEncoder().encode(text).length}`;
    if(id==='line-count'){const lines=text?text.split(/\r\n|\r|\n/):[];return `Lines: ${lines.length}\nNon-empty lines: ${lines.filter((x)=>x.trim()).length}\nBlank lines: ${lines.filter((x)=>!x.trim()).length}`;}
    if(id==='sentence-count'){const count=(text.match(/[.!?]+(?=\s|$)/g)||[]).length;return `Sentences: ${count}\nAverage words per sentence: ${count?((text.match(/[\p{L}\p{N}]+/gu)||[]).length/count).toFixed(1):'0'}`;}
    if(id==='uppercase')return text.toLocaleUpperCase();if(id==='lowercase')return text.toLocaleLowerCase();
    if(id==='title-case')return text.toLocaleLowerCase().replace(/\b[\p{L}\p{N}]/gu,(x)=>x.toLocaleUpperCase());
    if(id==='sentence-case')return text.toLocaleLowerCase().replace(/(^\s*|[.!?]\s+)[\p{L}]/gu,(x)=>x.toLocaleUpperCase());
    if(id==='reverse-text')return [...text].reverse().join('');if(id==='remove-duplicate-lines')return [...new Set(text.split(/\r\n|\r|\n/))].join('\n');
    if(id==='sort-lines-a-z')return text.split(/\r\n|\r|\n/).sort((a,b)=>a.localeCompare(b)).join('\n');if(id==='sort-lines-z-a')return text.split(/\r\n|\r|\n/).sort((a,b)=>b.localeCompare(a)).join('\n');
    if(id==='reverse-line-order')return text.split(/\r\n|\r|\n/).reverse().join('\n');if(id==='remove-empty-lines')return text.split(/\r\n|\r|\n/).filter((x)=>x.trim()).join('\n');if(id==='trim-lines')return text.split(/\r\n|\r|\n/).map((x)=>x.trim()).join('\n');
    if(id==='collapse-spaces')return text.replace(/[\t ]+/g,' ').replace(/\n{3,}/g,'\n\n');if(id==='slug-generator')return text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
    if(id==='find-replace')return text.split(v.find||'\0').join(v.replace||'');if(id==='extract-emails')return [...new Set(text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)||[])].join('\n');if(id==='extract-urls')return [...new Set(text.match(/https?:\/\/[^\s<>"']+/gi)||[])].join('\n');
    if(id==='base64-encode'){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary)}if(id==='base64-decode'){try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(text.trim()),(c)=>c.charCodeAt(0)));}catch{throw new Error('This is not valid Base64 text.');}}
    if(id==='url-encode')return encodeURIComponent(text);if(id==='url-decode'){try{return decodeURIComponent(text.replaceAll('+',' '));}catch{throw new Error('This URL encoding is incomplete or invalid.');}}
    if(id==='html-escape'||id==='xml-escape')return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
    if(id==='html-unescape'||id==='xml-unescape'){const el=document.createElement('textarea');el.innerHTML=text;return el.value;}
    if(id==='add-line-numbers')return text.split(/\r\n|\r|\n/).map((x,i)=>`${String(i+1).padStart(3,' ')}  ${x}`).join('\n');if(id==='remove-diacritics')return text.normalize('NFD').replace(/\p{Diacritic}/gu,'');
    if(id==='text-diff'){const a=v.left.split(/\r\n|\r|\n/),b=v.right.split(/\r\n|\r|\n/),out=[];for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i]===b[i])out.push(`  ${a[i]??''}`);else{if(a[i]!==undefined)out.push(`− ${a[i]}`);if(b[i]!==undefined)out.push(`+ ${b[i]}`);}}return out.join('\n')||'No differences.';}
    if(id==='word-frequency'){const words=text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)||[],counts={};words.forEach((w)=>counts[w]=(counts[w]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([w,n])=>`${w}: ${n}`).join('\n')||'No words found.';}
    if(id==='character-frequency'){const counts={};[...text.replace(/\s/g,'')].forEach((c)=>counts[c]=(counts[c]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${c}: ${n}`).join('\n')||'No characters found.';}
    if(id==='text-to-morse')return [...text.toUpperCase()].map((c)=>c===' '?' / ':textMorse[c]||'').filter(Boolean).join(' ');if(id==='morse-to-text')return text.trim().split(/\s+\/\s+|\s{2,}/).map((word)=>word.split(/\s+/).map((code)=>fromMorse[code]||'?').join('')).join(' ');
    if(id==='text-to-binary')return [...new TextEncoder().encode(text)].map((b)=>b.toString(2).padStart(8,'0')).join(' ');if(id==='binary-to-text'){const parts=text.trim().split(/[\s,]+/).filter(Boolean);if(parts.some((x)=>!/^[01]{1,8}$/.test(x)))throw new Error('Enter binary bytes such as 01001000 01101001.');return new TextDecoder().decode(new Uint8Array(parts.map((x)=>parseInt(x,2))));}
    if(id==='lorem-ipsum'){const count=Math.max(1,Math.min(20,Math.floor(num('count'))));const sample='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed augue facilisis consequat. Sed varius, lectus in posuere cursus, arcu nibh luctus massa, vitae tempus neque erat at erat.';return Array.from({length:count},()=>sample).join('\n\n');}
    if(id==='json-format'||id==='json-minify'||id==='json-validate'){let data;try{data=JSON.parse(text);}catch(error){throw new Error(`Invalid JSON: ${error.message}`);}if(id==='json-format')return JSON.stringify(data,null,2);if(id==='json-minify')return JSON.stringify(data);return 'Valid JSON ✓';}
    if(id==='csv-to-json'){const rows=csvParse(text);if(rows.length<2)throw new Error('Add a header row and at least one data row.');const headers=rows[0];return JSON.stringify(rows.slice(1).map((row)=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??'']))),null,2);}
    if(id==='json-to-csv'){let data;try{data=JSON.parse(text);}catch(error){throw new Error(`Invalid JSON: ${error.message}`);}if(!Array.isArray(data)||!data.length||typeof data[0]!=='object')throw new Error('Enter a non-empty JSON array of objects.');const headers=[...new Set(data.flatMap((row)=>Object.keys(row)))];return [headers.map(csvQuote).join(','),...data.map((row)=>headers.map((h)=>csvQuote(row[h])).join(','))].join('\n');}
    if(id==='csv-to-tsv')return csvParse(text).map((row)=>row.map((x)=>x.replaceAll('\t',' ')).join('\t')).join('\n');
    if(id==='jwt-decode'){const parts=text.trim().split('.');if(parts.length<2)throw new Error('Enter a JWT with a header and payload separated by dots.');const decode=(p)=>JSON.stringify(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(p.length/4)*4,'=')),(c)=>c.charCodeAt(0)))),null,2);try{return `Header:\n${decode(parts[0])}\n\nPayload:\n${decode(parts[1])}\n\nNote: this only decodes the token; it does not verify its signature.`;}catch{throw new Error('The JWT header or payload is invalid Base64 JSON.');}}
    if(id==='uuid-generator'){if(!crypto.randomUUID)throw new Error('Use a current browser with Web Crypto support.');return crypto.randomUUID();}
    if(id==='password-generator'){const length=Math.max(8,Math.min(128,Math.floor(num('length')))),chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=';const bytes=crypto.getRandomValues(new Uint8Array(length));return [...bytes].map((b)=>chars[b%chars.length]).join('');}
    if(id==='random-number'){const min=Math.ceil(num('min')),max=Math.floor(num('max'));if(max<min||!Number.isSafeInteger(min)||!Number.isSafeInteger(max))throw new Error('Enter safe whole-number bounds with maximum greater than or equal to minimum.');const range=max-min+1;if(range>4294967295)throw new Error('Keep the range within 32-bit integers.');const limit=Math.floor(4294967296/range)*range;let x;do{x=crypto.getRandomValues(new Uint32Array(1))[0];}while(x>=limit);return String(min+x%range);}
    if(id==='sha256-hash'){if(!crypto.subtle)throw new Error('SHA-256 needs a secure HTTPS page. Open the GitHub Pages version.');const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(digest)].map((b)=>b.toString(16).padStart(2,'0')).join('');}
    if(id==='regex-tester'){let regex;try{regex=new RegExp(v.pattern,v.flags||'g');}catch(error){throw new Error(`Regular expression error: ${error.message}`);}const matches=[...v.text.matchAll(new RegExp(regex.source,regex.flags.includes('g')?regex.flags:regex.flags+'g'))];return matches.length?matches.map((m)=>`Match at ${m.index}: ${m[0]}`).join('\n'):'No matches.';}
    if(id==='url-parser'){try{const u=new URL(text);return JSON.stringify({protocol:u.protocol,host:u.host,hostname:u.hostname,port:u.port,path:u.pathname,query:u.search,fragment:u.hash},null,2);}catch{throw new Error('Enter a complete URL, including https://.');}}
    if(id==='query-string-parser'){const raw=text.includes('?')?text.slice(text.indexOf('?')+1).split('#')[0]:text.replace(/^\?/,'');return JSON.stringify(Object.fromEntries(new URLSearchParams(raw)),null,2);}
    if(id==='hex-to-rgb'){const h=validHex(v.hex);return `rgb(${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)})`;}
    if(id==='rgb-to-hex'){const values=['r','g','b'].map((k)=>Math.round(num(k)));if(values.some((n)=>n<0||n>255))throw new Error('Each RGB value must be between 0 and 255.');return '#'+values.map((n)=>n.toString(16).padStart(2,'0')).join('');}
    if(id==='css-gradient'){validHex(v.start);validHex(v.end);const angle=Math.max(0,Math.min(360,num('angle')));return `background: linear-gradient(${angle}deg, ${v.start}, ${v.end});`;}
    if(id==='unix-to-date'){const n=num('value'),date=new Date(Math.abs(n)<1e12?n*1000:n);if(Number.isNaN(date.getTime()))throw new Error('Timestamp is outside the supported date range.');return `Local: ${date.toLocaleString()}\nUTC: ${date.toISOString()}`;}
    if(id==='date-to-unix'){const date=new Date(v.value);if(Number.isNaN(date.getTime()))throw new Error('Choose a valid date and time.');return `Seconds: ${Math.floor(date.getTime()/1000)}\nMilliseconds: ${date.getTime()}`;}
    const integer=()=>{const raw=v.value.trim();const radix=id.includes('binary')?2:id.includes('hex')?16:10;const pattern=radix===2?/^-?[01]+$/:radix===16?/^-?(?:0x)?[\da-f]+$/i:/^-?\d+$/;const n=parseInt(raw,radix);if(!pattern.test(raw)||!Number.isSafeInteger(n))throw new Error('Enter a valid whole number in the requested base.');return n;};
    if(id==='decimal-to-binary')return integer().toString(2);if(id==='binary-to-decimal')return String(integer());if(id==='decimal-to-hex')return integer().toString(16).toUpperCase();if(id==='hex-to-decimal')return String(integer());if(id==='binary-to-hex')return integer().toString(16).toUpperCase();if(id==='hex-to-binary')return integer().toString(2);
    if(id==='json-stringify')return JSON.stringify(text);
    if(id==='percentage')return String(num('a')*num('b')/100);
    if(id==='percentage-of-total'){if(num('b')===0)throw new Error('Total cannot be zero.');return `${(num('a')/num('b')*100).toFixed(2)}%`;}
    if(id==='percent-change'){if(num('a')===0)throw new Error('Old value cannot be zero.');return `${((num('b')-num('a'))/Math.abs(num('a'))*100).toFixed(2)}%`;}if(id==='discount')return `Discount: ${(num('a')*num('b')/100).toFixed(2)}\nSale price: ${(num('a')*(1-num('b')/100)).toFixed(2)}`;
    if(id==='tip'){const tip=num('a')*num('b')/100;return `Tip: ${tip.toFixed(2)}\nTotal: ${(num('a')+tip).toFixed(2)}`;}if(id==='split-bill'){const people=Math.floor(num('b'));if(people<1)throw new Error('Enter at least one person.');return `Each person pays: ${(num('a')/people).toFixed(2)}`;}
    if(['sum','average','median','min-max','standard-deviation'].includes(id)){const list=numberList(v.values).sort((a,b)=>a-b);if(id==='sum')return String(list.reduce((a,b)=>a+b,0));if(id==='average')return String(list.reduce((a,b)=>a+b,0)/list.length);if(id==='median')return String(list.length%2?list[(list.length-1)/2]:(list[list.length/2-1]+list[list.length/2])/2);if(id==='min-max')return `Minimum: ${list[0]}\nMaximum: ${list.at(-1)}`;const mean=list.reduce((a,b)=>a+b,0)/list.length;return String(Math.sqrt(list.reduce((a,b)=>a+(b-mean)**2,0)/list.length));}
    if(id==='factorial'){const raw=num('n');if(!Number.isInteger(raw))throw new Error('Enter a whole number.');let n=raw;if(n<0||n>170)throw new Error('Enter an integer from 0 to 170.');let result=1;for(let i=2;i<=n;i++)result*=i;return String(result);}
    if(id==='prime-check'){const n=num('n');if(!Number.isInteger(n))throw new Error('Enter a whole number.');if(n<2)return 'Not prime';for(let i=2;i<=Math.sqrt(n);i++)if(n%i===0)return 'Not prime';return 'Prime ✓';}
    if(id==='gcd'||id==='lcm'){const a=Math.trunc(num('a')),b=Math.trunc(num('b')),d=gcd(a,b);return id==='gcd'?String(d):String(d?Math.abs(a*b)/d:0);}
    if(id==='ratio-simplifier'){const a=Math.trunc(num('a')),b=Math.trunc(num('b'));if(a===0&&b===0)throw new Error('Both values cannot be zero.');const d=gcd(a,b)||1;return `${a/d}:${b/d}`;}
    if(id==='decimal-to-fraction'){const x=num('value');let bestN=Math.round(x),bestD=1,bestError=Math.abs(x-bestN);for(let d=1;d<=10000;d++){const n=Math.round(x*d),error=Math.abs(x-n/d);if(error<bestError){bestN=n;bestD=d;bestError=error;if(error<1e-10)break;}}const g=gcd(bestN,bestD);return `${bestN/g}/${bestD/g}`;}
    if(id==='age-calculator'){const birth=new Date(`${v.date}T00:00:00`);if(Number.isNaN(birth.getTime()))throw new Error('Choose your birth date.');const now=new Date();let age=now.getFullYear()-birth.getFullYear();const before=now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate());if(before)age--;if(age<0)throw new Error('Birth date cannot be in the future.');return `Age: ${age} years`;} 
    if(id==='date-difference'||id==='business-days'){const a=new Date(`${v.a}T00:00:00Z`),b=new Date(`${v.b}T00:00:00Z`);if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))throw new Error('Choose both dates.');const direction=a<=b?1:-1;let count=0;for(let d=new Date(a);direction===1?d<=b:d>=b;d.setUTCDate(d.getUTCDate()+direction)){if(id==='date-difference')count++;else if(d.getUTCDay()!==0&&d.getUTCDay()!==6)count++;}return `${count} ${id==='business-days'?'weekdays':'days'} (inclusive)`;}
    if(id==='add-days'){const date=new Date(`${v.date}T00:00:00`);if(Number.isNaN(date.getTime()))throw new Error('Choose a valid date.');date.setDate(date.getDate()+Math.trunc(num('days')));return date.toLocaleDateString();}
    if(id==='weekday-finder'){const date=new Date(`${v.date}T00:00:00`);if(Number.isNaN(date.getTime()))throw new Error('Choose a date.');return date.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});}
    if(id==='simple-calculator'){const a=num('a'),b=num('b');if(v.op==='/'&&b===0)throw new Error('Cannot divide by zero.');return String(v.op==='+'?a+b:v.op==='-'?a-b:v.op==='*'?a*b:a/b);}
    if(id==='compound-interest'){const principal=num('a'),rate=num('b')/100,years=num('c');if(principal<0||years<0||rate<-.999)throw new Error('Amount and years must be zero or higher; rate must be above -100%.');return `Estimated future value (annual compounding): ${(principal*(1+rate)**years).toFixed(2)}\nEstimated growth: ${(principal*(1+rate)**years-principal).toFixed(2)}\nThis is a mathematical estimate, not financial advice.`;}
    const x=num('value');if(generatedConversions.has(id)){const c=generatedConversions.get(id);return `${Number((x*c.factor).toPrecision(12))} ${c.toUnit}`;}const conversion={
      'celsius-fahrenheit':x*9/5+32,'fahrenheit-celsius':(x-32)*5/9,'celsius-kelvin':x+273.15,'kelvin-celsius':x-273.15,'km-to-miles':x*0.621371,'miles-to-km':x*1.609344,'kg-to-lb':x*2.204623,'lb-to-kg':x/2.204623,'cm-to-inches':x/2.54,'inches-to-cm':x*2.54,'meters-to-feet':x*3.28084,'feet-to-meters':x/3.28084,'liters-to-gallons':x*0.264172,'gallons-to-liters':x*3.785412,'ml-to-liters':x/1000,'liters-to-ml':x*1000,'kmh-to-mph':x*0.621371,'mph-to-kmh':x*1.609344,'sqm-to-sqft':x*10.76391,'sqft-to-sqm':x/10.76391,'bytes-to-kb':x/1000,'kb-to-bytes':x*1000,'bytes-to-kib':x/1024,'kib-to-bytes':x*1024,'mb-to-mib':x/1.048576,'mib-to-mb':x*1.048576,'gb-to-gib':x/1.073742,'gib-to-gb':x*1.073742,'grams-to-ounces':x/28.3495,'ounces-to-grams':x*28.3495,'kpa-to-psi':x*0.145038,'psi-to-kpa':x*6.894757,'hours-to-minutes':x*60,'minutes-to-hours':`${Math.floor(x/60)} h ${Math.round(x%60)} min`
    };
    if(Object.hasOwn(conversion,id))return typeof conversion[id]==='number'?String(Number(conversion[id].toPrecision(10))):conversion[id];
    if(id==='coin-flip')return crypto.getRandomValues(new Uint8Array(1))[0]%2?'Heads':'Tails';if(id==='dice-roller'){const count=Math.max(1,Math.min(20,Math.floor(num('count'))));const rolls=[...crypto.getRandomValues(new Uint8Array(count))].map((x)=>x%6+1);return `Rolls: ${rolls.join(', ')}\nTotal: ${rolls.reduce((a,b)=>a+b,0)}`;}
    if(id==='random-choice'){const options=text.split(/\r?\n/).map((x)=>x.trim()).filter(Boolean);if(!options.length)throw new Error('Add one option per line.');return options[crypto.getRandomValues(new Uint32Array(1))[0]%options.length];}
    if(id==='random-color'){const [r,g,b]=crypto.getRandomValues(new Uint8Array(3));const hex='#'+[r,g,b].map((n)=>n.toString(16).padStart(2,'0')).join('');return `${hex}\nrgb(${r}, ${g}, ${b})`;}
    if(id==='color-contrast'){const a=validHex(v.a),b=validHex(v.b);const luminance=(h)=>{const cs=[0,2,4].map((i)=>parseInt(h.slice(i,i+2),16)/255).map((c)=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*cs[0]+.7152*cs[1]+.0722*cs[2];};const [l1,l2]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return `Contrast ratio: ${((l1+.05)/(l2+.05)).toFixed(2)}:1\nWCAG AA normal text: ${(l1+.05)/(l2+.05)>=4.5?'Pass':'Fail'}\nWCAG AA large text: ${(l1+.05)/(l2+.05)>=3?'Pass':'Fail'}`;}
    throw new Error('This tool is not available yet.');
  }
})();



