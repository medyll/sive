<script lang="ts">
  import { onMount } from 'svelte';
  import { toastStore } from '$lib/toastStore.svelte';
  import PluginManager from '$lib/elements/PluginManager.svelte';
  import GoalsDashboard from '$lib/elements/GoalsDashboard.svelte';
  import GoalTemplateModal from '$lib/elements/GoalTemplateModal.svelte';
  import PartnersList from '$lib/elements/PartnersList.svelte';
  import { privacyStore } from '$lib/privacyStore.svelte';
  import { pluginStore } from '$lib/pluginStore.svelte';
  import { goalsStore } from '$lib/writingGoalsStore.svelte';
  import { themeStore } from '$lib/themeStore.svelte';
  onMount(() => pluginStore.init());

  let dailyTarget = $state(goalsStore.goals.dailyTarget);
  let showTemplateModal = $state(false);

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
    <label id="theme-label" class="block font-medium mb-2">Theme</label>
    <div id="theme-picker" class="theme-picker" role="radiogroup" aria-labelledby="theme-label">
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
    <label class="block font-medium mb-2" for="font-size">Font size</label>
    <select id="font-size" bind:value={fontSize}>
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2" for="autosave">Autosave interval (seconds)</label>
    <input id="autosave" type="number" bind:value={autosave} min="0" />
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2" for="auto-summary">AI Summary</label>
    <label for="auto-summary">
      <input id="auto-summary" type="checkbox" bind:checked={autoSummary} />
      Auto-generate summary on save
    </label>
  </div>

  <div class="mb-4">
    <label class="block font-medium mb-2" for="daily-goal">Daily Writing Goal (words)</label>
    <div class="goal-input-row">
      <input id="daily-goal" type="number" bind:value={dailyTarget} min="1" max="100000" />
      <button type="button" onclick={() => (showTemplateModal = true)} class="btn-template">
        📋 Use Template
      </button>
    </div>
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

<section class="settings-section">
  <h2>Goals Dashboard</h2>
  <GoalsDashboard />
</section>

<section class="settings-section">
  <PartnersList />
</section>

<section class="settings-section">
  <h2>Privacy</h2>
  <div class="privacy-row">
    <label for="leaderboard-toggle">
      <input
        id="leaderboard-toggle"
        type="checkbox"
        checked={privacyStore.state.showOnLeaderboard}
        onchange={(e) => privacyStore.setLeaderboardVisibility((e.target as HTMLInputElement).checked)}
      />
      Show me on the leaderboard
    </label>
  </div>
  <div class="privacy-row">
    <label for="discovery-toggle">
      <input
        id="discovery-toggle"
        type="checkbox"
        checked={privacyStore.state.showInDiscovery}
        onchange={(e) => privacyStore.setShowInDiscovery((e.target as HTMLInputElement).checked)}
      />
      Allow others to discover me
    </label>
  </div>
  {#if privacyStore.state.showOnLeaderboard || privacyStore.state.showInDiscovery}
    <div class="privacy-name">
      <label for="display-name">Display name</label>
      <input
        id="display-name"
        type="text"
        maxlength="30"
        placeholder="@yourname"
        value={privacyStore.state.displayName}
        oninput={(e) => privacyStore.setDisplayName((e.target as HTMLInputElement).value)}
      />
    </div>
  {/if}
</section>

{#if showTemplateModal}
  <GoalTemplateModal onClose={() => (showTemplateModal = false)} />
{/if}

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

  .goal-input-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .goal-input-row input {
    flex: 1;
    min-width: 0;
  }

  .btn-template {
    padding: 0.5rem 1rem;
    background: var(--color-accent, #7c3aed);
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
    transition: background 0.2s;
    font-size: 0.9rem;
  }

  .btn-template:hover {
    background: #6d28d9;
  }
</style>
