<!--
Template for convert-mockup.js
Placeholders:
  Panel - PascalCase component name (e.g. ChatBubble)
  panel - original mockup tag (e.g. chat-bubble)
  editor-panel - id value or null
  {
  "tag": "panel",
  "id": "editor-panel",
  "attrs": {
    "id": "editor-panel",
    "default-width": "55%",
    "resizable": true
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Panel
   * Type definitions for external usage
   */
  export type PanelProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "panel",
  "id": "editor-panel",
  "attrs": {
    "id": "editor-panel",
    "default-width": "55%",
    "resizable": true
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: PanelProps = $props();
</script>

<section class="panel" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .panel {
    /* Component styles */
  }
</style>