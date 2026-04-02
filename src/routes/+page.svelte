<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { untrack } from 'svelte';
  import { enhance } from '$app/forms';
  import EditorPanel from '$lib/elements/EditorPanel.svelte';
  import AIPanel from '$lib/elements/AIPanel.svelte';
  import ChatBar from '$lib/elements/ChatBar.svelte';
  import ReviewScreen from '$lib/elements/ReviewScreen.svelte';
  import HardenModal from '$lib/elements/HardenModal.svelte';
  import DocumentList from '$lib/elements/DocumentList.svelte';
  import ExportButton from '$lib/elements/ExportButton.svelte';
  import Toast from '$lib/elements/Toast.svelte';
import Onboarding from '$lib/elements/Onboarding.svelte';
  import KeyboardShortcutsHelp from '$lib/elements/KeyboardShortcutsHelp.svelte';
  import SummaryPanel from '$lib/elements/SummaryPanel.svelte';
  import { hardenStore, nextHardenId } from '$lib/hardenStore.svelte.js';
  import { summaryStore } from '$lib/summaryStore.svelte';
  import { streakStore } from '$lib/streakStore.svelte';
  import TemplatePicker from '$lib/elements/TemplatePicker.svelte';
  import VersionHistoryPanel from '$lib/elements/VersionHistoryPanel.svelte';
  import WritingGoalBar from '$lib/elements/WritingGoalBar.svelte';
  import FocusModePanel from '$lib/elements/FocusModePanel.svelte';
  import InstallPrompt from '$lib/elements/InstallPrompt.svelte';
  import OnboardingTour from '$lib/elements/OnboardingTour.svelte';
  import CommandPalette from '$lib/elements/CommandPalette.svelte';
  import ShareModal from '$lib/elements/ShareModal.svelte';
  import NotificationBell from '$lib/elements/NotificationBell.svelte';
  import FormattingToolbar from '$lib/elements/FormattingToolbar.svelte';
  import EditorFooter from '$lib/elements/EditorFooter.svelte';
  import CommentSidebar from '$lib/elements/CommentSidebar.svelte';
  import { openPalette } from '$lib/commandPaletteStore.svelte';
  import { themeStore } from '$lib/themeStore.svelte';

  function isAutoSummaryEnabled(): boolean {
    if (!browser) return false;
    try {
      const s = JSON.parse(localStorage.getItem('settings') ?? '{}');
      return s.autoSummary === true;
    } catch {
      return false;
    }
  }

  async function triggerBackgroundSummary(id: string, docContent: string): Promise<void> {
    const ctx = docContent ? btoa(unescape(encodeURIComponent(docContent.slice(0, 2000)))) : '';
    const url = `/api/ai/summary?length=medium${ctx ? `&ctx=${ctx}` : ''}`;
    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const token = line.slice(6);
          if (token === '[DONE]') { summaryStore.set(id, 'medium', text.trim()); return; }
          text += token;
        }
      }
    } catch {
      // silent — background task
    }
  }
  import { toastStore } from '$lib/toastStore.svelte';
  import { retryFetch } from '$lib/retryFetch';

  const SPLIT_KEY = 'sive.splitRatio';
  const FOCUS_KEY = 'sive.focusMode';
  const DEFAULT_RATIO = 0.55;

  interface Props {
    data: {
      documents: Array<{ id: string; title: string; content: string; updated_at: number }>;
      activeDocumentId: string;
      user?: { id: string; name?: string | null; email?: string | null } | null;
    };
    form?: unknown;
  }

  let { data }: Props = $props();

  // Wire user context into harden store for collaborative edit history
  $effect(() => {
    hardenStore.setContext({
      userId: data.user?.id,
      userName: data.user?.name ?? data.user?.email ?? 'Guest'
    });
  });

  let splitRatio = $state<number>(
    browser ? parseFloat(localStorage.getItem(SPLIT_KEY) ?? String(DEFAULT_RATIO)) : DEFAULT_RATIO
  );

  let focusMode = $state<boolean>(
    browser ? localStorage.getItem(FOCUS_KEY) === 'true' : false
  );

  let reviewMode = $state(false);
  let hardenOpen = $state(false);
  let sidebarOpen = $state(true);
  let templatePickerOpen = $state(false);
  let versionPanelOpen = $state(false);
  let focusPanelOpen = $state(false);
  let shareOpen = $state(false);
  let commentSidebarOpen = $state(false);
  let pendingCommentSelection = $state<{ anchorText: string; anchorOffset: number } | null>(null);

  // Document state
  let documents = $state(data.documents);
  let activeDocumentId = $state(data.activeDocumentId);
  let activeContent = $state(
    data.documents.find((d) => d.id === data.activeDocumentId)?.content ?? ''
  );

  // Sync activeContent only when switching documents (not on content edits)
  $effect(() => {
    const id = activeDocumentId;
    const docs = documents;
    untrack(() => {
      activeContent = docs.find((d) => d.id === id)?.content ?? '';
    });
  });

  // Sync with server data changes (navigation)
  $effect(() => {
    const incoming = data.documents;
    const incomingId = data.activeDocumentId;
    untrack(() => {
      documents = incoming;
      activeDocumentId = incomingId;
    });
  });

  // ── Debounced auto-save ───────────────────────────────────────────────────
  type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved';
  let saveStatus = $state<SaveStatus>('idle');
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let savedFadeTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingSave: { id: string; content: string } | null = null;

  function debouncedSave(id: string, content: string) {
    pendingSave = { id, content };
    saveStatus = 'pending';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => flushSave(), 1500);
  }

  async function flushSave() {
    if (!pendingSave) return;
    const { id, content } = pendingSave;
    pendingSave = null;
    saveTimer = null;
    saveStatus = 'saving';
    await handleSave(id, content);
    saveStatus = 'saved';
    if (savedFadeTimer) clearTimeout(savedFadeTimer);
    savedFadeTimer = setTimeout(() => (saveStatus = 'idle'), 2000);
  }

  // Flush on page unload
  $effect(() => {
    function onBeforeUnload() { if (pendingSave) flushSave(); }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  });

  // Auto-save version after each explicit save
  async function saveVersionAfterSave(id: string, content: string) {
    try {
      await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', docId: id, content, title: documents.find(d => d.id === id)?.title ?? 'Untitled' })
      });
    } catch { /* silent */ }
  }

  // Handle notification:navigate — jump to referenced document
  $effect(() => {
    function onNotifNavigate(e: Event) {
      const docId = (e as CustomEvent<{ docId: string }>).detail?.docId;
      if (docId && documents.some(d => d.id === docId)) activeDocumentId = docId;
    }
    window.addEventListener('notification:navigate', onNotifNavigate);
    return () => window.removeEventListener('notification:navigate', onNotifNavigate);
  });

  // Handle palette:focusSearch — focus sidebar search input
  $effect(() => {
    function onFocusSearch() {
      sidebarOpen = true;
      setTimeout(() => {
        (document.querySelector('.doc-search-input') as HTMLInputElement | null)?.focus();
      }, 50);
    }
    window.addEventListener('palette:focusSearch', onFocusSearch);
    return () => window.removeEventListener('palette:focusSearch', onFocusSearch);
  });

  // Palette handlers — all remaining commands
  $effect(() => {
    function onNewDocument() { handleNewDocument(); }
    function onToggleFocus() { focusMode = !focusMode; }
    function onShowShortcuts() { showShortcutsHelp = true; }
    function onToggleTheme() {
      themeStore.setTheme(themeStore.theme === 'dark' ? 'light' : 'dark');
    }
    function onSummarize() { showSummaryPanel = true; }
    function onOpenAIChat() { chatBarOpen = true; }
    function onExportPDF() {
      const doc = documents.find(d => d.id === activeDocumentId);
      if (!doc) return;
      const params = new URLSearchParams({ title: doc.title, content: activeContent });
      window.open(`/api/export/pdf?${params}`, '_blank');
    }
    function onExportMarkdown() {
      const doc = documents.find(d => d.id === activeDocumentId);
      if (!doc) return;
      const blob = new Blob([activeContent], { type: 'text/markdown' });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `${doc.title}.md`
      });
      a.click();
      URL.revokeObjectURL(a.href);
    }
    function onDuplicateDocument() {
      if (!activeDocumentId) return;
      if (duplicateDocForm && duplicateIdInput) {
        duplicateIdInput.value = activeDocumentId;
        duplicateDocForm.requestSubmit();
      }
    }
    function onDeleteDocument() {
      if (activeDocumentId) handleDelete(activeDocumentId);
    }

    const events: [string, () => void][] = [
      ['palette:newDocument',      onNewDocument],
      ['palette:toggleFocus',      onToggleFocus],
      ['palette:showShortcuts',    onShowShortcuts],
      ['palette:toggleTheme',      onToggleTheme],
      ['palette:summarize',        onSummarize],
      ['palette:openAIChat',       onOpenAIChat],
      ['palette:exportPDF',        onExportPDF],
      ['palette:exportMarkdown',   onExportMarkdown],
      ['palette:duplicateDocument',onDuplicateDocument],
      ['palette:deleteDocument',   onDeleteDocument],
    ];
    for (const [ev, fn] of events) window.addEventListener(ev, fn);
    return () => { for (const [ev, fn] of events) window.removeEventListener(ev, fn); };
  });

  // Listen to palette custom events
  $effect(() => {
    function onNewFromTemplate() { templatePickerOpen = true; }
    function onSaveAsTemplate() {
      const doc = documents.find(d => d.id === activeDocumentId);
      if (!doc) return;
      fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: doc.title, description: '', content: doc.content, category: 'general' })
      }).then(() => toastStore.success('Template saved'));
    }
    window.addEventListener('palette:newFromTemplate', onNewFromTemplate);
    window.addEventListener('palette:saveAsTemplate', onSaveAsTemplate);
    return () => {
      window.removeEventListener('palette:newFromTemplate', onNewFromTemplate);
      window.removeEventListener('palette:saveAsTemplate', onSaveAsTemplate);
    };
  });

  // Handle template apply
  async function handleTemplateApply(templateId: string, title: string) {
    const res = await fetch('/api/templates');
    if (!res.ok) return;
    const templates = await res.json();
    const t = templates.find((x: { id: string; content: string }) => x.id === templateId);
    if (!t) return;
    createDocForm?.requestSubmit();
    // After creation, content will be populated via activeContent
    setTimeout(() => { activeContent = t.content; }, 200);
    templatePickerOpen = false;
  }

  // Hidden form references for programmatic submission
  let createDocForm = $state<HTMLFormElement | null>(null);
  let saveDocForm = $state<HTMLFormElement | null>(null);
  let saveIdInput = $state<HTMLInputElement | null>(null);
  let saveContentInput = $state<HTMLInputElement | null>(null);
  let renameDocForm = $state<HTMLFormElement | null>(null);
  let renameIdInput = $state<HTMLInputElement | null>(null);
  let renameTitleInput = $state<HTMLInputElement | null>(null);
  let deleteDocForm = $state<HTMLFormElement | null>(null);
  let deleteIdInput = $state<HTMLInputElement | null>(null);
  let duplicateDocForm = $state<HTMLFormElement | null>(null);
  let duplicateIdInput = $state<HTMLInputElement | null>(null);

  function handleSelectDocument(id: string) {
    activeDocumentId = id;
  }

  async function handleNewDocument() {
    createDocForm?.requestSubmit();
  }

  async function handleSave(id: string, content: string) {
    // Update local state immediately
    const doc = documents.find((d) => d.id === id);
    if (doc) doc.content = content;

    // Submit to server via hidden form (preferred path)
    if (saveDocForm && saveIdInput && saveContentInput) {
      saveIdInput.value = id;
      saveContentInput.value = content;
      saveDocForm.requestSubmit();
      toastStore.success('Document saved');
      streakStore.recordActivity();
      if (isAutoSummaryEnabled()) {
        toastStore.info('Updating summary…');
        summaryStore.refreshSummary(id, 'medium');
        triggerBackgroundSummary(id, content);
      }
      return;
    }

    // Fallback: direct fetch with retry (e.g. form ref unavailable)
    try {
      await retryFetch(`?/saveDocument`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, content }).toString()
      });
      toastStore.success('Document saved');
      streakStore.recordActivity();
      if (isAutoSummaryEnabled()) {
        toastStore.info('Updating summary…');
        summaryStore.refreshSummary(id, 'medium');
        triggerBackgroundSummary(id, content);
      }
    } catch {
      toastStore.error('Failed to save document — please try again');
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
    // Remove from local state immediately (optimistic update)
    const docToDelete = documents.find(d => d.id === id);
    documents = documents.filter((d) => d.id !== id);
    if (activeDocumentId === id) {
      activeDocumentId = documents[0]?.id ?? '';
    }

    // Also call server action for persistence (if available)
    if (deleteDocForm && deleteIdInput) {
      deleteIdInput.value = id;
      deleteDocForm.requestSubmit();
    }
    
    // Show toast notification
    if (docToDelete) {
      toastStore.success(`"${docToDelete.title}" deleted`);
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
  let suggestionsReady = $state(false);
  let dragging = $state(false);
  let chatBarOpen = $state(false);
  let showShortcutsHelp = $state(false);
  let showSummaryPanel = $state(false);

  // Persist UI state to localStorage
  $effect(() => {
    if (browser) {
      localStorage.setItem(SPLIT_KEY, `${splitRatio}`);
      localStorage.setItem(FOCUS_KEY, `${focusMode}`);
    }
  });

  function globalKeyboardShortcuts(_node: HTMLElement) {
    function isTyping(e: KeyboardEvent): boolean {
      const t = e.target as HTMLElement;
      return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
    }

    function onKeydown(e: KeyboardEvent) {
      // Ctrl+K — command palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        openPalette();
        return;
      }
      // Focus mode — always active
      if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        focusMode = !focusMode;
        return;
      }
      // Ctrl+S — immediate save (allowed inside editor)
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        if (activeDocumentId) handleSave(activeDocumentId, activeContent);
        return;
      }
      // Skip remaining shortcuts when typing in an input
      if (isTyping(e)) return;

      // Ctrl+N — new document
      if (e.ctrlKey && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        handleNewDocument();
        return;
      }
      // Ctrl+B — toggle sidebar
      if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        sidebarOpen = !sidebarOpen;
        return;
      }
      // Ctrl+] — next document
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        const idx = documents.findIndex((d) => d.id === activeDocumentId);
        if (idx < documents.length - 1) activeDocumentId = documents[idx + 1].id;
        return;
      }
      // Ctrl+[ — previous document
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        const idx = documents.findIndex((d) => d.id === activeDocumentId);
        if (idx > 0) activeDocumentId = documents[idx - 1].id;
        return;
      }
      // ? — keyboard shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        showShortcutsHelp = !showShortcutsHelp;
        return;
      }
      // Ctrl+Alt+S — summary panel
      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        showSummaryPanel = !showSummaryPanel;
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

