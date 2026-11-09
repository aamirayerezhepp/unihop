// Saves your Kimi API key into server/.env (git-ignored) without showing it on screen:
//   node scripts/set-kimi-key.mjs   then paste the key and press Enter.
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../server/.env', import.meta.url));
const example = fileURLToPath(new URL('../server/.env.example', import.meta.url));
if (!existsSync(envPath)) copyFileSync(example, envPath);

process.stdout.write('Paste your Kimi API key and press Enter (nothing will be shown): ');
const stdin = process.stdin;
if (stdin.isTTY) stdin.setRawMode(true);
stdin.setEncoding('utf8');
let key = '';
stdin.on('data', chunk => {
  for (const ch of chunk) {
    if (ch === '\r' || ch === '\n') return finish();
    if (ch === '\u0003') { process.stdout.write('\nCancelled.\n'); process.exit(1); }   // Ctrl+C
    if (ch === '\u0008' || ch === '\u007f') { key = key.slice(0, -1); continue; }      // Backspace
    key += ch;
  }
});

function finish(){
  if (stdin.isTTY) stdin.setRawMode(false);
  key = key.trim();
  process.stdout.write('\n');
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) { console.log('That does not look like a Kimi key (it should start with "sk-"). Nothing was saved.'); process.exit(1); }
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  const i = lines.findIndex(l => l.startsWith('KIMI_API_KEY='));
  if (i >= 0) lines[i] = 'KIMI_API_KEY=' + key; else lines.unshift('KIMI_API_KEY=' + key);
  writeFileSync(envPath, lines.join('\n'));
  console.log(`Saved to server/.env (key ending …${key.slice(-4)}). This file is not uploaded to GitHub.`);
  process.exit(0);
}
