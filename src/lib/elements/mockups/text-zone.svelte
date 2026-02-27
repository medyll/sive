<!--
Template for convert-mockup.js
Placeholders:
  TextZone - PascalCase component name (e.g. ChatBubble)
  text-zone - original mockup tag (e.g. chat-bubble)
  main-editor - id value or null
  {
  "tag": "text-zone",
  "id": "main-editor",
  "attrs": {
    "id": "main-editor",
    "role": "main editor for the current chapter",
    "multiline": true,
    "spellcheck": true,
    "autosave": true,
    "behavior": "Narrative .md text is edited here, Modifications trigger the AI spinner on the right"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: TextZone
   * Type definitions for external usage
   */
  export type TextZoneProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "text-zone",
  "id": "main-editor",
  "attrs": {
    "id": "main-editor",
    "role": "main editor for the current chapter",
    "multiline": true,
    "spellcheck": true,
    "autosave": true,
    "behavior": "Narrative .md text is edited here, Modifications trigger the AI spinner on the right"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: TextZoneProps = $props();
</script>

<section class="text-zone" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .text-zone {
    /* Component styles */
  }
</style>