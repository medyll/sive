<script>
  import EditorPanel from '$lib/elements/EditorPanel.svelte';
  import AIPanel from '$lib/elements/AIPanel.svelte';
  import Spinner from '$lib/elements/Spinner.svelte';
  import ChatBar from '$lib/elements/ChatBar.svelte';

  import { writable } from 'svelte/store';

  const focusMode = writable(false);
  const selectedTab = writable('suggestions');
  const isProcessing = writable(false);

  let localSelectedTab = 'suggestions';

  $: currentTab = localSelectedTab;

  function triggerAnalysis() {
    isProcessing.set(true);
    setTimeout(() => isProcessing.set(false), 2000); // Mock processing
  }
</script>

<div class="app-container app-theme theme-dark">
  <header>
    <div style="flex:1">AI-Assisted Writer</div>
    <div style="display:flex; gap:8px; align-items:center;">
      <button on:click={() => focusMode.update(v => !v)}>{ $focusMode ? 'Exit Focus' : 'Focus' }</button>
    </div>
  </header>

  <div class="workspace">
    <EditorPanel {focusMode} onAnalysis={triggerAnalysis} />

    <button
      class="resizer"
      type="button"
      aria-controls="editor-panel ai-panel"
      aria-label="Resize panels"
      style="width:8px;"
    ></button>

    {#if !$focusMode}
      <AIPanel bind:selectedTab={currentTab} />
    {/if}

    {#if $isProcessing}
      <Spinner />
    {/if}
  </div>

  <ChatBar />
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .workspace {
    display: flex;
    flex: 1;
  }
  .resizer {
    cursor: ew-resize;
  }
</style>