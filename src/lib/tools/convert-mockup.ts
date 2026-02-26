/*
 * CMAD -> Svelte scaffold converter (TypeScript)
 *
 * This module provides a simple parser that extracts CMAD pseudo-HTML tags
 * from an input string or file and generates lightweight Svelte component
 * scaffolds for each opening tag found. Each generated `.svelte` file
 * includes English comments describing the component's mockup identity
 * (tag, id, attributes) to guide developers during implementation.
 *
 * NOTE: This is a small, heuristic converter intended for quick scaffolding
 * and review. For production usage or complex nested structures, replace
 * the parser with a proper HTML/XML parser.
 */

import * as fs from 'fs';
import * as path from 'path';

type Attrs = Record<string, string | boolean>;

function parseAttributes(attrText: string | undefined): Attrs {
  const attrs: Attrs = {};
  if (!attrText) return attrs;
  const re = /([a-zA-Z0-9:-]+)(?:="([^"]*)")?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrText))) {
    attrs[m[1]] = m[2] === undefined ? true : m[2];
  }
  return attrs;
}

function findOpeningTags(content: string) {
  const re = /<([a-zA-Z0-9-]+)([^>]*)>/g;
  const tags: Array<{ tag: string; rawAttrs: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    tags.push({ tag: m[1], rawAttrs: m[2] || '', index: m.index });
  }
  return tags;
}

function extractInner(content: string, tag: string, fromIndex: number) {
  const closeRe = new RegExp(`</${tag}>`, 'g');
  closeRe.lastIndex = fromIndex;
  const matchClose = closeRe.exec(content);
  if (!matchClose) return '';
  const start = content.indexOf('>', fromIndex) + 1;
  const end = matchClose.index;
  if (start === 0 || end < start) return '';
  return content.substring(start, end).trim();
}

function makeFilename(tag: string, id: string | null, fallbackIdx: number) {
  const safeId = id ? id.replace(/[^a-zA-Z0-9-_]/g, '-') : `component-${fallbackIdx}`;
  // Prefix with `mockup-` to indicate scaffold generated from mockup
  return `mockup-${tag}-${safeId}.svelte`;
}

function generateSvelte(tag: string, id: string | null, attrs: Attrs, inner: string) {
  const role = (attrs.role as string) || '';
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
  ]
    .filter(Boolean)
    .join('\n');

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

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Convert CMAD content string into Svelte component files.
 * Returns an array of written file paths.
 */
export function convertMockup(content: string, outDir = path.resolve('./src/lib/elements')): string[] {
  const tags = findOpeningTags(content);
  ensureDir(outDir);
  let idx = 1;
  const written: string[] = [];
  for (const t of tags) {
    const attrs = parseAttributes(t.rawAttrs);
    const id = (attrs.id || attrs.name) as string | undefined;
    const inner = extractInner(content, t.tag, t.index);
    const filename = makeFilename(t.tag, id || null, idx);
    const svelte = generateSvelte(t.tag, id || null, attrs, inner);
    const outPath = path.join(outDir, filename);
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, svelte, 'utf8');
      written.push(outPath);
    }
    idx++;
  }
  return written;
}

/**
 * Convenience: read a file and convert it.
 */
export function convertMockupFromFile(inputPath: string, outDir?: string) {
  const input = path.resolve(inputPath);
  if (!fs.existsSync(input)) throw new Error(`Input file not found: ${input}`);
  const content = fs.readFileSync(input, 'utf8');
  return convertMockup(content, outDir);
}

// Lightweight CLI when invoked directly (use `npx ts-node` or compile first).
if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node dist/convert-mockup.js <input-file> [output-dir]');
    process.exit(2);
  }
  try {
    const written = convertMockupFromFile(argv[0], argv[1]);
    console.log('Generated', written.length, 'component(s):');
    for (const w of written) console.log(' -', w);
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err));
    process.exit(3);
  }
}
