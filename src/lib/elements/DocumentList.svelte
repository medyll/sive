<!--
  DocumentList — sidebar listing user documents with create/switch/rename/delete support
-->
<script lang="ts">
  import { tagStore } from '$lib/tagStore.svelte.js';
  import { presenceStore } from '$lib/presenceStore.svelte';

  export interface DocumentItem {
    id: string;
    title: string;
    updated_at: number;
    role?: string;
    tags?: string;
  }

  export interface DocumentListProps {
    documents?: DocumentItem[];
    activeId?: string;
    loading?: boolean;
    onSelect?: (id: string) => void;
    onNew?: () => void;
    onRename?: (id: string, title: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onBulkDelete?: (ids: string[]) => void;
  }

  let {
    documents = [],
    activeId = '',
    loading = false,
    onSelect,
    onNew,
    onRename,
    onDelete,
    onDuplicate,
    onBulkDelete
  }: DocumentListProps = $props();

  let menus = {}; // Store references by ID

  // Hydrate tags from server data whenever documents change
  $effect(() => {
    for (const doc of documents) {
      if (doc.tags) tagStore.hydrate(doc.id, doc.tags);
    }
  });

  // Search / filter
  let searchQuery = $state('');
  let activeTagFilter = $state<string | null>(null);

  let filteredDocuments = $derived(
    documents.filter((d) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesTag =
        activeTagFilter === null ||
        tagStore.get(d.id).includes(activeTagFilter);
      return matchesSearch && matchesTag;
    })
  );

  // All tags across all documents (for the filter bar)
  let allDocTags = $derived(
    [...new Set(documents.flatMap((d) => tagStore.get(d.id)))].sort()
  );

  // Tag editing state
  let tagEditingDocId = $state<string | null>(null);
  let tagInputValue = $state('');

  function startTagEdit(docId: string, e: MouseEvent) {
    e.stopPropagation();
    tagEditingDocId = docId;
    tagInputValue = '';
  }

  function commitTag(docId: string) {
    if (tagInputValue.trim()) {
      tagStore.add(docId, tagInputValue.trim());
    }
    tagEditingDocId = null;
    tagInputValue = '';
  }

  function onTagInputKeydown(e: KeyboardEvent, docId: string) {
    if (e.key === 'Enter') { e.preventDefault(); commitTag(docId); }
    if (e.key === 'Escape') { tagEditingDocId = null; tagInputValue = ''; }
  }

  function focusTagInput(node: HTMLElement) { node.focus(); }

  // Arrow-key navigation within the list
  let focusedIndex = $state(-1);

  function onListKeydown(e: KeyboardEvent) {
    if (filteredDocuments.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, filteredDocuments.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      onSelect?.(filteredDocuments[focusedIndex].id);
    }
  }

  // Track which doc is being renamed
  let editingId = $state<string | null>(null);
  let editingTitle = $state('');

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function startEdit(doc: DocumentItem, e: MouseEvent) {
    e.stopPropagation();
    editingId = doc.id;
    editingTitle = doc.title;
  }

  function commitEdit(id: string) {
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== documents.find(d => d.id === id)?.title) {
      onRename?.(id, trimmed);
    }
    editingId = null;
  }

  function onTitleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(id); }
    if (e.key === 'Escape') { editingId = null; }
  }

  function handleDelete(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (confirm('Delete this document?')) {
      onDelete?.(id);
    }
  }

  // Focus input when entering edit mode — using attachment (Svelte 5)
  function focusOnMount(node: HTMLElement) {
    node.focus();
  }

  // ── Context menu ──────────────────────────────────────────────────────────
  let menuOpenId = $state<string | null>(null);
  let menuRef = $state<HTMLElement | null>(null);

  function openMenu(id: string, e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    menuOpenId = menuOpenId === id ? null : id;
  }

  function closeMenu() { menuOpenId = null; }

  function menuRename(doc: DocumentItem, e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    closeMenu();
    editingId = doc.id;
    editingTitle = doc.title;
  }

  function menuDuplicate(id: string, e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    closeMenu();
    onDuplicate?.(id);
  }

  function menuDelete(id: string, e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    closeMenu();
    if (confirm('Delete this document?')) onDelete?.(id);
  }

  // Close menu on outside click
  $effect(() => {
    if (!menuOpenId) return;
    function onOutside(e: MouseEvent) {
      if (menuRef && !menuRef.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  });

  // ── Bulk select ───────────────────────────────────────────────────────────
  let bulkMode = $state(false);
  let selectedIds = $state<Set<string>>(new Set());

  let selectedCount = $derived(selectedIds.size);
  let allSelected = $derived(
    filteredDocuments.length > 0 && filteredDocuments.every(d => selectedIds.has(d.id))
  );

  function toggleBulkMode() {
    bulkMode = !bulkMode;
    if (!bulkMode) selectedIds = new Set();
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    selectedIds = next;
  }

  function toggleSelectAll() {
    if (allSelected) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(filteredDocuments.map(d => d.id));
    }
  }

  function confirmBulkDelete() {
    if (selectedCount === 0) return;
    if (confirm(`Delete ${selectedCount} document${selectedCount > 1 ? 's' : ''}?`)) {
      onBulkDelete?.([...selectedIds]);
      selectedIds = new Set();
      bulkMode = false;
    }
  }
</script>

<aside class="doc-list" aria-label="Document list">
  <div class="doc-list-header">
    <span class="doc-list-title">Documents</span>
    {#if bulkMode}
      <button
        class="btn-select-all"
        type="button"
        onclick={toggleSelectAll}
        aria-label={allSelected ? 'Deselect all' : 'Select all'}
        title={allSelected ? 'Deselect all' : 'Select all'}
      >{allSelected ? '☑' : '☐'}</button>
      {#if selectedCount > 0}
        <button
          class="btn-bulk-delete"
          type="button"
          onclick={confirmBulkDelete}
          aria-label="Delete selected documents"
        >Delete ({selectedCount})</button>
      {/if}
      <button class="btn-bulk-cancel" type="button" onclick={toggleBulkMode} aria-label="Cancel selection">✕</button>
    {:else}
      <button class="btn-bulk-mode" type="button" onclick={toggleBulkMode} aria-label="Select documents" title="Select multiple">☐</button>
      <button class="btn-new-doc" type="button" onclick={onNew} aria-label="New document">＋</button>
    {/if}
  </div>

  <div class="doc-search-row">
    <input
      class="doc-search-input"
      type="search"
      placeholder="Filter…"
      aria-label="Filter documents"
      bind:value={searchQuery}
    />
    {#if searchQuery}
      <button
        class="btn-search-clear"
        type="button"
        aria-label="Clear filter"
        onclick={() => { searchQuery = ''; focusedIndex = -1; }}
      >✕</button>
    {/if}
  </div>

  {#if allDocTags.length > 0}
    <div class="tag-filter-bar" aria-label="Filter by tag">
      {#each allDocTags as tag}
        <button
          type="button"
          class={['tag-filter-chip', activeTagFilter === tag && 'tag-filter-chip--active'].filter(Boolean).join(' ')}
          onclick={() => { activeTagFilter = activeTagFilter === tag ? null : tag; }}
          aria-pressed={activeTagFilter === tag}
        >{tag}</button>
      {/each}
      {#if activeTagFilter}
        <button
          type="button"
          class="btn-tag-filter-clear"
          aria-label="Clear tag filter"
          onclick={() => { activeTagFilter = null; }}
        >✕</button>
      {/if}
    </div>
  {/if}

  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <ul class="doc-list-items" role="listbox" aria-label="Documents" onkeydown={onListKeydown}>
    {#if loading}
      {#each [1, 2, 3] as _}
        <li class="doc-skeleton" aria-hidden="true">
          <div class="skeleton-title"></div>
          <div class="skeleton-date"></div>
        </li>
      {/each}
    {:else if filteredDocuments.length === 0}
      <li class="doc-empty">
        {#if searchQuery}
          <span>No results for "{searchQuery}"</span>
          <button type="button" class="btn-empty-new" onclick={() => { searchQuery = ''; }}>Clear filter</button>
        {:else}
          <span>No documents yet.</span>
          <button type="button" class="btn-empty-new" onclick={onNew}>Create one →</button>
        {/if}
      </li>
    {:else}
      {#each filteredDocuments as doc, i (doc.id)}
      <li class={['doc-list-item', bulkMode && selectedIds.has(doc.id) && 'doc-list-item--selected'].filter(Boolean).join(' ')}>
        {#if bulkMode}
          <input
            class="doc-checkbox"
            type="checkbox"
            checked={selectedIds.has(doc.id)}
            onchange={() => toggleSelect(doc.id)}
            aria-label="Select {doc.title}"
            onclick={(e) => e.stopPropagation()}
          />
        {/if}
        <div
          class={['doc-item', doc.id === activeId && 'active', i === focusedIndex && 'focused'].filter(Boolean).join(' ')}
          role="option"
          tabindex="0"
          onclick={() => { focusedIndex = i; if (bulkMode) { toggleSelect(doc.id); } else { onSelect?.(doc.id); } }}
          onkeydown={(e) => e.key === 'Enter' && (focusedIndex = i, bulkMode ? toggleSelect(doc.id) : onSelect?.(doc.id))}
          aria-selected={doc.id === activeId}          aria-current={doc.id === activeId}        >
          {#if editingId === doc.id}
            <input
              class="doc-title-input"
              type="text"
              bind:value={editingTitle}
              onblur={() => commitEdit(doc.id)}
              onkeydown={(e) => onTitleKeydown(e, doc.id)}
              onclick={(e) => e.stopPropagation()}
              aria-label="Document title"
              {@attach focusOnMount}
            />
          {:else}
            <div class="doc-title-row">
            {#if doc.role && doc.role !== 'owner'}
              <span class="doc-shared-badge" data-testid="shared-badge-{doc.id}" title="Shared with you ({doc.role})">Shared</span>
            {/if}
            <span
              class="doc-title"
              role="button"
              tabindex="-1"
              aria-label="Rename {doc.title}"
              ondblclick={(e) => startEdit(doc, e)}
            >{doc.title}</span>
            {#if presenceStore.getActiveCount(doc.id) > 0}
              <span
                class={['doc-activity-badge', presenceStore.getActivityBadge(doc.id).color === 'green' && 'badge-green', presenceStore.getActivityBadge(doc.id).color === 'blue' && 'badge-blue', presenceStore.getActivityBadge(doc.id).color === 'red' && 'badge-red'].filter(Boolean).join(' ')}
                title="{presenceStore.getActiveCount(doc.id)} people viewing"
              >{presenceStore.getActiveCount(doc.id)}</span>
            {/if}
            </div>
          {/if}
          <span class="doc-meta">
            <span class="doc-date">{formatDate(doc.updated_at)}</span>
            <!-- Context menu trigger -->
            <div class="doc-menu-wrap" bind:this={menus[doc.id]}>
              <button
                class="btn-doc-menu"
                type="button"
                aria-label="More actions for {doc.title}"
                aria-expanded={menuOpenId === doc.id}
                aria-haspopup="menu"
                onclick={(e) => openMenu(doc.id, e)}
              >⋯</button>
              {#if menuOpenId === doc.id}
                <ul class="doc-context-menu" role="menu" aria-label="Document actions">
                  <li role="none">
                    <button role="menuitem" type="button" onclick={(e) => menuRename(doc, e)}>Rename</button>
                  </li>
                  <li role="none">
                    <button role="menuitem" type="button" onclick={(e) => menuDuplicate(doc.id, e)}>Duplicate</button>
                  </li>
                  <li role="none">
                    <button role="menuitem" type="button" class="menu-item-danger" onclick={(e) => menuDelete(doc.id, e)}>Delete</button>
                  </li>
                </ul>
              {/if}
            </div>
          </span>
          <div class="doc-tags" onclick={(e) => e.stopPropagation()}>
            {#each tagStore.get(doc.id) as tag}
              <span class="doc-tag-chip">
                {tag}
                <button
                  type="button"
                  class="btn-tag-remove"
                  aria-label="Remove tag {tag}"
                  onclick={(e) => { e.stopPropagation(); tagStore.remove(doc.id, tag); }}
                >×</button>
              </span>
            {/each}
            {#if tagStore.get(doc.id).length < 5}
              {#if tagEditingDocId === doc.id}
                <input
                  class="tag-input"
                  type="text"
                  placeholder="tag…"
                  bind:value={tagInputValue}
                  onblur={() => commitTag(doc.id)}
                  onkeydown={(e) => onTagInputKeydown(e, doc.id)}
                  onclick={(e) => e.stopPropagation()}
                  aria-label="Add tag"
                  {@attach focusTagInput}
                />
              {:else}
                <button
                  type="button"
                  class="btn-tag-add"
                  aria-label="Add tag to {doc.title}"
                  onclick={(e) => startTagEdit(doc.id, e)}
                >＋</button>
              {/if}
            {/if}
          </div>
        </div>
      </li>
    {/each}
    {/if}
  </ul>
</aside>

<style>
  .doc-title-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
    flex: 1;
  }

  .doc-shared-badge {
    font-size: 0.65rem;
    padding: 0.1rem 0.35rem;
    border-radius: 0.2rem;
    background: #bee3f8;
    color: #2b6cb0;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .doc-list {
    display: flex;
    flex-direction: column;
    width: 14rem;
    border-right: 1px solid var(--color-border, #e0e0e0);
    height: 100%;
    background: var(--color-surface, #f9f9f9);
    flex-shrink: 0;
  }

  .doc-list-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem 0.5rem;
    gap: 0.5rem;
  }

  .doc-search-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.75rem 0.5rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .doc-search-input {
    flex: 1;
    font-size: 0.8rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.3rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-background, #fff);
    color: var(--color-text, #1a1a1a);
    outline: none;
    min-width: 0;
  }

  .doc-search-input:focus {
    border-color: var(--color-primary, #646cff);
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.15);
  }

  /* Hide browser's native clear button — we provide our own */
  .doc-search-input::-webkit-search-cancel-button { display: none; }

  .btn-search-clear {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.7rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.2rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .btn-search-clear:hover { color: var(--color-text, #1a1a1a); }

  .doc-item.focused {
    outline: 2px solid var(--color-primary, #646cff);
    outline-offset: -2px;
  }

  .doc-list-title {
    flex: 1;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted, #9ca3af);
  }

  .btn-new-doc {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--color-primary, #646cff);
    padding: 0.1rem 0.25rem;
    line-height: 1;
  }

  .doc-list-items {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    overflow-y: auto;
    flex: 1;
  }

  .doc-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    gap: 0.15rem;
    transition: background 0.1s;
  }

  .doc-item:hover { background: var(--color-hover, #f0f0f0); }
  .doc-item.active { background: var(--color-primary-light, #ebebff); }

  .doc-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text, #1a1a1a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-title-input {
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid var(--color-primary, #646cff);
    border-radius: 3px;
    padding: 0.1rem 0.25rem;
    width: 100%;
    background: #fff;
    outline: none;
  }

  .doc-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
  }

  .doc-date {
    font-size: 0.7rem;
    color: var(--color-text-muted, #9ca3af);
  }

  /* ── Bulk mode ── */
  .doc-list-item {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .doc-list-item--selected .doc-item {
    background: var(--color-primary-light, #ebebff);
  }

  .doc-checkbox {
    margin-top: 0.6rem;
    margin-left: 0.5rem;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--color-primary, #646cff);
    width: 1rem;
    height: 1rem;
  }

  .btn-bulk-mode {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.2rem;
    line-height: 1;
  }

  .btn-bulk-mode:hover { color: var(--color-text, #1a1a1a); }

  .btn-select-all {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-primary, #646cff);
    padding: 0.1rem 0.2rem;
    line-height: 1;
  }

  .btn-bulk-delete {
    font-size: 0.7rem;
    padding: 0.2rem 0.45rem;
    border-radius: 0.25rem;
    border: 1px solid #ef4444;
    background: none;
    color: #ef4444;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .btn-bulk-delete:hover { background: #ef4444; color: #fff; }

  .btn-bulk-cancel {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.2rem;
    line-height: 1;
  }

  /* ── Context menu ── */
  .doc-menu-wrap {
    position: relative;
    display: inline-flex;
  }

  .btn-doc-menu {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0 0.15rem;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    color: var(--color-text-muted, #9ca3af);
    letter-spacing: 0.05em;
  }

  .doc-item:hover .btn-doc-menu,
  .doc-item.active .btn-doc-menu,
  .btn-doc-menu[aria-expanded="true"] {
    opacity: 1;
  }

  .btn-doc-menu:hover { color: var(--color-text, #1a1a1a); }

  .doc-context-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 2px);
    z-index: 100;
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.35rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    list-style: none;
    margin: 0;
    padding: 0.25rem 0;
    min-width: 8rem;
    white-space: nowrap;
  }

  .doc-context-menu button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.35rem 0.85rem;
    font-size: 0.82rem;
    cursor: pointer;
    color: var(--color-text, #1a1a1a);
  }

  .doc-context-menu button:hover {
    background: var(--color-hover, #f0f0f0);
  }

  .menu-item-danger { color: #ef4444 !important; }
  .menu-item-danger:hover { background: #fef2f2 !important; }

  /* Skeleton loader */
  .doc-skeleton {
    list-style: none;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .skeleton-title, .skeleton-date {
    border-radius: 4px;
    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .skeleton-title { height: 0.85rem; width: 70%; }
  .skeleton-date  { height: 0.65rem; width: 35%; }

  @keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  /* Empty state */
  .doc-empty {
    list-style: none;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    font-size: 0.85rem;
  }

  .btn-empty-new {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-primary, #646cff);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0;
  }

  .btn-empty-new:hover { text-decoration: underline; }

  /* ── Tag filter bar ── */
  .tag-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    padding: 0.35rem 0.75rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .tag-filter-chip {
    font-size: 0.68rem;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid var(--color-primary, #646cff);
    background: transparent;
    color: var(--color-primary, #646cff);
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .tag-filter-chip--active {
    background: var(--color-primary, #646cff);
    color: #fff;
  }

  .btn-tag-filter-clear {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.68rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.2rem;
    line-height: 1;
  }

  /* ── Document tag chips ── */
  .doc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.2rem;
    align-items: center;
  }

  .doc-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    font-size: 0.65rem;
    padding: 0.1rem 0.35rem;
    border-radius: 9999px;
    background: var(--color-primary-light, #ebebff);
    color: var(--color-primary, #646cff);
    font-weight: 500;
  }

  .btn-tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.65rem;
    color: var(--color-primary, #646cff);
    padding: 0;
    line-height: 1;
    opacity: 0.6;
  }

  .btn-tag-remove:hover { opacity: 1; }

  .btn-tag-add {
    background: none;
    border: 1px dashed var(--color-border, #d1d5db);
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.65rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.3rem;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.12s;
  }

  .doc-item:hover .btn-tag-add,
  .doc-item.active .btn-tag-add {
    opacity: 1;
  }

  .tag-input {
    font-size: 0.7rem;
    border: 1px solid var(--color-primary, #646cff);
    border-radius: 9999px;
    padding: 0.1rem 0.4rem;
    outline: none;
    width: 5rem;
    background: var(--color-background, #fff);
    color: var(--color-text, #1a1a1a);
  }

  .doc-activity-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.4rem;
    border-radius: 9999px;
    flex-shrink: 0;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    line-height: 1;
  }

  .doc-activity-badge.badge-green {
    background: #dcfce7;
    color: #166534;
  }

  .doc-activity-badge.badge-blue {
    background: #dbeafe;
    color: #1e40af;
  }

  .doc-activity-badge.badge-red {
    background: #fee2e2;
    color: #991b1b;
  }
</style>
