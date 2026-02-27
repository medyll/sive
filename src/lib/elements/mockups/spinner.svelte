<!--
Template for convert-mockup.js
Placeholders:
  Spinner - PascalCase component name (e.g. ChatBubble)
  spinner - original mockup tag (e.g. chat-bubble)
  ai-spinner - id value or null
  {
  "tag": "spinner",
  "id": "ai-spinner",
  "attrs": {
    "id": "ai-spinner",
    "position": "top-right-of-panel",
    "visible-when": "ai-processing",
    "behavior": "Appears as soon as an AI process is running, Disappears when the result is displayed"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: Spinner
   * Type definitions for external usage
   */
  export type SpinnerProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "spinner",
  "id": "ai-spinner",
  "attrs": {
    "id": "ai-spinner",
    "position": "top-right-of-panel",
    "visible-when": "ai-processing",
    "behavior": "Appears as soon as an AI process is running, Disappears when the result is displayed"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: SpinnerProps = $props();
</script>

<section class="spinner" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .spinner {
    /* Component styles */
  }
</style>