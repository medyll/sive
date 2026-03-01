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
        ⚠️ Dev mode — auth disabled. <a href="/app" class="link-app">Continue as guest →</a>
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
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface, #f9f9f9);
    padding: 1rem;
  }

  .auth-card {
    width: 100%;
    max-width: 380px;
    background: #fff;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    padding: 2rem 2rem 1.5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  .auth-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    text-align: center;
    color: var(--color-text, #1a1a1a);
  }

  .auth-notice {
    font-size: 0.82rem;
    background: #fef9c3;
    border: 1px solid #fde047;
    border-radius: 0.4rem;
    padding: 0.6rem 0.75rem;
    margin-bottom: 1rem;
  }

  .link-app {
    font-weight: 600;
    color: var(--color-primary, #646cff);
  }

  .auth-error {
    font-size: 0.85rem;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 0.4rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .auth-form label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text, #1a1a1a);
  }

  .auth-form input {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.375rem;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .auth-form input:focus {
    border-color: var(--color-primary, #646cff);
  }

  .btn-primary {
    margin-top: 0.5rem;
    padding: 0.6rem 1rem;
    background: var(--color-primary, #646cff);
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary:hover { opacity: 0.88; }

  .auth-footer {
    text-align: center;
    font-size: 0.82rem;
    color: var(--color-text-muted, #6b7280);
    margin: 1.25rem 0 0;
  }

  .auth-footer a {
    color: var(--color-primary, #646cff);
    font-weight: 500;
  }
</style>
