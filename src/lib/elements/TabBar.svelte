<!--
TabBar.svelte
Horizontal tab navigation bar with theme support.
@role ui-nav
@prop {string[]} [tabs] - List of tab labels
@prop {string} [activeTab] - Currently active tab label
@prop {Theme['id']} [theme] - Visual theme id
@prop {(tab: string) => void} [onChange] - Callback when a tab is selected
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  interface Props {
    /** List of tab labels */
    tabs?: string[];
    /** Currently active tab label */
    activeTab?: string;
    /** Visual theme id */
    theme?: Theme['id'];
    /** Callback when a tab is selected */
    onChange?: (tab: string) => void;
  }

  let { tabs = [], activeTab = '', theme = 'light', onChange }: Props = $props();

  let rootEl: HTMLDivElement | null = null;

  function setActiveTab(tab: string) {
    onChange?.(tab);
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        console.debug('[TabBar] dispatching window event', tab);
        window.dispatchEvent(new CustomEvent('tabbar-change', { detail: tab }));
      }
    } catch (err) { console.debug('[TabBar] window dispatch failed', err) }
    try {
      if (rootEl && typeof rootEl.dispatchEvent === 'function') {
        console.debug('[TabBar] dispatching rootEl event', tab);
        rootEl.dispatchEvent(new CustomEvent('tabbar-change', { detail: tab }));
      }
    } catch (err) { console.debug('[TabBar] rootEl dispatch failed', err) }
  }
</script>

<div class="tab-bar" bind:this={rootEl} data-theme={theme} role="tablist">
  {#each tabs as tab (tab)}
    <button
      class={"tab " + (tab === activeTab ? 'active' : '')}
      role="tab"
      aria-selected={tab === activeTab}
      onclick={() => setActiveTab(tab)}
    >
      {tab}
    </button>
  {/each}
</div>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  .tab-bar {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }

  .tab {
    padding: var(--pad-sm) var(--pad-md);
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text);
    transition: var(--transition-fast);
  }

  .tab:hover {
    background: var(--color-surface-hover);
  }

  .tab.active {
    border-bottom: 2px solid var(--color-primary);
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }
</style>