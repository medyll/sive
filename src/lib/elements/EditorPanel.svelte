<!--
Template for EditorPanel component
-->
<script lang="ts" module>
  import type { TimelineEvent } from '$lib/shared/types/types';

  const props = () => ({
    events: [] as TimelineEvent[],
    editable: false,
    theme: 'light',
  });
</script>

<div class="editor-panel" data-theme={props().theme} contenteditable={props().editable}>
  {#each props().events as event (event.id)}
    <div class="event">
      <h3>{event.label}</h3>
      <p>{event.storyDate}</p>
    </div>
  {/each}
</div>

<style>
  .editor-panel {
    border: 1px solid var(--color-border);
    padding: 1rem;
    background-color: var(--color-background);
  }

  .event {
    margin-bottom: 1rem;
  }
</style>