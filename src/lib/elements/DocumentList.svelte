<!--
  DocumentList – sidebar listing user documents with create/switch/rename/delete support
-->
<script lang="ts">
  import { tagStore } from '$lib/tagStore.svelte.js';
  import { presenceStore } from '$lib/presenceStore.svelte';
  import Icon from './Icon.svelte';

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

  let menus = $state<Record<string, HTMLElement>>({});
  let searchQuery = $state('');
  let activeTagFilter = $state<string | null>(null);

  let filteredDocuments = $derived(
    documents.filter((d) => {
      const matchesSearch = searchQuery.trim() === '' || d.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesTag = activeTagFilter === null || tagStore.get(d.id).includes(activeTagFilter);
      return matchesSearch && matchesTag;
    })
  );

  let allDocTags = $derived([...new Set(documents.flatMap((d) => tagStore.get(d.id)))].sort());
  let tagEditingDocId = $state<string | null>(null);
  let tagInputValue = $state('');

  function startTagEdit(docId: string, e: MouseEvent) {
    e.stopPropagation();
    tagEditingDocId = docId;
    tagInputValue = '';
  }

  function commitTag(docId: string) {
    if (tagInputValue.trim()) tagStore.add(docId, tagInputValue.trim());
    tagEditingDocId = null;
    tagInputValue = '';
  }

  function onTagInputKeydown(e: KeyboardEvent, docId: string) {
    if (e.key === 'Enter') { e.preventDefault(); commitTag(docId); }
    if (e.key === 'Escape') { tagEditingDocId = null; tagInputValue = ''; }
  }

  function focusTagInput(node: HTMLElement) { node.focus(); }
  let focusedIndex = $state(-1);

  function onListKeydown(e: KeyboardEvent) {
    if (filteredDocuments.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); focusedIndex = Math.min(focusedIndex + 1, filteredDocuments.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusedIndex = Math.max(focusedIndex - 1, 0); }
    else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); onSelect?.(filteredDocuments[focusedIndex].id); }
  }

  let editingId = $state<string | null>(null);
  let editingTitle = $state('');

  function formatDate(ts: number) { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }

  function startEdit(doc: DocumentItem, e: MouseEvent) { e.stopPropagation(); editingId = doc.id; editingTitle = doc.title; }
  function commitEdit(id: string) {
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== documents.find(d => d.id === id)?.title) onRename?.(id, trimmed);
    editingId = null;
  }
  function onTitleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(id); }
    if (e.key === 'Escape') { editingId = null; }
  }
  function handleDelete(id: string, e: MouseEvent) { e.stopPropagation(); if (confirm('Delete this document?')) onDelete?.(id); }
  function focusOnMount(node: HTMLElement) { node.focus(); }

  let menuOpenId = $state<string | null>(null);
  let menuRef = $state<HTMLElement | null>(null);

  function openMenu(id: string, e: MouseEvent | KeyboardEvent) { e.stopPropagation(); menuOpenId = menuOpenId === id ? null : id; }
  function closeMenu() { menuOpenId = null; }
  function menuRename(doc: DocumentItem, e: MouseEvent | KeyboardEvent) { e.stopPropagation(); closeMenu(); editingId = doc.id; editingTitle = doc.title; }
  function menuDuplicate(id: string, e: MouseEvent | KeyboardEvent) { e.stopPropagation(); closeMenu(); onDuplicate?.(id); }
  function menuDelete(id: string, e: MouseEvent | KeyboardEvent) { e.stopPropagation(); closeMenu(); if (confirm('Delete this document?')) onDelete?.(id); }

  $effect(() => {
    if (!menuOpenId) return;
    function onOutside(e: MouseEvent) { if (menuRef && !menuRef.contains(e.target as Node)) closeMenu(); }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  });

  let bulkMode = $state(false);
  let selectedIds = $state<Set<string>>(new Set());
  let selectedCount = $derived(selectedIds.size);
  let allSelected = $derived(filteredDocuments.length > 0 && filteredDocuments.every(d => selectedIds.has(d.id)));

  function toggleBulkMode() { bulkMode = !bulkMode; if (!bulkMode) selectedIds = new Set(); }
  function toggleSelect(id: string) { const next = new Set(selectedIds); if (next.has(id)) next.delete(id); else next.add(id); selectedIds = next; }
  function toggleSelectAll() { if (allSelected) selectedIds = new Set(); else selectedIds = new Set(filteredDocuments.map(d => d.id)); }
  function confirmBulkDelete() { if (selectedCount === 0) return; if (confirm(`Delete ${selectedCount} document${selectedCount > 1 ? 's' : ''}?`)) { onBulkDelete?.([...selectedIds]); selectedIds = new Set(); bulkMode = false; } }
