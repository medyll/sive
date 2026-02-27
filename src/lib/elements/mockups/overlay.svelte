<!--
Template for convert-mockup.js
Placeholders:
  Overlay - PascalCase component name (e.g. ChatBubble)
  overlay - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "overlay",
  "id": null,
  "attrs": {
    "props": "id:string;position:string;draggable:boolean;collapsible:boolean",
    "component-role": "Overlay for floating controls or chat"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Overlay
   * Type definitions for external usage
   */
  export type OverlayProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "overlay",
  "id": null,
  "attrs": {
    "props": "id:string;position:string;draggable:boolean;collapsible:boolean",
    "component-role": "Overlay for floating controls or chat"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: OverlayProps = $props();
</script>

<section class="overlay" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .overlay {
    /* Component styles */
  }
</style>