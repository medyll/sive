<!--
Template for EditorPanel component
-->
<script lang="ts">
  import type { TimelineEvent } from '$lib/types/types';

  export interface EditorPanelPros {
    events?: TimelineEvent[];
    editable?: boolean;
    theme?: string;
  }

  let { events = [], editable = false, theme = 'light' }:EditorPanelPros = $props();
</script>

<div class="editor-panel" data-theme={theme} contenteditable={editable}>
  {#each events as event (event.index)}
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