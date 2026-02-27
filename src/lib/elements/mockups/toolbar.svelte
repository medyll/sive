<!--
Template for convert-mockup.js
Placeholders:
  Toolbar - PascalCase component name (e.g. ChatBubble)
  toolbar - original mockup tag (e.g. chat-bubble)
  main-toolbar - id value or null
  {
  "tag": "toolbar",
  "id": "main-toolbar",
  "attrs": {
    "id": "main-toolbar",
    "position": "top"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Toolbar
   * Type definitions for external usage
   */
  export type ToolbarProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "toolbar",
  "id": "main-toolbar",
  "attrs": {
    "id": "main-toolbar",
    "position": "top"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: ToolbarProps = $props();
</script>

<section class="toolbar" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .toolbar {
    /* Component styles */
  }
</style>