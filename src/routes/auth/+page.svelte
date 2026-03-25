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
        <a href="/app" class="link-app">Continue as guest →</a>
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
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
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

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 0;
    color: var(--color-text-muted, #9ca3af);
    font-size: 0.8rem;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border, #e0e0e0);
  }

  .btn-github {
    width: 100%;
    padding: 0.6rem 1rem;
    background: #24292e;
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: opacity 0.15s;
  }

  .btn-github:hover { opacity: 0.85; }

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
