<!--
Template for convert-mockup.js
Placeholders:
  Column - PascalCase component name (e.g. ChatBubble)
  column - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "column",
  "id": null,
  "attrs": {
    "props": "id:string;centered:boolean;full-height:boolean",
    "component-role": "Vertical arrangement of child components"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Column
   * Type definitions for external usage
   */
  export type ColumnProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "column",
  "id": null,
  "attrs": {
    "props": "id:string;centered:boolean;full-height:boolean",
    "component-role": "Vertical arrangement of child components"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: ColumnProps = $props();
</script>

<section class="column" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .column {
    /* Component styles */
  }
</style>