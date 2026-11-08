// Fail a build when the public assistant catalog becomes stale or incomplete.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [index, routes, schema, robots, llms, full] = await Promise.all([
  readFile(path.join(root, 'ai-index.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'data/conversions.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'ai-index.schema.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'robots.txt'), 'utf8'),
  readFile(path.join(root, 'llms.txt'), 'utf8'),
  readFile(path.join(root, 'llms-full.txt'), 'utf8')
]);
const errors = [];
const routeMap = new Map(routes.map((route) => [route.slug, route]));
if (index.schema_version !== '1.0.0') errors.push('Unsupported catalog schema_version.');
if (schema.properties?.schema_version?.const !== index.schema_version) errors.push('JSON Schema and generated catalog versions differ.');
if (index.tools.length !== routes.length) errors.push(`Catalog has ${index.tools.length} tools; source has ${routes.length}.`);
if (!robots.includes('User-agent: OAI-SearchBot\nAllow: /')) errors.push('robots.txt does not explicitly allow OAI-SearchBot.');
if (!llms.includes('https://snapkittools.online/ai-index.json')) errors.push('llms.txt does not link to ai-index.json.');
if (!llms.includes('https://snapkittools.online/ai-index.schema.json')) errors.push('llms.txt does not link to the catalog schema.');
if (!full.includes('<!-- BEGIN GENERATED TOOL INDEX -->') || !full.includes('<!-- END GENERATED TOOL INDEX -->')) errors.push('llms-full.txt is missing its generated directory block.');

const seenIds = new Set();
const seenUrls = new Set();
for (const tool of index.tools) {
  const source = routeMap.get(tool.slug);
  if (!source) { errors.push(`Catalog contains unknown route ${tool.slug}.`); continue; }
  if (tool.id !== `snapkit:${tool.slug}` || seenIds.has(tool.id)) errors.push(`Invalid or duplicate tool id ${tool.id}.`);
  seenIds.add(tool.id);
  const english = tool.pages.find((page) => page.language === 'en');
  if (!english) errors.push(`No English page for ${tool.slug}.`);
  for (const page of tool.pages) {
    if (seenUrls.has(page.url)) errors.push(`Duplicate catalog URL ${page.url}.`);
    seenUrls.add(page.url);
    let localPath;
    try {
      const pathname = new URL(page.url).pathname;
      localPath = path.resolve(root, `${pathname.slice(1)}${pathname.endsWith('/') ? 'index.html' : ''}`);
    }
    catch { errors.push(`Invalid page URL ${page.url}.`); continue; }
    if (!localPath.startsWith(root + path.sep)) { errors.push(`Page URL escapes site root: ${page.url}.`); continue; }
    if (await readFile(localPath).then(() => false, () => true)) { errors.push(`Catalog URL has no corresponding published file: ${page.url}.`); continue; }
    const html = await readFile(localPath, 'utf8');
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (canonical !== page.url) errors.push(`Catalog URL and canonical differ for ${page.url}.`);
  }
  for (const relatedId of tool.related_tool_ids) if (!routeMap.has(relatedId.replace(/^snapkit:/, ''))) errors.push(`${tool.slug} links to unknown related tool ${relatedId}.`);
}
if (errors.length) {
  console.error(`AI catalog validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`AI catalog valid: ${index.tools.length} tools, ${seenUrls.size} localized pages, crawler access and references verified.`);
}
