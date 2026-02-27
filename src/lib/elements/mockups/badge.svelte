<!--
Template for convert-mockup.js
Placeholders:
  Badge - PascalCase component name (e.g. ChatBubble)
  badge - original mockup tag (e.g. chat-bubble)
  suggestions-ready-badge - id value or null
  {
  "tag": "badge",
  "id": "suggestions-ready-badge",
  "attrs": {
    "id": "suggestions-ready-badge",
    "position": "right-edge-of-editor",
    "visible-when": "focus-mode AND suggestions-available"
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
  "id": "suggestions-ready-badge",
  "attrs": {
    "id": "suggestions-ready-badge",
    "position": "right-edge-of-editor",
    "visible-when": "focus-mode AND suggestions-available"
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