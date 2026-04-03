<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    form?: { error?: string } | null;
    data: { isMock: boolean; hasGithub: boolean };
  }

  let { form, data }: Props = $props();
</script>

<main class="auth-page">
  <div class="auth-card">
    <h1 id="login-title" class="auth-title">Sign in</h1>

    {#if data.isMock}
      <div class="auth-notice" role="status">
        ⚠️ Dev mode — no database available. Auth is disabled.
        <a href="/" class="link-app">Continue as guest →</a>
      </div>
    {/if}

    {#if form?.error}
      <div class="auth-error" role="alert">{form.error}</div>
    {/if}

    <form method="POST" action="?/login" use:enhance class="auth-form" aria-labelledby="login-title">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required autocomplete="email" />

      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" />

      <button type="submit" class="btn-primary">Sign in</button>
    </form>

    {#if data.hasGithub}
      <div class="auth-divider"><span>or</span></div>

      <form method="POST" action="?/github" use:enhance>
        <button type="submit" class="btn-github" data-testid="github-signin-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          Continue with GitHub
        </button>
      </form>
    {/if}

    <p class="auth-footer">
      No account? <a href="/auth/signup">Create one</a>
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
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    color: var(--color-text);
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

  .auth-divider {
    display: flex;
    align-items: center;
    gap: var(--gap-md);
    margin: var(--pad-md) 0;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  .btn-github {
    width: 100%;
    padding: var(--pad-sm) var(--pad-md);
    background: #24292e;
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-sm);
    transition: var(--transition-fast);
  }

  .btn-github:hover {
    opacity: 0.85;
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
