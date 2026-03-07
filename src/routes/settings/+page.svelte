<script lang="ts">
  import { onMount } from 'svelte';
  import { toastStore } from '$lib/toastStore.svelte';

  let theme: string = 'light';
  let fontSize: string = 'medium';
  let autosave: number = 30;

  onMount(() => {
    try {
      const saved = localStorage.getItem('settings');
      if (saved) {
        const p = JSON.parse(saved);
        theme = p.theme ?? theme;
        fontSize = p.fontSize ?? fontSize;
        autosave = p.autosave ?? autosave;
      }
    } catch (e) {
      // ignore
    }
  });

  function save() {
    const prefs = { theme, fontSize, autosave };
    try {
      localStorage.setItem('settings', JSON.stringify(prefs));
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

  <button on:click={save} class="btn btn-primary">Save</button>
</section>