<div class="app-root" use:globalKeyboardShortcuts>
  {#if !focusMode}
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
      <button
        type="button"
        class="btn-sidebar-toggle"
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        onclick={() => (sidebarOpen = !sidebarOpen)}
      >☰</button>
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
      {#if data.user?.id !== 'guest'}
        <button type="button" onclick={() => { hardenOpen = true; }}>💾 New version</button>
        <button type="button" onclick={() => { versionPanelOpen = !versionPanelOpen; }} aria-pressed={versionPanelOpen} title="Version history">🕐 History</button>
      {/if}
      <button type="button" onclick={() => { focusPanelOpen = !focusPanelOpen; }} aria-pressed={focusPanelOpen} title="Focus mode / Pomodoro">🍅</button>
      <button
        type="button"
        class="btn-summary"
        aria-label="AI Summary (Ctrl+Alt+S)"
        title="AI Summary (Ctrl+Alt+S)"
        onclick={() => { showSummaryPanel = !showSummaryPanel; }}
        aria-pressed={showSummaryPanel}
      >📄 Summary</button>
      <button
        type="button"
        class="btn-share"
        data-testid="share-btn"
        aria-label="Share document"
        onclick={() => { shareOpen = true; }}
      >🔗 Share</button>
      <ExportButton
        title={documents.find(d => d.id === activeDocumentId)?.title ?? 'document'}
        content={activeContent}
        summary={summaryStore.get(activeDocumentId, 'medium') ?? ''}
        docId={activeDocumentId}
      />
      <NotificationBell />
      <a href="/settings" title="Settings" class="btn-settings">⚙</a>
      {#if data.user?.id === 'guest'}
        <a href="/auth" class="btn-login" title="Se connecter">Se connecter</a>
      {/if}
      <a
        href="/profile"
        class="user-badge"
        aria-label="Profile"
        title={data.user?.name ?? data.user?.email ?? 'Guest'}
      >
        {#if data.user?.name}
          {data.user.name.slice(0, 2).toUpperCase()}
        {:else if data.user?.email}
          {data.user.email.slice(0, 2).toUpperCase()}
        {:else}
          G
        {/if}
      </a>
      {#if data.user?.id === 'guest'}
        <span class="guest-indicator" title="Vous êtes en mode invité">Invité</span>
      {/if}
    </div>
  </header>
  {/if}

  {#if reviewMode}
    <div class="workspace">
      <ReviewScreen onExitReview={() => { reviewMode = false; }} />
    </div>
  {:else}
    <div class="workspace" {@attach workspaceRef}>
      {#if !focusMode && sidebarOpen}
        <div class="sidebar" data-tour="document-list">
          <DocumentList
            {documents}
            activeId={activeDocumentId}
            onSelect={(id) => { handleSelectDocument(id); if (browser && window.innerWidth < 768) sidebarOpen = false; }}
            onNew={handleNewDocument}
            onRename={handleRename}
            onDelete={handleDelete}
          />
          <WritingGoalBar currentWordCount={activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0} />
        </div>
      {/if}

      <div
        class="panel editor-panel"
        data-tour="editor"
        style="width: {focusMode ? '100%' : `calc(${splitRatio * 100}% - 14rem)`}"
      >
        {#if saveStatus !== 'idle'}
          <div class={['save-indicator', saveStatus === 'saved' && 'fade'].filter(Boolean).join(' ')}>
            {saveStatus === 'pending' ? '…' : saveStatus === 'saving' ? 'Saving…' : 'Saved ✓'}
          </div>
        {/if}
        <FormattingToolbar />
        <EditorPanel
          documentId={activeDocumentId}
          bind:content={activeContent}
          onSave={debouncedSave}
          onComment={(anchorText, anchorOffset) => {
            pendingCommentSelection = { anchorText, anchorOffset };
            commentSidebarOpen = true;
          }}
        />
        <EditorFooter content={activeContent} />
      </div>

      {#if commentSidebarOpen}
        <CommentSidebar
          docId={activeDocumentId}
          userId={data.user?.id ?? 'guest'}
          selectionText={pendingCommentSelection?.anchorText ?? ''}
          selectionOffset={pendingCommentSelection?.anchorOffset ?? 0}
        />
      {/if}

      {#if !focusMode}
        <div
          class="resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          onpointerdown={onPointerDown}
        ></div>

        <div class="panel ai-panel" data-tour="ai-panel" style="width: {(1 - splitRatio) * 100}%">
          <AIPanel {aiProcessing} editorContent={activeContent} docId={activeDocumentId} />
          {#if versionPanelOpen}
            <div class="version-panel-overlay">
              <VersionHistoryPanel
                docId={activeDocumentId}
                currentContent={activeContent}
                onrestore={(content, title) => {
                  activeContent = content;
                  const doc = documents.find(d => d.id === activeDocumentId);
                  if (doc) { doc.title = title; documents = [...documents]; }
                  versionPanelOpen = false;
                  toastStore.success('Version restored');
                }}
              />
            </div>
          {/if}
          {#if focusPanelOpen}
            <div class="focus-panel-overlay">
              <FocusModePanel />
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if focusMode}
      <button type="button" class="floating-exit-focus" onclick={toggleFocusMode} aria-pressed={focusMode} style="position:fixed;bottom:1rem;right:1rem;z-index:1000;">Exit Focus</button>
    {/if}

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
          <ChatBar placeholder="Ask the AI…" />
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

{#if shareOpen}
  <ShareModal
    documentId={activeDocumentId ?? ''}
    isOwner={true}
    onClose={() => { shareOpen = false; }}
    onShared={async (email) => {
      const docTitle = documents.find(d => d.id === activeDocumentId)?.title ?? 'Untitled';
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          targetUserId: email,
          type: 'doc_shared',
          title: 'Document shared with you',
          body: `"${docTitle}" has been shared with you`,
          docId: activeDocumentId
        })
      }).catch(() => {});
    }}
  />
{/if}

{#key hardenOpen}
  {#if hardenOpen}
    <HardenModal
      onConfirm={handleHarden}
      onCancel={() => { hardenOpen = false; }}
    />
  {/if}
{/key}

{#if showShortcutsHelp}
  <KeyboardShortcutsHelp onClose={() => { showShortcutsHelp = false; }} />
{/if}

{#if showSummaryPanel}
  <SummaryPanel
    docId={activeDocumentId}
    content={activeContent}
    onClose={() => { showSummaryPanel = false; }}
  />
{/if}

<!-- Disabled in favor of OnboardingTour (better UX with spotlight) -->
<!-- <Onboarding /> -->

<Toast />

<CommandPalette />

<OnboardingTour />

<InstallPrompt />

<TemplatePicker
  bind:open={templatePickerOpen}
  onapply={handleTemplateApply}
/>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     No more hardcoded colors — all values use design tokens
     ─────────────────────────────────────────────────────────────────────── */

  .save-indicator {
    position: absolute;
    top: var(--pad-sm);
    right: var(--pad-md);
    z-index: 10;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    pointer-events: none;
    transition: opacity var(--duration-slow);
  }
  .save-indicator.fade { opacity: 0; }

  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .version-panel-overlay {
    border-top: 1px solid var(--color-border);
    padding: var(--pad-md);
    height: 50%;
    overflow-y: auto;
    background: var(--color-surface);
  }

  .focus-panel-overlay {
    border-top: 1px solid var(--color-border);
    padding: var(--pad-md);
    overflow-y: auto;
    background: var(--color-surface);
  }

  .app-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .main-toolbar {
    display: flex;
    align-items: center;
    padding: 0 var(--pad-md);
    height: 3rem;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .project-label {
    flex: 1;
    font-weight: var(--font-medium);
  }

  .toolbar-title {
    cursor: pointer;
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
  }

  .toolbar-title:hover {
    border-color: var(--color-border);
    background: var(--color-surface-hover);
  }

  .toolbar-title-input {
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    padding: var(--pad-xs) var(--pad-sm);
    background: var(--color-surface);
    outline: none;
    min-width: 8rem;
  }

  .toolbar-actions {
    display: flex;
    gap: var(--gap-sm);
    align-items: center;
  }

  .user-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: var(--color-surface);
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    text-decoration: none;
    letter-spacing: 0.03em;
    flex-shrink: 0;
    transition: opacity var(--transition-fast);
  }

  .user-badge:hover { opacity: 0.82; }

  .workspace {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .panel {
    overflow: hidden;
    height: 100%;
    transition: width var(--transition-fast);
  }

  .resize-handle {
    width: 6px;
    flex-shrink: 0;
    cursor: ew-resize;
    background-color: var(--color-border);
    transition: background-color var(--transition-fast);
  }

  .resize-handle:hover,
  .resize-handle:active {
    background-color: var(--color-primary);
  }

  /* Chat overlay — fixed bottom-center */
  .chat-overlay {
    position: fixed;
    bottom: var(--pad-md);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xs);
    z-index: var(--z-dropdown);
  }

  .chat-toggle {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: var(--pad-xs) var(--pad-md);
    cursor: pointer;
    font-size: var(--text-xs);
    line-height: var(--leading-normal);
  }

  .chat-bar-inner {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: var(--pad-sm) var(--pad-md);
    box-shadow: var(--shadow-lg);
    min-width: 32rem;
  }

  .chat-action {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-lg);
    padding: var(--pad-xs);
    opacity: 0.5;
  }

  .badge {
    position: fixed;
    bottom: var(--pad-lg);
    right: var(--pad-lg);
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    background-color: var(--color-primary);
    box-shadow: 0 0 6px var(--color-primary);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Sidebar toggle — always visible */
  .btn-sidebar-toggle {
    display: inline-flex;
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-lg);
    padding: var(--pad-xs) var(--pad-sm);
    color: var(--color-text);
  }

  @media (max-width: 767px) {
    .btn-sidebar-toggle {
      display: inline-flex;
    }

    .main-toolbar {
      padding: 0 var(--pad-sm);
      gap: var(--gap-xs);
    }

    .workspace {
      flex-direction: column;
    }

    /* DocumentList becomes full-width overlay on mobile */
    :global(.doc-list) {
      width: 100% !important;
      height: auto;
      max-height: 40vh;
      border-right: none;
      border-bottom: 1px solid var(--color-border);
    }

    .panel {
      width: 100% !important;
      height: auto;
      flex: 1;
    }

    .resize-handle {
      display: none;
    }

    /* Chat overlay mobile */
    .chat-overlay {
      left: var(--pad-sm);
      right: var(--pad-sm);
      max-width: none;
    }
  }

  .btn-summary {
    padding: var(--pad-sm) var(--pad-md);
    font-size: var(--text-sm);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--transition-fast);
  }

  .btn-summary:hover {
    background: var(--color-surface-hover);
  }

  .btn-summary[aria-pressed="true"] {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-surface);
  }

  .guest-indicator {
    margin-left: var(--gap-sm);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    background: rgba(0, 0, 0, 0.04);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-full);
    align-self: center;
    display: inline-block;
  }
</style>
