import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SLUG_MAP = {
  convert: 'jpg-to-png',
  resize: 'resize-image',
  clean: 'remove-image-metadata',
  palette: 'color-palette',
  og: 'social-preview',
  soon: '',
  compress: 'image-compressor',
  split: 'split-pdf',
  'pdf-merge': 'merge-pdf',
  'pdf-extract': 'extract-pdf-pages',
  'pdf-rotate': 'rotate-pdf',
  'pdf-image': 'image-to-pdf',
  'pdf-info': 'pdf-page-count',
  'pdf-to-image': 'pdf-to-image',
  'svg-to-png': 'svg-to-png',
  'svg-to-jpg': 'svg-to-jpg',
  'svg-to-pdf': 'svg-to-pdf'
};

async function updateFile(filePath, prefix) {
  let content = await readFile(filePath, 'utf8');
  for (const [toolKey, slug] of Object.entries(SLUG_MAP)) {
    const target = `<article class="tool" data-tool="${toolKey}">`;
    const href = slug ? `${prefix}${slug}/` : `${prefix}`;
    const replacement = `<a class="tool" href="${href}" style="text-decoration:none;color:inherit">`;
    content = content.replace(target, replacement);
  }
  // Replace the closing tag corresponding to article
  // When changing <article class="tool"...>...</article> to <a class="tool"...>...</a>
  // We can safely replace </article> with </a> within the main-tool-grid
  const gridStart = content.indexOf('id="main-tool-grid"');
  if (gridStart !== -1) {
    const gridEnd = content.indexOf('</div></section>', gridStart);
    if (gridEnd !== -1) {
      let gridHtml = content.slice(gridStart, gridEnd);
      gridHtml = gridHtml.replaceAll('</article>', '</a>');
      content = content.slice(0, gridStart) + gridHtml + content.slice(gridEnd);
    }
  }
  await writeFile(filePath, content, 'utf8');
  console.log(`Updated cards in ${path.basename(filePath)} to direct <a> links.`);
}

await updateFile(path.join(root, 'index.html'), 'tools/');
await updateFile(path.join(root, 'index-bn.html'), 'bn/tools/');
