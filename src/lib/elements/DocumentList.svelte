<!--
  DocumentList — sidebar listing user documents with create/switch/rename/delete support
-->
<script lang="ts">
  export interface DocumentItem {
    id: string;
    title: string;
    updated_at: number;
    role?: string;
  }

  export interface DocumentListProps {
    documents?: DocumentItem[];
    activeId?: string;
    loading?: boolean;
    onSelect?: (id: string) => void;
    onNew?: () => void;
    onRename?: (id: string, title: string) => void;
    onDelete?: (id: string) => void;
  }

  let {
    documents = [],
    activeId = '',
    loading = false,
    onSelect,
    onNew,
    onRename,
    onDelete
  }: DocumentListProps = $props();

  // Search / filter
  let searchQuery = $state('');
  let filteredDocuments = $derived(
    searchQuery.trim() === ''
      ? documents
      : documents.filter((d) =>
          d.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
  );

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
</script>

<aside class="doc-list" aria-label="Document list">
  <div class="doc-list-header">
    <span class="doc-list-title">Documents</span>
    <button class="btn-new-doc" type="button" onclick={onNew} aria-label="New document">＋</button>
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
      <li>
        <div
          class="doc-item"
          class:active={doc.id === activeId}
          class:focused={i === focusedIndex}
          role="option"
          tabindex="0"
          onclick={() => { focusedIndex = i; onSelect?.(doc.id); }}
          onkeydown={(e) => e.key === 'Enter' && (focusedIndex = i, onSelect?.(doc.id))}
          aria-selected={doc.id === activeId}
        >
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
            </div>
          {/if}
          <span class="doc-meta">
            <span class="doc-date">{formatDate(doc.updated_at)}</span>
            <button
              class="btn-delete-doc"
              type="button"
              aria-label="Delete {doc.title}"
              onclick={(e) => handleDelete(doc.id, e)}
            >🗑</button>
          </span>
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

  .btn-delete-doc {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
  }

  .doc-item:hover .btn-delete-doc,
  .doc-item.active .btn-delete-doc {
    opacity: 0.5;
  }

  .btn-delete-doc:hover { opacity: 1 !important; }

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
</style>
