<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    form?: { error?: string } | null;
    data: { isMock: boolean };
  }

  let { form, data }: Props = $props();
</script>

<main class="auth-page">
  <div class="auth-card">
    <h1 class="auth-title">Create an account</h1>

    {#if data.isMock}
      <div class="auth-notice" role="status">
        ⚠️ Dev mode — auth disabled. <a href="/" class="link-app">Continue as guest →</a>
      </div>
    {/if}

    {#if form?.error}
      <div class="auth-error" role="alert">{form.error}</div>
    {/if}

    <form method="POST" use:enhance class="auth-form">
      <label for="name">Name (optional)</label>
      <input id="name" name="name" type="text" autocomplete="name" />

      <label for="email">Email</label>
      <input id="email" name="email" type="email" required autocomplete="email" />

      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="new-password" minlength="8" />

      <button type="submit" class="btn-primary">Create account</button>
    </form>

    <p class="auth-footer">
      Already have an account? <a href="/auth">Sign in</a>
    </p>
  </div>
</main>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    padding: var(--pad-md);
  }

  .auth-card {
    width: 100%;
    max-width: 24rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--pad-2xl);
    box-shadow: var(--shadow-xl);
  }

  .auth-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    margin: 0 0 var(--pad-lg);
    text-align: center;
    color: var(--color-text);
  }

  .auth-notice {
    font-size: var(--text-sm);
    background: color-mix(in oklch, var(--color-warning) 15%, transparent);
    border: 1px solid var(--color-warning);
    border-radius: var(--radius-md);
    padding: var(--pad-sm) var(--pad-md);
    margin-bottom: var(--pad-md);
  }

  .link-app {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }

  .auth-error {
    font-size: var(--text-sm);
    color: var(--color-critical);
    background: color-mix(in oklch, var(--color-critical) 10%, transparent);
    border: 1px solid var(--color-critical);
    border-radius: var(--radius-md);
    padding: var(--pad-sm) var(--pad-md);
    margin-bottom: var(--pad-md);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
  }

  .auth-form label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .auth-form input {
    padding: var(--pad-sm) var(--pad-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    outline: none;
    transition: var(--transition-fast);
    background: var(--color-surface);
    color: var(--color-text);
  }

  .auth-form input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  .btn-primary {
    margin-top: var(--gap-sm);
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-primary);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .btn-primary:hover {
    opacity: 0.88;
  }

  .auth-footer {
    text-align: center;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: var(--pad-lg) 0 0;
  }

  .auth-footer a {
    color: var(--color-primary);
    font-weight: var(--font-medium);
  }
</style>
