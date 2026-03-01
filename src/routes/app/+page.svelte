<script lang="ts">
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import EditorPanel from '$lib/elements/EditorPanel.svelte';
  import AIPanel from '$lib/elements/AIPanel.svelte';
  import ChatBar from '$lib/elements/ChatBar.svelte';
  import ReviewScreen from '$lib/elements/ReviewScreen.svelte';
  import HardenModal from '$lib/elements/HardenModal.svelte';
  import DocumentList from '$lib/elements/DocumentList.svelte';
  import { hardenStore, nextHardenId } from '$lib/hardenStore.svelte.js';

  const SPLIT_KEY = 'sive.splitRatio';
  const FOCUS_KEY = 'sive.focusMode';
  const DEFAULT_RATIO = 0.55;

  interface Props {
    data: {
      documents: Array<{ id: string; title: string; content: string; updated_at: number }>;
      activeDocumentId: string;
    };
    form?: unknown;
  }

  let { data }: Props = $props();

  let splitRatio = $state<number>(
    browser ? parseFloat(localStorage.getItem(SPLIT_KEY) ?? String(DEFAULT_RATIO)) : DEFAULT_RATIO
  );

  let focusMode = $state<boolean>(
    browser ? localStorage.getItem(FOCUS_KEY) === 'true' : false
  );

  let reviewMode = $state(false);
  let hardenOpen = $state(false);

  // Document state
  let documents = $state(data.documents);
  let activeDocumentId = $state(data.activeDocumentId);
  let activeContent = $state(
    data.documents.find((d) => d.id === data.activeDocumentId)?.content ?? ''
  );

  // Sync activeContent when switching documents
  $effect(() => {
    activeContent = documents.find((d) => d.id === activeDocumentId)?.content ?? '';
  });

  // Hidden form references for programmatic submission
  let createDocForm: HTMLFormElement;
  let saveDocForm: HTMLFormElement;
  let saveIdInput: HTMLInputElement;
  let saveContentInput: HTMLInputElement;
  let renameDocForm: HTMLFormElement;
  let renameIdInput: HTMLInputElement;
  let renameTitleInput: HTMLInputElement;
  let deleteDocForm: HTMLFormElement;
  let deleteIdInput: HTMLInputElement;

  function handleSelectDocument(id: string) {
    activeDocumentId = id;
  }

  async function handleNewDocument() {
    createDocForm?.requestSubmit();
  }

  function handleSave(id: string, content: string) {
    // Update local state immediately
    const doc = documents.find((d) => d.id === id);
    if (doc) doc.content = content;

    // Submit to server via hidden form
    if (saveDocForm && saveIdInput && saveContentInput) {
      saveIdInput.value = id;
      saveContentInput.value = content;
      saveDocForm.requestSubmit();
    }
  }

  function handleRename(id: string, title: string) {
    const doc = documents.find((d) => d.id === id);
    if (doc) doc.title = title;

    if (renameDocForm && renameIdInput && renameTitleInput) {
      renameIdInput.value = id;
      renameTitleInput.value = title;
      renameDocForm.requestSubmit();
    }
  }

  function handleDelete(id: string) {
    documents = documents.filter((d) => d.id !== id);
    if (activeDocumentId === id) {
      activeDocumentId = documents[0]?.id ?? '';
    }

    if (deleteDocForm && deleteIdInput) {
      deleteIdInput.value = id;
      deleteDocForm.requestSubmit();
    }
  }

  function handleHarden(label: string, message: string) {
    hardenStore.add({
      id: nextHardenId(hardenStore.snapshots.length),
      label,
      timestamp: new Date().toISOString(),
      message,
      wordCount: 0
    });
    hardenOpen = false;
  }

  let editingToolbarTitle = $state(false);
  let toolbarTitleValue = $state('');

  function startToolbarEdit() {
    toolbarTitleValue = documents.find(d => d.id === activeDocumentId)?.title ?? '';
    editingToolbarTitle = true;
  }

  function commitToolbarTitle() {
    editingToolbarTitle = false;
    const trimmed = toolbarTitleValue.trim();
    if (trimmed) handleRename(activeDocumentId, trimmed);
  }

  function onToolbarTitleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitToolbarTitle(); }
    if (e.key === 'Escape') { editingToolbarTitle = false; }
  }
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
      // Ctrl+S — immediate save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (activeDocumentId) handleSave(activeDocumentId, activeContent);
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
    <div class="project-label">
      {#if editingToolbarTitle}
        <input
          class="toolbar-title-input"
          type="text"
          bind:value={toolbarTitleValue}
          onblur={commitToolbarTitle}
          onkeydown={onToolbarTitleKey}
          aria-label="Document title"
        />
      {:else}
        <span
          class="toolbar-title"
          role="button"
          tabindex="0"
          onclick={startToolbarEdit}
          onkeydown={(e) => e.key === 'Enter' && startToolbarEdit()}
          title="Click to rename"
        >
          {documents.find(d => d.id === activeDocumentId)?.title ?? 'Untitled'}
        </span>
      {/if}
    </div>
    <div class="toolbar-actions">
      {#if !reviewMode}
        <button type="button" onclick={toggleFocusMode} aria-pressed={focusMode}>
          {focusMode ? 'Exit Focus' : 'Focus'}
        </button>
      {/if}
      <button
        type="button"
        onclick={() => { reviewMode = !reviewMode; }}
        aria-pressed={reviewMode}
      >Review</button>
      <button type="button" onclick={() => { hardenOpen = true; }}>💾 New version</button>
      <button type="button" aria-disabled="true">⚙</button>
    </div>
  </header>

  {#if reviewMode}
    <div class="workspace">
      <ReviewScreen onExitReview={() => { reviewMode = false; }} />
    </div>
  {:else}
    <div class="workspace" {@attach workspaceRef}>
      {#if !focusMode}
        <DocumentList
          {documents}
          activeId={activeDocumentId}
          onSelect={handleSelectDocument}
          onNew={handleNewDocument}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      {/if}

      <div
        class="panel editor-panel"
        style="width: {focusMode ? '100%' : `calc(${splitRatio * 100}% - 14rem)`}"
      >
        <EditorPanel
          documentId={activeDocumentId}
          bind:content={activeContent}
          onSave={handleSave}
        />
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

    <!-- Hidden forms for server actions -->
    <form
      method="POST"
      action="?/createDocument"
      bind:this={createDocForm}
      use:enhance={({ formData: _fd, cancel }) => {
        return async ({ result }) => {
          if (result.type === 'success' && result.data?.id) {
            const newDoc = { id: result.data.id as string, user_id: 'guest', title: 'Untitled', content: '', updated_at: Date.now() };
            documents = [...documents, newDoc];
            activeDocumentId = newDoc.id;
          } else {
            // mock mode: still create a local stub
            const stubId = `local-${Date.now()}`;
            const newDoc = { id: stubId, user_id: 'guest', title: 'Untitled', content: '', updated_at: Date.now() };
            documents = [...documents, newDoc];
            activeDocumentId = stubId;
          }
        };
      }}
      style="display:none"
    ></form>

    <form
      method="POST"
      action="?/updateDocument"
      bind:this={saveDocForm}
      use:enhance
      style="display:none"
    >
      <input type="hidden" name="id" bind:this={saveIdInput} />
      <input type="hidden" name="content" bind:this={saveContentInput} />
    </form>

    <form
      method="POST"
      action="?/updateDocument"
      bind:this={renameDocForm}
      use:enhance
      style="display:none"
    >
      <input type="hidden" name="id" bind:this={renameIdInput} />
      <input type="hidden" name="title" bind:this={renameTitleInput} />
    </form>

    <form
      method="POST"
      action="?/deleteDocument"
      bind:this={deleteDocForm}
      use:enhance={({ formData: _fd, cancel: _cancel }) => {
        return async () => {
          // Local state already updated in handleDelete
        };
      }}
      style="display:none"
    >
      <input type="hidden" name="id" bind:this={deleteIdInput} />
    </form>

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
  {/if}
</div>

{#key hardenOpen}
  {#if hardenOpen}
    <HardenModal
      onConfirm={handleHarden}
      onCancel={() => { hardenOpen = false; }}
    />
  {/if}
{/key}

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

  .toolbar-title {
    cursor: pointer;
    padding: 0.1rem 0.25rem;
    border-radius: 3px;
    border: 1px solid transparent;
  }

  .toolbar-title:hover {
    border-color: var(--color-border, #e0e0e0);
    background: var(--color-hover, #f0f0f0);
  }

  .toolbar-title-input {
    font-size: 1rem;
    font-weight: 500;
    border: 1px solid var(--color-primary, #646cff);
    border-radius: 3px;
    padding: 0.1rem 0.25rem;
    background: #fff;
    outline: none;
    min-width: 8rem;
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
