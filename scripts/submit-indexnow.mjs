import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'site-config.json'), 'utf8'));
const siteUrl = String(config.siteUrl || '').trim().replace(/\/$/, '');
const host = new URL(siteUrl).hostname;
const key = '9f3c7e81b2a445d0b678e2190c91834f';
const keyLocation = `${siteUrl}/${key}.txt`;

const routes = JSON.parse(await readFile(path.join(root, 'data/conversions.json'), 'utf8'));
const urlList = [
  `${siteUrl}/`,
  `${siteUrl}/tools/`,
  `${siteUrl}/everyday-tools.html`,
  `${siteUrl}/index-bn.html`,
  ...routes.map((r) => `${siteUrl}/tools/${r.slug}/`)
];

const payload = {
  host,
  key,
  keyLocation,
  urlList
};

console.log(`Submitting ${urlList.length} URLs to IndexNow...`);
try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });
  console.log(`IndexNow response status: ${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) {
    console.log('✓ Successfully notified IndexNow (Bing, Yandex, Seznam, Naver) for immediate crawling!');
  } else {
    const text = await res.text();
    console.log('IndexNow notice:', text);
  }
} catch (err) {
  console.log('Could not connect to IndexNow API (check internet connection):', err.message);
}
