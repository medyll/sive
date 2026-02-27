CMAD Master — Converter tool
----------------------------

This folder contains a small converter that turns CMAD pseudo-HTML mockups into Svelte scaffold files.

Files
- `convert-cmad.js`: Node script. Usage:

```sh
# generate Svelte scaffolds from an input mockup file
node bmad/tools/convert-cmad.js path/to/mockup.cmad path/to/output/dir
```


```markdown
CMAD Master — Converter tool
----------------------------

The canonical ESM converter for this repository is now:

- `src/lib/tools/mockup/convert-mockup.js`

Usage

```sh
# from the repository root
node src/lib/tools/mockup/convert-mockup.js bmad/references/mockup-master-reference.html
```

Behavior

- The script scans the input for CMAD pseudo-tags and generates one `.svelte` scaffold per opening tag.
- Generated files are written into `src/lib/elements` by default and are prefixed with `mockup-`.

Notes

- This converter is a lightweight heuristic tool intended for scaffolding. For complex nested mockups, use a proper parser or sanitize input first.

Example

- Input: `bmad/references/mockup-master-reference.html`.
- Command: `node src/lib/tools/mockup/convert-mockup.js bmad/references/mockup-master-reference.html`.

After generation you can refine components in `src/lib/elements` and implement full Svelte 5-compatible behavior.
```
