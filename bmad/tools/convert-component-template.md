<!--
Template: convert-component-template.md

This Markdown file contains the HTML template used by
`./src/bmad/tools/convert-mockup.js` to generate Svelte 5 component
scaffolds. The created component will serve as reference to stick to svelte-5 rules.
The template includes placeholders that are replaced at
generation time:

- `{{COMPONENT_NAME}}` — PascalCase component name (e.g. ChatBubble)
- `{{TAG}}` — original mockup tag (e.g. chat-bubble)
- `{{ID}}` — id value or `null`
- `{{ATTRS_JSON}}` — JSON object of attributes

Use this file as a human-readable reference or to copy the template
into other tooling.
-->

```html
<!--
Template for convert-mockup.js
Placeholders:
  {{COMPONENT_NAME}} - PascalCase component name (e.g. ChatBubble)
  {{TAG}} - original mockup tag (e.g. chat-bubble)
  {{ID}} - id value or null
  {{ATTRS_JSON}} - JSON object of attributes
-->
<script module lang="ts">
  	import { cn } from "$lib/utils.js";
  	import type { ... } from "$lib/types/types.js";
  /**
   * Component: {{COMPONENT_NAME}}
   * Type definitions for external usage
   */
  export type {{COMPONENT_NAME}}Props = {
    children?: import('svelte').Snippet;
  };

  export const mockup = {{ATTRS_JSON}};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...restProps }: {{COMPONENT_NAME}}Props = $props();
</script>

<section class="{{TAG}}" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .{{TAG}} {
    /* Component styles */
  }
</style>

```
