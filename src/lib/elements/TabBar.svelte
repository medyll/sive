<!--
Template for TabBar component
-->
<script lang="ts" module>
  import type { Theme } from '$lib/shared/types/types';

  const props = () => ({
    tabs: [] as string[],
    activeTab: '',
    theme: 'light' as Theme['id'],
  });

  const setActiveTab = (tab: string) => {
    props().activeTab = tab;
  };
</script>

<div class="tab-bar" data-theme={props().theme}>
  {#each props().tabs as tab (tab)}
    <button
      class="tab {tab === props().activeTab ? 'active' : ''}"
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