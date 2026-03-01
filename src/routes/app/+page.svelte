<script lang="ts">
  import { browser } from '$app/environment';
  import EditorPanel from '$lib/elements/EditorPanel.svelte';
  import AIPanel from '$lib/elements/AIPanel.svelte';

  const SPLIT_KEY = 'sive.splitRatio';
  const DEFAULT_RATIO = 0.55;

  let splitRatio = $state<number>(
    browser ? parseFloat(localStorage.getItem(SPLIT_KEY) ?? String(DEFAULT_RATIO)) : DEFAULT_RATIO
  );

  let dragging = $state(false);

  function saveRatio(_node: HTMLElement) {
    // Side-effect attachment: persist splitRatio to localStorage on each change
    $effect(() => {
      localStorage.setItem(SPLIT_KEY, `${splitRatio}`);
    });
    return {};
  }

  function workspaceRef(node: HTMLElement) {
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const rect = node.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      splitRatio = Math.min(0.8, Math.max(0.2, ratio));
    }
    function onPointerUp() {
      dragging = false;
    }
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    return {
      destroy() {
        node.removeEventListener('pointermove', onPointerMove);
        node.removeEventListener('pointerup', onPointerUp);
      }
    };
  }

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
</script>

<div class="app-root" {@attach saveRatio}>
  <header class="main-toolbar">
    <span class="project-label">My project / Chapter 1</span>
    <div class="toolbar-actions">
      <button type="button" aria-disabled="true">Review</button>
      <button type="button" aria-disabled="true">💾 New version</button>
      <button type="button" aria-disabled="true">⚙</button>
    </div>
  </header>

  <div class="workspace" {@attach workspaceRef}>
    <div class="panel editor-panel" style="width: {splitRatio * 100}%">
      <EditorPanel />
    </div>

    <div
      class="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panels"
      onpointerdown={onPointerDown}
    ></div>

    <div class="panel ai-panel" style="width: {(1 - splitRatio) * 100}%">
      <AIPanel />
    </div>
  </div>
</div>

<style>
  .app-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .main-toolbar {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    height: 3rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    flex-shrink: 0;
  }

  .project-label {
    flex: 1;
    font-weight: 500;
  }

  .toolbar-actions {
    display: flex;
    gap: 0.5rem;
  }

  .workspace {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .panel {
    overflow: hidden;
    height: 100%;
  }

  .resize-handle {
    width: 6px;
    flex-shrink: 0;
    cursor: ew-resize;
    background-color: var(--color-border, #e0e0e0);
    transition: background-color 0.15s;
  }

  .resize-handle:hover,
  .resize-handle:active {
    background-color: var(--color-primary, #646cff);
  }
</style>