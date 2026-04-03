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
    <h2 id="theme-label" class="block font-medium mb-2">Theme</h2>
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
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  section {
    padding: var(--pad-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-bottom: var(--pad-lg);
    color: var(--color-text);
  }

  h2 {
    font-size: var(--text-lg);
    margin-bottom: var(--pad-md);
    color: var(--color-text);
  }

  .mb-4 {
    margin-bottom: var(--pad-lg);
  }

  .block {
    display: block;
  }

  .font-medium {
    font-weight: var(--font-medium);
  }

  label {
    color: var(--color-text);
    font-weight: var(--font-medium);
  }

  select,
  input[type="number"],
  input[type="text"] {
    width: 100%;
    padding: var(--pad-sm) var(--pad-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
  }

  select:focus,
  input[type="number"]:focus,
  input[type="text"]:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  input[type="checkbox"] {
    margin-right: var(--gap-sm);
  }

  .theme-picker {
    display: flex;
    gap: var(--gap-md);
    flex-wrap: wrap;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xs);
    padding: var(--pad-md) var(--pad-lg);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: var(--transition-fast);
    min-width: 80px;
  }

  .theme-card:hover {
    border-color: var(--color-primary);
  }

  .theme-card.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 20%, transparent);
  }

  .theme-icon {
    font-size: var(--text-xl);
  }

  .theme-label {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--color-text);
  }

  .goal-streak {
    font-size: var(--text-sm);
    margin-top: var(--pad-xs);
    color: var(--color-text);
  }

  .goal-input-row {
    display: flex;
    gap: var(--gap-md);
    align-items: center;
  }

  .goal-input-row input {
    flex: 1;
    min-width: 0;
  }

  .btn-template {
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-primary);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: var(--font-medium);
    white-space: nowrap;
    transition: var(--transition-fast);
    font-size: var(--text-base);
  }

  .btn-template:hover {
    background: var(--color-primary-hover);
  }

  .btn-primary {
    padding: var(--pad-sm) var(--pad-lg);
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
    background: var(--color-primary-hover);
  }

  .settings-section {
    padding: var(--pad-lg);
    border-top: 1px solid var(--color-border);
  }

  .privacy-row {
    margin-bottom: var(--pad-md);
  }

  .privacy-row label {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    font-weight: var(--font-normal);
    color: var(--color-text);
  }

  .privacy-name {
    margin-top: var(--pad-md);
  }

  .privacy-name label {
    display: block;
    margin-bottom: var(--pad-xs);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .privacy-name input {
    max-width: 20rem;
  }
</style>
