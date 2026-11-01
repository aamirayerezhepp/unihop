// Turns the Vite build into one self-contained page for publishing as a Claude artifact:
// CSS and JS are inlined; mascot images stay as files at orientir-assets/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const jsPath = html.match(/<script[^>]*src="\.\/(assets\/[^"]+\.js)"/)[1];
const cssPath = html.match(/<link[^>]*href="\.\/(assets\/[^"]+\.css)"/)[1];
const js = readFileSync(join(dist, jsPath), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(dist, cssPath), 'utf8').replace(/<\/style/gi, '<\\/style');

const page = `<title>UniHop</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Golos+Text:wght@400;500;600;700&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
mkdirSync(join(root, 'artifact'), { recursive: true });
writeFileSync(join(root, 'artifact', 'orientir.html'), page);
console.log(`artifact/orientir.html — ${Math.round(page.length / 1024)} KB`);
