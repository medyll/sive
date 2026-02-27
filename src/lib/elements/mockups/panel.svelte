<!--
Template for convert-mockup.js
Placeholders:
  Panel - PascalCase component name (e.g. ChatBubble)
  panel - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "panel",
  "id": null,
  "attrs": {
    "props": "id:string;default-width:string;resizable:boolean;collapsible:boolean;width:string;visible-when:string",
    "component-role": "Container for content, optionally resizable/collapsible"
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
  "id": null,
  "attrs": {
    "props": "id:string;default-width:string;resizable:boolean;collapsible:boolean;width:string;visible-when:string",
    "component-role": "Container for content, optionally resizable/collapsible"
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