<!--
  +error.svelte — SvelteKit route error boundary.
  Rendered whenever a load() throws or returns an error response.
-->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <div class="error-card">
    <h1 class="error-title">Something went wrong</h1>
    <p class="error-message">{page.error?.message ?? 'An unexpected error occurred.'}</p>
    <p class="error-status" aria-label="HTTP status code">{page.status}</p>
    <div class="error-actions">
      <button type="button" class="btn-back" onclick={() => history.back()}>
        ← Go back
      </button>
      <a href="/" class="btn-home">Home</a>
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background, #f9fafb);
    padding: 2rem;
  }

  .error-card {
    background: #fff;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    padding: 2.5rem 2rem;
    max-width: 28rem;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  }

  .error-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text, #1a1a1a);
    margin: 0 0 0.75rem;
  }

  .error-message {
    font-size: 0.95rem;
    color: var(--color-text-muted, #6b7280);
    margin: 0 0 0.5rem;
  }

  .error-status {
    font-size: 0.8rem;
    color: #9ca3af;
    margin: 0 0 1.5rem;
  }

  .error-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .btn-back,
  .btn-home {
    padding: 0.5rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-back {
    background: none;
    border: 1px solid var(--color-border, #d1d5db);
    color: var(--color-text, #374151);
  }

  .btn-back:hover { background: #f3f4f6; }

  .btn-home {
    background: var(--color-primary, #6366f1);
    border: none;
    color: #fff;
  }

  .btn-home:hover { opacity: 0.88; }
</style>
