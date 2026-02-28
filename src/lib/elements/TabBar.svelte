<!--
Template for TabBar component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export interface TabBarProps {
    tabs?: string[];
    activeTab?: string;
    theme?: Theme['id'];
    onChange?: (tab: string) => void;
  }

  let { tabs = [], activeTab = '', theme = 'light', onChange }: TabBarProps = $props();

  function setActiveTab(tab: string) {
    if (onChange) onChange(tab);
  }
</script>

<div class="tab-bar" data-theme={theme}>
  {#each tabs as tab (tab)}
    <button
      class={"tab " + (tab === activeTab ? 'active' : '')}
      onclick={() => setActiveTab(tab)}
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