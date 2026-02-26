#!/usr/bin/env node
// CommonJS variant of the CMAD converter for projects using "type": "module"
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
  const closeRe = new RegExp(`</${tag}>`, 'g');
  closeRe.lastIndex = fromIndex;
  const matchClose = closeRe.exec(content);
  if (!matchClose) return '';
  const start = content.indexOf('>', fromIndex) + 1;
  const end = matchClose.index;
  if (start === 0 || end < start) return '';
  return content.substring(start, end).trim();
}

function makeFilename(tag, id, fallbackIdx) {
  const safeId = id ? id.replace(/[^a-zA-Z0-9-_]/g, '-') : `component-${fallbackIdx}`;
  return `mockup-${tag}-${safeId}.svelte`;
}

function generateSvelte(tag, id, attrs, inner) {
  const role = attrs.role || '';
  const headerComment = [
    '<!--',
    'Generated Svelte scaffold from CMAD pseudo-HTML',
    `Tag: ${tag}`,
    `ID: ${id || ''}`,
    role ? `Role: ${role}` : '',
    `Attributes: ${JSON.stringify(attrs)}`,
    '',
    'This file is a scaffold. Implement component logic and styles during development.',
    '-->',
  ].filter(Boolean).join('\n');

  const mockupExport = `export const mockup = ${JSON.stringify({ tag, id: id || null, attrs }, null, 2)};`;

  const svelte = `${headerComment}

<script lang="ts">
${mockupExport}
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: ${tag} → semantic section with class '${tag}' -->
<section class="${tag}">
  {#if $$slots.default}
    <slot />
  {:else}
    ${inner ? inner.replace(/`/g, '\\`') : `<!-- ${tag} placeholder -->`}
  {/if}
</section>
`;

  return svelte;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node convert-cmad.cjs <input-file> [output-dir]');
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
