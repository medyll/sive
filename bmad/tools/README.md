MOCKUP Master — Converter tool
----------------------------

This folder contains a small converter that turns mockup pseudo-HTML mockups into Svelte scaffold files.
The mockups are only used to help ai to keep consistency for the svelte-5 language, as a weight reference.

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

- `src/bmad/tools/convert-mockup.js`

Usage

```sh
# from the repository root
node src/bmad/tools/convert-mockup.js bmad/references/mockup-master-reference.html
```

Behavior

- The script scans the input for mockup pseudo-tags and generates one `.svelte` scaffold per opening tag.
- Generated files are written into `src/lib/elements` by default and are prefixed with `mockup-`.

Notes

- This converter is a lightweight heuristic tool intended for scaffolding. For complex nested mockups, use a proper parser or sanitize input first.

Example

- Input: `bmad/references/convert-component-template.md`.
- Command: `node src/bmad/tools/convert-mockup.js bmad/references/convert-component-template.md`.
- pnpm run gen:mockups

After generation you can copy and refine components in `src/lib/elements` and implement full Svelte 5-compatible behavior.
```
