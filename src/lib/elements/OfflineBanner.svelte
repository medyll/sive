<!--
  OfflineBanner — shown at top of page when network is unavailable.
  Listens to window online/offline events; initial state from navigator.onLine.
-->
<script lang="ts">
  import { browser } from '$app/environment';

  let offline = $state(browser ? !navigator.onLine : false);

  $effect(() => {
    if (!browser) return;

    function handleOffline() { offline = true; }
    function handleOnline()  { offline = false; }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  });
</script>

{#if offline}
  <div class="offline-banner" role="alert" aria-live="assertive" data-testid="offline-banner">
    <span class="offline-icon" aria-hidden="true">⚠</span>
    You are offline — changes will not be saved until your connection is restored.
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
</style>
