<!--
  Toast — fixed notification stack (bottom-right)
  Usage: import toastStore and call toastStore.success/error/info
-->
<script lang="ts">
  import { toastStore } from '$lib/toastStore.svelte';
</script>

<div class="toast-container" aria-live="polite" aria-atomic="false">
  {#each toastStore.items as toast (toast.id)}
    <div class="toast toast--{toast.type}" role="status">
      <span class="toast-msg">{toast.message}</span>
      <button
        class="toast-close"
        type="button"
        aria-label="Dismiss"
        onclick={() => toastStore.dismiss(toast.id)}
      >✕</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.88rem;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    pointer-events: all;
    animation: slide-in 0.2s ease;
    max-width: 22rem;
  }

  .toast--success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
  .toast--info    { background: #eff6ff; color: #1e40af; border: 1px solid #93c5fd; }

  .toast-msg { flex: 1; }

  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0.6;
    padding: 0;
    line-height: 1;
    color: inherit;
  }

  .toast-close:hover { opacity: 1; }

  @keyframes slide-in {
    from { transform: translateX(110%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
</style>
