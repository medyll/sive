<!--
Template for convert-mockup.js
Placeholders:
  Spinner - PascalCase component name (e.g. ChatBubble)
  spinner - original mockup tag (e.g. chat-bubble)
  null - id value or null
  {
  "tag": "spinner",
  "id": null,
  "attrs": {
    "props": "id:string;position:string;visible-when:string",
    "component-role": "Indicates processing state"
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
  "id": null,
  "attrs": {
    "props": "id:string;position:string;visible-when:string",
    "component-role": "Indicates processing state"
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