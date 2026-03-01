<script lang="ts">
  import { enhance } from '$app/forms';

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
  }

  interface Props {
    data: { user: User | null; isMock: boolean };
    form?: { error?: string } | null;
  }

  let { data, form }: Props = $props();

  function initials(user: User): string {
    if (user.name) return user.name.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return '?';
  }
</script>

<main class="profile-page">
  <div class="profile-card">
    <a href="/app" class="back-link">← Back to editor</a>

    <div class="profile-avatar">
      {#if data.user}
        <span>{initials(data.user)}</span>
      {:else}
        <span>?</span>
      {/if}
    </div>

    {#if data.isMock}
      <div class="profile-mock" role="status">Dev mode — guest user</div>
    {/if}

    {#if form?.error}
      <div class="profile-error" role="alert">{form.error}</div>
    {/if}

    {#if data.user}
      <dl class="profile-info">
        {#if data.user.name}
          <dt>Name</dt>
          <dd>{data.user.name}</dd>
        {/if}
        {#if data.user.email}
          <dt>Email</dt>
          <dd>{data.user.email}</dd>
        {/if}
        <dt>ID</dt>
        <dd class="profile-id">{data.user.id}</dd>
      </dl>
    {:else}
      <p class="profile-guest">Browsing as guest — <a href="/auth">sign in</a> for a full account.</p>
    {/if}

    {#if !data.isMock && data.user}
      <form method="POST" action="?/signOut" use:enhance class="signout-form">
        <button type="submit" class="btn-signout">Sign out</button>
      </form>
    {/if}
  </div>
</main>

<style>
  .profile-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface, #f9f9f9);
    padding: 1rem;
  }

  .profile-card {
    width: 100%;
    max-width: 380px;
    background: #fff;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .back-link {
    align-self: flex-start;
    font-size: 0.82rem;
    color: var(--color-primary, #646cff);
    text-decoration: none;
    font-weight: 500;
  }

  .back-link:hover { text-decoration: underline; }

  .profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-primary, #646cff);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .profile-mock {
    font-size: 0.8rem;
    background: #fef9c3;
    border: 1px solid #fde047;
    border-radius: 0.375rem;
    padding: 0.4rem 0.7rem;
  }

  .profile-error {
    font-size: 0.85rem;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 0.375rem;
    padding: 0.4rem 0.7rem;
    width: 100%;
    text-align: center;
  }

  .profile-info {
    width: 100%;
    display: grid;
    grid-template-columns: 6rem 1fr;
    gap: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }

  .profile-info dt {
    color: var(--color-text-muted, #6b7280);
    font-weight: 500;
  }

  .profile-info dd {
    margin: 0;
    color: var(--color-text, #1a1a1a);
    word-break: break-all;
  }

  .profile-id {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    font-family: monospace;
  }

  .profile-guest {
    font-size: 0.88rem;
    color: var(--color-text-muted, #6b7280);
    text-align: center;
    margin: 0;
  }

  .profile-guest a {
    color: var(--color-primary, #646cff);
    font-weight: 500;
  }

  .signout-form { width: 100%; }

  .btn-signout {
    width: 100%;
    padding: 0.6rem 1rem;
    background: #fff;
    color: #dc2626;
    border: 1px solid #fca5a5;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-signout:hover { background: #fef2f2; }
</style>
