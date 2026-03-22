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

  let menus = $state<Record<string, HTMLElement>>({}); // Store references by ID

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

<aside class="doc-list flex-shrink-0 w-56 bg-[var(--color-surface,#f9f9f9)] border-r border-[var(--color-border,#e0e0e0)] h-full flex flex-col" aria-label="Document list">
  <div class="doc-list-header flex items-center gap-2 px-3 py-2">
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

  <div class="doc-search-row flex items-center gap-2 px-3 pb-2 border-b">
    <input
      class="doc-search-input flex-1 text-sm border rounded px-2 py-1 bg-[var(--color-background,#fff)] text-[var(--color-text,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#646cff)]"
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
  <ul class="doc-list-items overflow-auto p-2 space-y-1" role="listbox" aria-label="Documents" onkeydown={onListKeydown}>
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
          class={['doc-item','px-3','py-2','rounded','flex','flex-col', doc.id === activeId && 'active', i === focusedIndex && 'focused'].filter(Boolean).join(' ')}
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
:root{
  --color-border:#e0e0e0;
  --color-surface:#f9f9f9;
  --color-background:#fff;
  --color-text:#1a1a1a;
  --color-text-muted:#9ca3af;
  --color-primary:#646cff;
  --color-primary-light:#ebebff;
  --color-hover:#f0f0f0;
}

/* Lightweight overrides kept for accessibility and small components */
.doc-title-row{display:flex;align-items:center;gap:0.35rem;min-width:0;flex:1}
.doc-shared-badge{font-size:0.65rem;padding:0.1rem 0.35rem;border-radius:0.2rem;background:#bee3f8;color:#2b6cb0;font-weight:600;flex-shrink:0;white-space:nowrap}

.doc-item.focused{outline:2px solid var(--color-primary);outline-offset:-2px}
.doc-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}

.doc-date,.doc-activity-badge{font-size:0.7rem;color:var(--color-text-muted)}
.doc-activity-badge{font-weight:600;padding:0.15rem 0.4rem;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;min-width:1.4rem}

/* Context menu */
.doc-context-menu{position:absolute;right:0;top:calc(100% + 2px);z-index:100;background:var(--color-background);border:1px solid var(--color-border);border-radius:0.35rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);list-style:none;margin:0;padding:0.25rem 0;min-width:8rem;white-space:nowrap}
.doc-context-menu button{display:block;width:100%;text-align:left;background:none;border:none;padding:0.35rem 0.85rem;font-size:0.82rem;cursor:pointer;color:var(--color-text)}
.menu-item-danger{color:#ef4444 !important}

/* Tags */
.tag-filter-bar,.doc-tags{display:flex;gap:0.3rem;flex-wrap:wrap;padding:0.35rem 0.75rem;border-bottom:1px solid var(--color-border)}
.doc-tag-chip{font-size:0.65rem;padding:0.1rem 0.35rem;border-radius:9999px;background:var(--color-primary-light);color:var(--color-primary);font-weight:500;display:inline-flex;align-items:center;gap:0.15rem}
.tag-input{font-size:0.7rem;border-radius:9999px;padding:0.1rem 0.4rem;background:var(--color-background);color:var(--color-text);border:1px solid transparent}

/* Skeleton */
.doc-skeleton .skeleton-title,.doc-skeleton .skeleton-date{border-radius:4px;background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
</style>
