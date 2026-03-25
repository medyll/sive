<script lang="ts">
  import { onMount } from 'svelte';
  import { toastStore } from '$lib/toastStore.svelte';
  import PluginManager from '$lib/elements/PluginManager.svelte';
  import { pluginStore } from '$lib/pluginStore.svelte';
  import { goalsStore } from '$lib/writingGoalsStore.svelte';
  import { themeStore } from '$lib/themeStore.svelte';
  onMount(() => pluginStore.init());

  let dailyTarget = $state(goalsStore.goals.dailyTarget);

  let theme: string = $state(themeStore.theme);
  let fontSize = $state('medium');
  let autosave = $state(30);
  let autoSummary = $state(false);

  onMount(() => {
    try {
      const saved = localStorage.getItem('settings');
      if (saved) {
        const p = JSON.parse(saved);
        theme = p.theme ?? theme;
        fontSize = p.fontSize ?? fontSize;
        autosave = p.autosave ?? autosave;
        autoSummary = p.autoSummary ?? autoSummary;
      }
    } catch (e) {
      // ignore
    }
  });

  function pickTheme(t: string) {
    theme = t;
    themeStore.setTheme(t as 'light' | 'dark');
  }

  function save() {
    const prefs = { theme, fontSize, autosave, autoSummary };
    try {
      localStorage.setItem('settings', JSON.stringify(prefs));
      goalsStore.setDailyTarget(dailyTarget);
      themeStore.setTheme(theme as 'light' | 'dark');
      toastStore.success('Preferences saved');
    } catch (e) {
      toastStore.error('Failed to save preferences');
    }
  }
</script>

<section class="p-4">
  <h1 class="text-2xl mb-4">Settings</h1>

  <div class="mb-4">
    <label class="block font-medium mb-2">Theme</label>
    <div class="theme-picker" role="radiogroup" aria-label="Theme">
      {#each [{ value: 'light', label: 'Light', icon: '☀️' }, { value: 'dark', label: 'Dark', icon: '🌙' }] as opt (opt.value)}
        <button
          type="button"
          class={['theme-card', theme === opt.value && 'selected'].filter(Boolean).join(' ')}
          role="radio"
          aria-checked={theme === opt.value}
          onclick={() => pickTheme(opt.value)}
        >
          <span class="theme-icon">{opt.icon}</span>
          <span class="theme-label">{opt.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2">Font size</label>
    <select bind:value={fontSize}>
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2">Autosave interval (seconds)</label>
    <input type="number" bind:value={autosave} min="0" />
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2">AI Summary</label>
    <label>
      <input type="checkbox" bind:checked={autoSummary} />
      Auto-generate summary on save
    </label>
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2" for="daily-goal">Daily Writing Goal (words)</label>
    <input id="daily-goal" type="number" bind:value={dailyTarget} min="1" max="100000" />
    {#if goalsStore.goals.streak > 0}
      <p class="goal-streak">🔥 Current streak: {goalsStore.goals.streak} day{goalsStore.goals.streak !== 1 ? 's' : ''}</p>
    {/if}
  </div>

  <button onclick={save} class="btn btn-primary">Save</button>
</section>

<section class="settings-section">
  <h2>Plugins</h2>
  <PluginManager />
</section>

<style>
  .theme-picker {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid var(--color-border, #e5e7eb);
    border-radius: 0.625rem;
    background: var(--color-surface, #f9fafb);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-width: 80px;
  }
  .theme-card:hover {
    border-color: var(--color-accent, #7c3aed);
  }
  .theme-card.selected {
    border-color: var(--color-accent, #7c3aed);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7c3aed) 20%, transparent);
  }
  .theme-icon { font-size: 1.5rem; }
  .theme-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text, #111); }
  .goal-streak { font-size: 0.85rem; margin-top: 0.25rem; }
</style>
