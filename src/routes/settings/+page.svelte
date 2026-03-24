<script lang="ts">
  import { onMount } from 'svelte';
  import { toastStore } from '$lib/toastStore.svelte';
  import PluginManager from '$lib/elements/PluginManager.svelte';
  import { pluginStore } from '$lib/pluginStore.svelte';
  import { goalsStore } from '$lib/writingGoalsStore.svelte';
  onMount(() => pluginStore.init());

  let dailyTarget = $state(goalsStore.goals.dailyTarget);

  let theme: string = 'light';
  let fontSize: string = 'medium';
  let autosave: number = 30;
  let autoSummary: boolean = false;

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

  function save() {
    const prefs = { theme, fontSize, autosave, autoSummary };
    try {
      localStorage.setItem('settings', JSON.stringify(prefs));
      goalsStore.setDailyTarget(dailyTarget);
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
    <label><input type="radio" bind:group={theme} value="light" /> Light</label>
    <label class="ml-4"><input type="radio" bind:group={theme} value="dark" /> Dark</label>
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
