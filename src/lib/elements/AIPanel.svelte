<!--
Template for AIPanel component
-->
<script lang="ts" module>
  import type { TimelineEvent } from '$lib/types/types';

  const props = () => ({
    events: [] as TimelineEvent[],
    theme: 'light',
  });
</script>

<div class="ai-panel" data-theme={props().theme}>
  {#each props().events as event (event.index)}
    <div class="event">
      <h3>{event.label}</h3>
      <p>{event.storyDate}</p>
    </div>
  {/each}
</div>

<style>
  .ai-panel {
    border: 1px solid var(--color-border);
    padding: 1rem;
    background-color: var(--color-background);
  }

  .event {
    margin-bottom: 1rem;
  }
</style>