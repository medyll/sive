<script lang="ts">
  import { browser } from '$app/environment';
  import EditorPanel from '$lib/elements/EditorPanel.svelte';
  import AIPanel from '$lib/elements/AIPanel.svelte';
  import ChatBar from '$lib/elements/ChatBar.svelte';

  const SPLIT_KEY = 'sive.splitRatio';
  const FOCUS_KEY = 'sive.focusMode';
  const DEFAULT_RATIO = 0.55;

  let splitRatio = $state<number>(
    browser ? parseFloat(localStorage.getItem(SPLIT_KEY) ?? String(DEFAULT_RATIO)) : DEFAULT_RATIO
  );

  let focusMode = $state<boolean>(
    browser ? localStorage.getItem(FOCUS_KEY) === 'true' : false
  );

  /** Stub — will be wired to AI results in a later sprint */
  let suggestionsReady = $state(false);

  /** Stub — will be wired to AI processing state in a later sprint */
  let aiProcessing = $state(false);

  let dragging = $state(false);
  let chatBarOpen = $state(true);

  function persistState(_node: HTMLElement) {
    $effect(() => {
      localStorage.setItem(SPLIT_KEY, `${splitRatio}`);
      localStorage.setItem(FOCUS_KEY, `${focusMode}`);
    });
    return {};
  }

  function globalKeyboardShortcuts(_node: HTMLElement) {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        focusMode = !focusMode;
      }
    }
    window.addEventListener('keydown', onKeydown);
    return {
      destroy() {
        window.removeEventListener('keydown', onKeydown);
      }
    };
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

  function toggleFocusMode() {
    focusMode = !focusMode;
  }

  function handleChatSend(message: string) {
    // TODO: wire to AI command bus in a later sprint
    console.log('[chat]', message);
  }
</script>

<div class="app-root" {@attach persistState} {@attach globalKeyboardShortcuts}>
  <header class="main-toolbar">
    <span class="project-label">My project / Chapter 1</span>
    <div class="toolbar-actions">
      <button type="button" onclick={toggleFocusMode} aria-pressed={focusMode}>
        {focusMode ? 'Exit Focus' : 'Focus'}
      </button>
      <button type="button" aria-disabled="true">Review</button>
      <button type="button" aria-disabled="true">💾 New version</button>
      <button type="button" aria-disabled="true">⚙</button>
    </div>
  </header>

  <div class="workspace" {@attach workspaceRef}>
    <div
      class="panel editor-panel"
      style="width: {focusMode ? '100%' : `${splitRatio * 100}%`}"
    >
      <EditorPanel />
    </div>

    {#if !focusMode}
      <div
        class="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        onpointerdown={onPointerDown}
      ></div>

      <div class="panel ai-panel" style="width: {(1 - splitRatio) * 100}%">
        <AIPanel {aiProcessing} />
      </div>
    {/if}
  </div>

  <!-- Floating chat bar overlay -->
  <div class="chat-overlay" id="chat-bar">
    <button
      class="chat-toggle"
      type="button"
      aria-expanded={chatBarOpen}
      aria-controls="chat-bar-content"
      onclick={() => { chatBarOpen = !chatBarOpen; }}
    >
      {chatBarOpen ? '▼' : '▲'}
    </button>

    {#if chatBarOpen}
      <div id="chat-bar-content" class="chat-bar-inner">
        <button type="button" class="chat-action" aria-disabled="true" aria-label="Toggle voice input">🎤</button>
        <ChatBar placeholder="Type a command or question…" onSend={handleChatSend} />
        <button type="button" class="chat-action" aria-disabled="true" aria-label="Upload image">🖼</button>
      </div>
    {/if}
  </div>

  {#if focusMode && suggestionsReady}
    <div
      id="suggestions-ready-badge"
      class="badge"
      role="status"
      aria-label="AI suggestions are ready"
      title="Suggestions ready — exit Focus Mode to view"
    ></div>
  {/if}
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
    transition: width 0.2s ease;
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

  /* Chat overlay — fixed bottom-center */
  .chat-overlay {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    z-index: 100;
  }

  .chat-toggle {
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 1rem;
    padding: 0.15rem 0.75rem;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .chat-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 2rem;
    padding: 0.4rem 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    min-width: 32rem;
  }

  .chat-action {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0.25rem;
    opacity: 0.5;
  }

  .badge {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--color-primary, #646cff);
    box-shadow: 0 0 6px var(--color-primary, #646cff);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>

  const SPLIT_KEY = 'sive.splitRatio';
  const FOCUS_KEY = 'sive.focusMode';
  const DEFAULT_RATIO = 0.55;

  let splitRatio = $state<number>(
    browser ? parseFloat(localStorage.getItem(SPLIT_KEY) ?? String(DEFAULT_RATIO)) : DEFAULT_RATIO
  );

  let focusMode = $state<boolean>(
    browser ? localStorage.getItem(FOCUS_KEY) === 'true' : false
  );

  /** Stub — will be wired to AI results in a later sprint */
  let suggestionsReady = $state(false);

  let dragging = $state(false);

  function persistState(_node: HTMLElement) {
    $effect(() => {
      localStorage.setItem(SPLIT_KEY, `${splitRatio}`);
      localStorage.setItem(FOCUS_KEY, `${focusMode}`);
    });
    return {};
  }

  function globalKeyboardShortcuts(_node: HTMLElement) {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        focusMode = !focusMode;
      }
    }
    window.addEventListener('keydown', onKeydown);
    return {
      destroy() {
        window.removeEventListener('keydown', onKeydown);
      }
    };
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

  function toggleFocusMode() {
    focusMode = !focusMode;
  }
</script>

<div class="app-root" {@attach persistState} {@attach globalKeyboardShortcuts}>
  <header class="main-toolbar">
    <span class="project-label">My project / Chapter 1</span>
    <div class="toolbar-actions">
      <button type="button" onclick={toggleFocusMode} aria-pressed={focusMode}>
        {focusMode ? 'Exit Focus' : 'Focus'}
      </button>
      <button type="button" aria-disabled="true">Review</button>
      <button type="button" aria-disabled="true">💾 New version</button>
      <button type="button" aria-disabled="true">⚙</button>
    </div>
  </header>

  <div class="workspace" {@attach workspaceRef}>
    <div
      class="panel editor-panel"
      style="width: {focusMode ? '100%' : `${splitRatio * 100}%`}"
    >
      <EditorPanel />
    </div>

    {#if !focusMode}
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
    {/if}
  </div>

  {#if focusMode && suggestionsReady}
    <div
      id="suggestions-ready-badge"
      class="badge"
      role="status"
      aria-label="AI suggestions are ready"
      title="Suggestions ready — exit Focus Mode to view"
    ></div>
  {/if}
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
    transition: width 0.2s ease;
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

  .badge {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--color-primary, #646cff);
    box-shadow: 0 0 6px var(--color-primary, #646cff);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>