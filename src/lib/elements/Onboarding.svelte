<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { toastStore } from '$lib/toastStore.svelte';

  let open = false;
  let step = 0;

  const steps = [
    { title: 'Welcome', body: 'Welcome to Sive — a focused writing app. This quick tour will show the main features.' },
    { title: 'Documents', body: 'Create, rename and delete documents from the sidebar. Your changes are autosaved.' },
    { title: 'AI tools', body: "Open the AI panel on the right to generate suggestions, style, and coherence checks." },
    { title: 'Settings', body: 'Adjust theme, font size and autosave interval in Settings.' }
  ];

  onMount(() => {
    if (!browser) return;
    try {
      const seen = localStorage.getItem('sive:onboarding_seen');
      if (!seen) open = true;
    } catch (e) {
      // ignore localStorage errors
    }
  });

  function next() {
    if (step < steps.length - 1) step += 1;
    else finish();
  }
  function prev() {
    if (step > 0) step -= 1;
  }
  function finish() {
    open = false;
    if (browser) {
      try { localStorage.setItem('sive:onboarding_seen', '1'); } catch (e) {}
    }
    toastStore.success('Onboarding completed');
  }
</script>

{#if open}
  <div class="onboard-overlay" role="dialog" aria-modal="true" aria-label="Onboarding">
    <div class="onboard-card">
      <h2 class="onboard-title">{steps[step].title}</h2>
      <p class="onboard-body">{steps[step].body}</p>

      <div class="onboard-steps">
        {#each steps as s, i}
          <button
            class="onboard-step"
            class:active={i === step}
            aria-current={i === step}
            on:click={() => (step = i)}
          >{i + 1}</button>
        {/each}
      </div>

      <div class="onboard-actions">
        <button class="btn" on:click={prev} disabled={step === 0}>Back</button>
        <button class="btn btn-primary" on:click={next}>{step === steps.length - 1 ? 'Done' : 'Next'}</button>
      </div>

      <button class="onboard-skip" on:click={finish} aria-label="Skip onboarding" data-testid="onboard-skip">Skip</button>
    </div>
  </div>
{/if}

<style>
  .onboard-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.45);
    z-index: 1200;
  }
  .onboard-card {
    background: var(--color-background, #fff);
    color: var(--color-text, #111);
    border-radius: 12px;
    padding: 1.25rem;
    width: min(720px, 92%);
    box-shadow: 0 10px 40px rgba(0,0,0,0.25);
    position: relative;
  }
  .onboard-title { font-size: 1.25rem; margin: 0 0 0.5rem 0; }
  .onboard-body { margin: 0 0 1rem 0; }
  .onboard-steps { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .onboard-step { width: 2rem; height: 2rem; border-radius: 6px; border: 1px solid var(--color-border, #ddd); background: transparent; cursor: pointer; }
  .onboard-step.active { background: var(--color-primary, #646cff); color: #fff; border-color: transparent; }
  .onboard-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .btn { padding: 0.45rem 0.9rem; border-radius: 6px; border: 1px solid var(--color-border, #ddd); background: transparent; cursor: pointer; }
  .btn-primary { background: var(--color-primary, #646cff); color: #fff; border-color: var(--color-primary, #646cff); }
  .onboard-skip { position: absolute; left: 0.75rem; top: 0.5rem; background: none; border: none; color: var(--color-text, #666); cursor: pointer; }
</style>
