<!--
Template for convert-mockup.js
Placeholders:
  ResizeHandle - PascalCase component name (e.g. ChatBubble)
  resize-handle - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "resize-handle",
  "id": null,
  "attrs": {
    "props": "id:string;axis:string",
    "component-role": "Allows resizing between panels"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: ResizeHandle
   * Type definitions for external usage
   */
  export type ResizeHandleProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "resize-handle",
  "id": null,
  "attrs": {
    "props": "id:string;axis:string",
    "component-role": "Allows resizing between panels"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: ResizeHandleProps = $props();
</script>

<section class="resize-handle" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .resize-handle {
    /* Component styles */
  }
</style>