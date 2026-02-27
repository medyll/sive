<!--
Template for convert-mockup.js
Placeholders:
  Row - PascalCase component name (e.g. ChatBubble)
  row - original mockup tag (e.g. chat-bubble)
  main-body - id value or null
  {
  "tag": "row",
  "id": "main-body",
  "attrs": {
    "id": "main-body",
    "flex": true
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Row
   * Type definitions for external usage
   */
  export type RowProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "row",
  "id": "main-body",
  "attrs": {
    "id": "main-body",
    "flex": true
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: RowProps = $props();
</script>

<section class="row" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .row {
    /* Component styles */
  }
</style>