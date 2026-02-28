<script lang="ts">
  import { onMount } from 'svelte';
  let email = '';
  let password = '';
  let error = '';
  async function submit() {
    error = '';
    try {
      const res = await fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        error = data?.message || 'Login failed';
        return;
      }
      // On success, redirect to dashboard
      window.location.href = '/';
    } catch (e) {
      error = 'Network error';
    }
  }
</script>

<form on:submit|preventDefault={submit} aria-labelledby="login-title">
  <h1 id="login-title">Sign in</h1>

  {#if error}
    <div role="alert" class="error">{error}</div>
  {/if}

  <label for="email">Email</label>
  <input id="email" type="email" bind:value={email} required />

  <label for="password">Password</label>
  <input id="password" type="password" bind:value={password} required />

  <button type="submit">Sign in</button>
</form>
