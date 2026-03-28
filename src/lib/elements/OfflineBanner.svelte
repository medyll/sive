<!--
  OfflineBanner — shown at top of page when network is unavailable.
  S75-05: Enhanced with sync status and pending saves indicator
-->
<script lang="ts">
  import { browser } from '$app/environment';
  import { offlineStore } from '$lib/offlineStore.svelte';

  let initialized = $state(false);

  $effect(() => {
    if (!browser || initialized) return;
    
    offlineStore.init();
    initialized = true;

    return () => {
      offlineStore.destroy();
    };
  });
</script>

{#if offlineStore.isOffline}
  <div class="offline-banner" role="alert" aria-live="assertive" data-testid="offline-banner">
    <span class="offline-icon" aria-hidden="true">⚠️</span>
    <span class="offline-text">
      You are offline
      {#if offlineStore.hasPendingSaves}
        — {offlineStore.pendingCount} save{offlineStore.pendingCount !== 1 ? 's' : ''} pending
      {/if}
    </span>
    {#if offlineStore.isOnline && offlineStore.hasPendingSaves}
      <span class="sync-indicator">🔄 Syncing...</span>
    {/if}
  </div>
{/if}

<style>
  .offline-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    background: #fef3c7;
    color: #92400e;
    border-bottom: 2px solid #f59e0b;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .offline-icon {
    font-size: 1rem;
  }

  .offline-text {
    flex: 1;
  }

  .sync-indicator {
    font-size: 0.75rem;
    color: #059669;
    background: #d1fae5;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }
</style>
