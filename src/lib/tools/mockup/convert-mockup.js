#!/usr/bin/env node

/**
 * ESM MOCKUP -> Svelte scaffold converter (canonical)
 * Usage: node src/lib/tools/mockup/convert-mockup.js <input-file> [output-dir]
 */

import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Parses HTML attributes from a string into an object.
 * @param {string} attrText - The raw attribute string from an HTML tag.
 * @returns {Object.<string, string|boolean>} - Parsed attributes as key-value pairs.
 */
function parseAttributes(attrText) {
  /** @type {Object.<string, string|boolean>} */
  const attrs = {};
  if (!attrText) return attrs;
  const re = /([a-zA-Z0-9:-]+)(?:="([^"]*)")?/g;
  let m;
  while ((m = re.exec(attrText))) {
    attrs[m[1]] = m[2] === undefined ? true : m[2];
  }
  return attrs;
}

/**
 * Extracts the inner content of an HTML tag.
 * @param {string} content - The full HTML content.
 * @param {string} tag - The tag name to extract content from.
 * @param {number} fromIndex - The starting index to search for the tag.
 * @returns {string} - The inner content of the tag.
 */
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

/**
 * Generates a filename for a Svelte component based on the tag name.
 * @param {string} tag - The tag name.
 * @returns {string} - The generated filename.
 */
function makeFilename(tag) {
  return `${tag}.svelte`;
}

/**
 * Generates a Svelte component file content based on a template.
 * @param {string} tag - The tag name.
 * @param {string|null} id - The ID of the tag, if any.
 * @param {Object.<string, string|boolean>} attrs - The attributes of the tag.
 * @param {string} inner - The inner content of the tag.
 * @returns {Promise<string>} - The generated Svelte component content.
 */
async function generateSvelte(tag, id, attrs, inner) {
  const mdTemplatePath = path.resolve('./src/lib/tools/mockup/convert-mockup-template.md');
  const htmlTemplatePath = path.resolve('./src/lib/tools/mockup/convert-mockup-template.html');
  let tplRaw;
  try {
    tplRaw = await fs.readFile(mdTemplatePath, 'utf8');
    const fenceHtml = /```html\s*([\s\S]*?)```/i.exec(tplRaw);
    if (fenceHtml && fenceHtml[1]) {
      tplRaw = fenceHtml[1].trim();
    } else {
      const fenceAny = /```(?:html)?\s*([\s\S]*?)```/.exec(tplRaw);
      if (fenceAny && fenceAny[1]) tplRaw = fenceAny[1].trim();
    }
  } catch {
    try {
      tplRaw = await fs.readFile(htmlTemplatePath, 'utf8');
    } catch {
      tplRaw = null;
    }
  }

  if (!tplRaw) {
    throw new Error(`No template found for convert-mockup. Checked paths:\n - ${mdTemplatePath}\n - ${htmlTemplatePath}`);
  }

  /**
   * Converts a string to PascalCase.
   * @param {string} str - The input string.
   * @returns {string} - The PascalCase string.
   */
  const pascalCase = (str) => str.split(/[-_\s]+/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const compName = pascalCase(tag);
  const attrsJson = JSON.stringify({ tag, id: id || null, attrs }, null, 2);

  let out = tplRaw.replace(/{{COMPONENT_NAME}}/g, compName);
  out = out.replace(/{{TAG}}/g, tag);
  out = out.replace(/{{ID}}/g, id ? id : 'null');
  out = out.replace(/{{ATTRS_JSON}}/g, attrsJson);
  out = out.replace(/{{INNER}}/g, inner ? inner : '');

  return out;
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dir - The directory path.
 */
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * Converts mockup HTML content into Svelte components.
 * @param {string} content - The mockup HTML content.
 * @param {string} [outDir=path.resolve('./src/lib/elements')] - The output directory for the generated components.
 * @returns {Promise<string[]>} - A list of generated file paths.
 */
async function convertMockup(content, outDir = path.resolve('./src/lib/elements')) {
  const allowed = new Set([
    'row', 'column', 'panel', 'toolbar', 'text-zone', 'chat-bubble', 'tab-bar', 'tab', 'overlay', 'spinner', 'timeline', 'diff-view', 'badge', 'resize-handle'
  ]);
  const commentTagRe = /<!--\s*\[([\w-]+)\][^>]*-->\s*<(\w[\w-]*)/g;
  const found = new Set();
  ensureDir(outDir);
  const written = [];
  let m;
  while ((m = commentTagRe.exec(content))) {
    const tag = m[2];
    if (!allowed.has(tag) || found.has(tag)) continue;
    found.add(tag);
    const tagRe = new RegExp(`<${tag}([^>]*)>`, 'i');
    const tagMatch = tagRe.exec(content);
    const rawAttrs = tagMatch ? tagMatch[1] : '';
    const attrs = parseAttributes(rawAttrs);
    const id = typeof attrs.id === 'string' ? attrs.id : (typeof attrs.name === 'string' ? attrs.name : null);
    const inner = tagMatch ? extractInner(content, tag, tagMatch.index) : '';
    const filename = makeFilename(tag);
    const svelte = await generateSvelte(tag, id, attrs, inner);
    const outPath = path.join(outDir, filename);
    await fs.writeFile(outPath, svelte, 'utf8');
    written.push(outPath);
  }
  return written;
}

/**
 * Converts a mockup file into Svelte components.
 * @param {string} inputPath - The path to the input mockup file.
 * @param {string} outDir - The output directory for the generated components.
 * @returns {Promise<string[]>} - A list of generated file paths.
 */
async function convertMockupFromFile(inputPath, outDir) {
  const input = path.resolve(inputPath);
  const content = await fs.readFile(input, 'utf8');
  return await convertMockup(content, outDir);
}

// CLI
if (process.argv && process.argv[1] && process.argv[1].endsWith('convert-mockup.js')) {
  (async () => {
    const argv = process.argv.slice(2);
    if (argv.length < 1) {
      console.error('Usage: node src/lib/tools/mockup/convert-mockup.js <input-file> [output-dir]');
      process.exit(2);
    }
    try {
      const written = await convertMockupFromFile(argv[0], argv[1]);
      console.log('Generated', written.length, 'component(s):');
      for (const w of written) console.log(' -', w);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error:', err.message);
      } else {
        console.error('Error:', String(err));
      }
      process.exit(3);
    }
  })();
}
