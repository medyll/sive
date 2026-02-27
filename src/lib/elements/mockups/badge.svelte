<!--
Template for convert-mockup.js
Placeholders:
  Badge - PascalCase component name (e.g. ChatBubble)
  badge - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "badge",
  "id": null,
  "attrs": {
    "props": "id:string;position:string;visible-when:string",
    "component-role": "Indicator badge for status or notifications"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Badge
   * Type definitions for external usage
   */
  export type BadgeProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "badge",
  "id": null,
  "attrs": {
    "props": "id:string;position:string;visible-when:string",
    "component-role": "Indicator badge for status or notifications"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: BadgeProps = $props();
</script>

<section class="badge" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .badge {
    /* Component styles */
  }
</style>