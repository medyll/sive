#!/usr/bin/env node
// Simple CMAD pseudo-HTML → Svelte scaffold converter
// Generates lightweight Svelte component files for each identified mockup component.
// Usage: node convert-cmad.js <input-file> [output-dir]
// Example: node convert-cmad.js ./mockup.cmad ./bmad/output

const fs = require('fs');
const path = require('path');

function parseAttributes(attrText) {
  const attrs = {};
  if (!attrText) return attrs;
  const re = /([a-zA-Z0-9:-]+)(?:="([^"]*)")?/g;
  let m;
  while ((m = re.exec(attrText))) {
    attrs[m[1]] = m[2] === undefined ? true : m[2];
  }
  return attrs;
}

function findOpeningTags(content) {
  const re = /<([a-zA-Z0-9-]+)([^>]*)>/g;
  const tags = [];
  let m;
  while ((m = re.exec(content))) {
    tags.push({ tag: m[1], rawAttrs: m[2], index: m.index });
  }
  return tags;
}

function extractInner(content, tag, fromIndex) {
  const openRe = new RegExp(`<${tag}[^>]*>`, 'g');
  openRe.lastIndex = fromIndex;
  const closeRe = new RegExp(`</${tag}>`, 'g');
  closeRe.lastIndex = fromIndex;
  let matchClose = closeRe.exec(content);
  if (!matchClose) return '';
  const start = content.indexOf('>', fromIndex) + 1;
  const end = matchClose.index;
  if (start === 0 || end < start) return '';
  return content.substring(start, end).trim();
}

function makeFilename(tag, id, fallbackIdx) {
  const safeId = id ? id.replace(/[^a-zA-Z0-9-_]/g, '-') : `component-${fallbackIdx}`;
  // Prefix with `mockup-` to indicate scaffold generated from mockup
  return `mockup-${tag}-${safeId}.svelte`;
}

function generateSvelte(tag, id, attrs, inner) {
  const role = attrs.role || '';

  const svelte = `<!--\nGenerated Svelte scaffold from CMAD pseudo-HTML\nTag: ${tag}\nID: ${id || ''}\nRole: ${role}\nAttributes: ${JSON.stringify(attrs)}\n\nThis file is a scaffold. Implement component logic and styles during development.\n-->\n\n<script lang=\"ts\">\nexport const mockup = ${JSON.stringify({ tag, id: id || null, attrs }, null, 2)};\n</script>\n\n<style>\n/* Add component styles here */\n</style>\n\n<!-- Basic structural mapping: ${tag} → semantic section with class '${tag}' -->\n<section class=\"${tag}\">\n  {#if $$slots.default}\n    <slot />\n  {:else}\n    ${inner ? inner.replace(/`/g, '\\`') : `<!-- ${tag} placeholder -->`}\n  {/if}\n</section>\n`;

  return svelte;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node convert-cmad.js <input-file> [output-dir]');
    process.exit(2);
  }
  const input = path.resolve(argv[0]);
  const outDir = path.resolve(argv[1] || './src/lib/elements');
  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(2);
  }
  const content = fs.readFileSync(input, 'utf8');
  const tags = findOpeningTags(content);
  ensureDir(outDir);
  let idx = 1;
  const written = [];
  for (const t of tags) {
    const attrs = parseAttributes(t.rawAttrs);
    const id = attrs.id || attrs.name || null;
    const inner = extractInner(content, t.tag, t.index);
    const filename = makeFilename(t.tag, id, idx);
    const svelte = generateSvelte(t.tag, id, attrs, inner);
    const outPath = path.join(outDir, filename);
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, svelte, 'utf8');
      written.push(outPath);
    }
    idx++;
  }

  console.log('Generated', written.length, 'component(s) into', outDir);
  for (const w of written) console.log(' -', w);
}

if (require.main === module) main();
