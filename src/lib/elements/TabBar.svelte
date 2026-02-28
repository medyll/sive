<!--
Template for TabBar component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export let tabs: string[] = [];
  export let activeTab: string = '';
  export let theme: Theme['id'] = 'light';

  const setActiveTab = (tab: string) => {
    activeTab = tab;
  };
</script>

<div class="tab-bar" data-theme={theme}>
  {#each tabs as tab (tab)}
    <button
      class="tab {tab === activeTab ? 'active' : ''}"
      on:click={() => setActiveTab(tab)}
    >
      {tab}
    </button>
  {/each}
</div>

<style>
  .tab-bar {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }

  .tab {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
  }

  .tab.active {
    border-bottom: 2px solid var(--color-primary);
    font-weight: bold;
  }
</style>