<script lang="ts">
  import TabBar from './TabBar.svelte';

  export interface AIPanelProps {
    activeTab?: string;
    theme?: string;
  }

  const TABS = ['Suggestions', 'Coherence', 'Style', 'History'] as const;
  type Tab = (typeof TABS)[number];

  let { activeTab = $bindable<string>('Suggestions'), theme = 'light' }: AIPanelProps = $props();
</script>

<div class="ai-panel" data-theme={theme}>
  <TabBar
    tabs={[...TABS]}
    {activeTab}
    onChange={(tab) => { activeTab = tab; }}
  />

  <div class="tab-content">
    {#if activeTab === 'Suggestions'}
      <div id="tab-content-suggestions" class="tab-pane" role="tabpanel" aria-label="Suggestions">
        <p>Suggestions — AI proposals will appear here.</p>
      </div>
    {:else if activeTab === 'Coherence'}
      <div id="tab-content-coherence" class="tab-pane" role="tabpanel" aria-label="Coherence">
        <p>Coherence — narrative consistency alerts will appear here.</p>
      </div>
    {:else if activeTab === 'Style'}
      <div id="tab-content-style" class="tab-pane" role="tabpanel" aria-label="Style">
        <p>Style — stylistic analysis will appear here.</p>
      </div>
    {:else if activeTab === 'History'}
      <div id="tab-content-history" class="tab-pane" role="tabpanel" aria-label="History">
        <p>History — version timeline will appear here.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-left: 1px solid var(--color-border, #e0e0e0);
    background-color: var(--color-background, #fff);
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .tab-pane {
    color: var(--color-text, #333);
  }
</style>