<!--
Template for convert-mockup.js
Placeholders:
  Row - PascalCase component name (e.g. ChatBubble)
  row - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "row",
  "id": null,
  "attrs": {
    "props": "id:string;flex:boolean",
    "component-role": "Horizontal arrangement of child components"
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
  "id": null,
  "attrs": {
    "props": "id:string;flex:boolean",
    "component-role": "Horizontal arrangement of child components"
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