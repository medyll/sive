<!--
Template for convert-mockup.js
Placeholders:
  TabBar - PascalCase component name (e.g. ChatBubble)
  tab-bar - original mockup tag (e.g. chat-bubble)
  ai-tabs - id value or null
  {
  "tag": "tab-bar",
  "id": "ai-tabs",
  "attrs": {
    "id": "ai-tabs"
  }
} - JSON object of attributes
-->
<script module lang="ts">
  /**
   * Component: TabBar
   * Type definitions for external usage
   */
  export type TabBarProps = {
    children?: import('svelte').Snippet;
    [key: string]: any;
  };

  export const mockup = {
  "tag": "tab-bar",
  "id": "ai-tabs",
  "attrs": {
    "id": "ai-tabs"
  }
};
</script>

<script lang="ts">
  // '...rest' captures any other attributes (id, class, etc.)
  let { children, ...rest }: TabBarProps = $props();
</script>

<section class="tab-bar" {...rest}>
    {@render children?.()}
</section>

<style lang="postcss">
  .tab-bar {
    /* Component styles */
  }
</style>