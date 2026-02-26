CMAD Master — Converter tool
----------------------------

This folder contains a small converter that turns CMAD pseudo-HTML mockups into Svelte scaffold files.

Files
- `convert-cmad.js`: Node script. Usage:

```sh
# generate Svelte scaffolds from an input mockup file
node bmad/tools/convert-cmad.js path/to/mockup.cmad path/to/output/dir
```


Behavior
- The script scans the input for pseudo-tags like `<panel id="editor-panel" ...>` and generates one `.svelte` file per opening tag found.
- Each generated `.svelte` file includes English comments describing the component role and identification information (tag, id, attributes) and an exported `mockup` object you can use while implementing.

Notes
- The converter is intentionally simple and uses a lightweight heuristic parser. For complex mockups or nested tag handling, improve the parser or provide sanitized input.
- Output directory defaults to `./src/lib/elements` (project `$lib/elements`) when not provided. This matches the `bmad-master` convention where components live under `src/lib/elements`.

- Generated filenames are prefixed with `mockup-` (for example `mockup-panel-editor-panel.svelte`) to indicate these are scaffolds produced from mockups.

Example
- Input: `bmad/references/cmad-master-reference.html` (or any file with the CMAD pseudo-HTML snippet).
- Command: `node bmad/tools/convert-cmad.js bmad/references/cmad-master-reference.html`.

After generation you can copy the generated files into `src/lib/components` and implement them as real Svelte components.