</script>

<aside class="doc-list" aria-label="Document list">
  <div class="doc-list-header">
    <span class="doc-list-title">Documents</span>
    {#if bulkMode}
      <button class="btn-select-all" type="button" onclick={toggleSelectAll} aria-label={allSelected ? 'Deselect all' : 'Select all'} title={allSelected ? 'Deselect all' : 'Select all'}>{allSelected ? '☑' : '☐'}</button>
      {#if selectedCount > 0}<button class="btn-bulk-delete" type="button" onclick={confirmBulkDelete} aria-label="Delete selected documents">Delete ({selectedCount})</button>{/if}
      <button class="btn-bulk-cancel" type="button" onclick={toggleBulkMode} aria-label="Cancel selection">❌</button>
    {:else}
      <button class="btn-bulk-mode" type="button" onclick={toggleBulkMode} aria-label="Select documents" title="Select multiple">☐</button>
      <button class="btn-new-doc" type="button" onclick={onNew} aria-label="New document">➕</button>
    {/if}
  </div>

  <div class="doc-search-row">
    <input class="doc-search-input" type="search" placeholder="Filter…" aria-label="Filter documents" bind:value={searchQuery} />
    {#if searchQuery}<button class="btn-search-clear" type="button" aria-label="Clear filter" onclick={() => { searchQuery = ''; focusedIndex = -1; }}><Icon type="close" size={16} /></button>{/if}
  </div>

  {#if allDocTags.length > 0}
    <div class="tag-filter-bar" aria-label="Filter by tag">
      {#each allDocTags as tag}
        <button type="button" class={['tag-filter-chip', activeTagFilter === tag && 'tag-filter-chip--active'].filter(Boolean).join(' ')} onclick={() => { activeTagFilter = activeTagFilter === tag ? null : tag; }} aria-pressed={activeTagFilter === tag}>{tag}</button>
      {/each}
      {#if activeTagFilter}<button type="button" class="btn-tag-filter-clear" aria-label="Clear tag filter" onclick={() => { activeTagFilter = null; }}><Icon type="close" size={14} /></button>{/if}
    </div>
  {/if}

  <ul class="doc-list-items" role="listbox" aria-label="Documents" onkeydown={onListKeydown}>
    {#if loading}
      {#each [1, 2, 3] as _}<li class="doc-skeleton" aria-hidden="true"><div class="skeleton-title"></div><div class="skeleton-date"></div></li>{/each}
    {:else if filteredDocuments.length === 0}
      <li class="doc-empty">
        {#if searchQuery}<span>No results for "{searchQuery}"</span><button type="button" class="btn-empty-new" onclick={() => { searchQuery = ''; }}>Clear filter</button>
        {:else}<span>No documents yet.</span><button type="button" class="btn-empty-new" onclick={onNew}>Create one →</button>{/if}
      </li>
    {:else}
      {#each filteredDocuments as doc, i (doc.id)}
      <li class={['doc-list-item', bulkMode && selectedIds.has(doc.id) && 'doc-list-item--selected'].filter(Boolean).join(' ')}>
        {#if bulkMode}<input class="doc-checkbox" type="checkbox" checked={selectedIds.has(doc.id)} onchange={() => toggleSelect(doc.id)} aria-label="Select {doc.title}" onclick={(e) => e.stopPropagation()}/>{/if}
        <div class={['doc-item', doc.id === activeId && 'active', i === focusedIndex && 'focused'].filter(Boolean).join(' ')} role="option" tabindex="0" onclick={() => { focusedIndex = i; if (bulkMode) { toggleSelect(doc.id); } else { onSelect?.(doc.id); } }} onkeydown={(e) => e.key === 'Enter' && (focusedIndex = i, bulkMode ? toggleSelect(doc.id) : onSelect?.(doc.id))} aria-selected={doc.id === activeId} aria-current={doc.id === activeId}>
          {#if editingId === doc.id}
            <input class="doc-title-input" type="text" bind:value={editingTitle} onblur={() => commitEdit(doc.id)} onkeydown={(e) => onTitleKeydown(e, doc.id)} onclick={(e) => e.stopPropagation()} aria-label="Document title" {@attach focusOnMount}/>
          {:else}
            <div class="doc-title-row">
              {#if doc.role && doc.role !== 'owner'}<span class="doc-shared-badge" data-testid="shared-badge-{doc.id}" title="Shared with you ({doc.role})">Shared</span>{/if}
              <span class="doc-title" role="button" tabindex="-1" aria-label="Rename {doc.title}" ondblclick={(e) => startEdit(doc, e)}>{doc.title}</span>
              {#if presenceStore.getActiveCount(doc.id) > 0}<span class={['doc-activity-badge', presenceStore.getActivityBadge(doc.id).color === 'green' && 'badge-green', presenceStore.getActivityBadge(doc.id).color === 'blue' && 'badge-blue', presenceStore.getActivityBadge(doc.id).color === 'red' && 'badge-red'].filter(Boolean).join(' ')} title="{presenceStore.getActiveCount(doc.id)} people viewing">{presenceStore.getActiveCount(doc.id)}</span>{/if}
            </div>
          {/if}
          <span class="doc-meta">
            <span class="doc-date">{formatDate(doc.updated_at)}</span>
            <div class="doc-menu-wrap" bind:this={menus[doc.id]}>
              <button class="btn-doc-menu" type="button" aria-label="More actions for {doc.title}" aria-expanded={menuOpenId === doc.id} aria-haspopup="menu" onclick={(e) => openMenu(doc.id, e)}><Icon type="more" size={16} /></button>
              {#if menuOpenId === doc.id}
                <ul class="doc-context-menu" role="menu" aria-label="Document actions">
                  <li role="none"><button role="menuitem" type="button" onclick={(e) => menuRename(doc, e)}>Rename</button></li>
                  <li role="none"><button role="menuitem" type="button" onclick={(e) => menuDuplicate(doc.id, e)}>Duplicate</button></li>
                  <li role="none"><button role="menuitem" type="button" class="menu-item-danger" onclick={(e) => menuDelete(doc.id, e)">Delete</button></li>
                </ul>
              {/if}
            </div>
          </span>
          <div class="doc-tags" role="button" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}>
            {#each tagStore.get(doc.id) as tag}<span class="doc-tag-chip">{tag}<button type="button" class="btn-tag-remove" aria-label="Remove tag {tag}" onclick={(e) => { e.stopPropagation(); tagStore.remove(doc.id, tag); }}"><Icon type="remove" size={10} /></button></span>{/each}
            {#if tagStore.get(doc.id).length < 5}
              {#if tagEditingDocId === doc.id}<input class="tag-input" type="text" placeholder="tag…" bind:value={tagInputValue} onblur={() => commitTag(doc.id)} onkeydown={(e) => onTagInputKeydown(e, doc.id)} onclick={(e) => e.stopPropagation()} aria-label="Add tag" {@attach focusTagInput}/>{:else}<button type="button" class="btn-tag-add" aria-label="Add tag to {doc.title}" onclick={(e) => startTagEdit(doc.id, e)}><Icon type="add" size={14} /></button>{/if}
            {/if}
          </div>
        </div>
      </li>
      {/each}
    {/if}
  </ul>
</aside>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  .doc-list {
    flex-shrink: 0;
    width: 14rem;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .doc-list-header {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    padding: var(--pad-sm) var(--pad-md);
    border-bottom: 1px solid var(--color-border);
  }

  .doc-list-title {
    flex: 1;
    font-weight: var(--font-semibold);
    color: var(--color-text);
  }

  .btn-select-all, .btn-bulk-mode, .btn-new-doc, .btn-bulk-cancel, .btn-bulk-delete {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-lg);
    color: var(--color-text);
    padding: var(--pad-xs);
    border-radius: var(--radius-sm);
    transition: var(--transition-fast);
  }

  .btn-select-all:hover, .btn-bulk-mode:hover, .btn-new-doc:hover, .btn-bulk-cancel:hover, .btn-bulk-delete:hover {
    background: var(--color-surface-hover);
  }

  .doc-search-row {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    padding: var(--pad-sm) var(--pad-md);
    border-bottom: 1px solid var(--color-border);
  }

  .doc-search-input {
    flex: 1;
    font-size: var(--text-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--pad-xs) var(--pad-sm);
    background: var(--color-surface);
    color: var(--color-text);
  }

  .doc-search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  .btn-search-clear, .btn-tag-filter-clear {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: var(--pad-xs);
    border-radius: var(--radius-sm);
  }

  .btn-search-clear:hover, .btn-tag-filter-clear:hover {
    background: var(--color-surface-hover);
  }

  .tag-filter-bar {
    display: flex;
    gap: var(--gap-sm);
    flex-wrap: wrap;
    padding: var(--pad-sm) var(--pad-md);
    border-bottom: 1px solid var(--color-border);
  }

  .tag-filter-chip {
    font-size: var(--text-xs);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-full);
    background: var(--color-surface-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .tag-filter-chip--active {
    background: var(--color-primary);
    color: var(--color-surface);
    border-color: var(--color-primary);
  }

  .doc-list-items {
    flex: 1;
    overflow: auto;
    padding: var(--pad-sm);
    list-style: none;
    margin: 0;
  }

  .doc-list-item { margin-bottom: var(--gap-xs); }
  .doc-list-item--selected { background: var(--color-surface-active); border-radius: var(--radius-md); }
  .doc-checkbox { margin-right: var(--gap-sm); }

  .doc-item {
    padding: var(--pad-sm) var(--pad-md);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .doc-item:hover { background: var(--color-surface-hover); }
  .doc-item.active { background: var(--color-surface-active); }
  .doc-item.focused { outline: 2px solid var(--color-primary); outline-offset: -2px; }

  .doc-title-row { display: flex; align-items: center; gap: var(--gap-sm); min-width: 0; flex: 1; }

  .doc-shared-badge {
    font-size: var(--text-xs);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--color-info) 20%, transparent);
    color: var(--color-info);
    font-weight: var(--font-semibold);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .doc-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: var(--font-medium); color: var(--color-text); flex: 1; }

  .doc-activity-badge {
    font-weight: var(--font-semibold);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    font-size: var(--text-xs);
  }

  .badge-green { background: var(--color-success); color: var(--color-surface); }
  .badge-blue { background: var(--color-info); color: var(--color-surface); }
  .badge-red { background: var(--color-critical); color: var(--color-surface); }

  .doc-meta { display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs); }
  .doc-date { color: var(--color-text-muted); }

  .btn-doc-menu {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: var(--pad-xs);
    border-radius: var(--radius-sm);
  }

  .btn-doc-menu:hover { background: var(--color-surface-hover); color: var(--color-text); }

  .doc-context-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 2px);
    z-index: var(--z-dropdown);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    list-style: none;
    margin: 0;
    padding: var(--pad-xs);
    min-width: 8rem;
    white-space: nowrap;
  }

  .doc-context-menu button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: var(--pad-sm) var(--pad-md);
    font-size: var(--text-sm);
    cursor: pointer;
    color: var(--color-text);
    border-radius: var(--radius-sm);
  }

  .doc-context-menu button:hover { background: var(--color-surface-hover); }
  .menu-item-danger { color: var(--color-critical) !important; }
  .menu-item-danger:hover { background: color-mix(in oklch, var(--color-critical) 10%, transparent) !important; }

  .doc-tags { display: flex; gap: var(--gap-xs); flex-wrap: wrap; }

  .doc-tag-chip {
    font-size: var(--text-xs);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-full);
    background: color-mix(in oklch, var(--color-primary) 15%, transparent);
    color: var(--color-primary);
    font-weight: var(--font-medium);
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .btn-tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-primary);
    padding: 0;
    display: inline-flex;
    align-items: center;
  }

  .btn-tag-remove:hover { color: var(--color-primary-hover); }

  .tag-input {
    font-size: var(--text-xs);
    border-radius: var(--radius-full);
    padding: var(--pad-xs) var(--pad-sm);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    min-width: 4rem;
  }

  .tag-input:focus { outline: none; border-color: var(--color-primary); }

  .btn-tag-add {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: var(--pad-xs);
    border-radius: var(--radius-full);
  }

  .btn-tag-add:hover { background: var(--color-surface-hover); color: var(--color-text); }

  .doc-title-input {
    width: 100%;
    font-size: var(--text-sm);
    padding: var(--pad-xs);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
  }

  .doc-title-input:focus { outline: none; }

  .doc-empty {
    padding: var(--pad-lg);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .btn-empty-new {
    display: block;
    margin: var(--pad-sm) auto 0;
    background: none;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--pad-sm) var(--pad-md);
    color: var(--color-text);
    cursor: pointer;
    font-size: var(--text-sm);
  }

  .btn-empty-new:hover { background: var(--color-surface-hover); border-color: var(--color-primary); }

  .doc-skeleton { padding: var(--pad-sm) var(--pad-md); }

  .skeleton-title, .skeleton-date {
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, var(--color-border) 25%, var(--color-surface-hover) 50%, var(--color-border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .skeleton-title { height: 1rem; margin-bottom: var(--gap-xs); }
  .skeleton-date { height: 0.75rem; width: 60%; }

  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
</style>
