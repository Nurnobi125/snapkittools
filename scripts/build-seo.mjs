// One command to rebuild every SEO artifact: node scripts/build-seo.mjs
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
for (const script of ['clean-index-english.mjs', 'convert-cards-to-links.mjs', 'generate-seo-pages.mjs', 'generate-i18n-pages.mjs', 'seo-finalize.mjs', 'generate-ai-index.mjs', 'validate-ai-index.mjs', 'submit-indexnow.mjs']) {
  execFileSync(process.execPath, [path.join(dir, script)], { stdio: 'inherit' });
}
