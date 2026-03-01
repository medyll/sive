<!--
  DocumentList — sidebar listing user documents with create/switch/rename/delete support
-->
<script lang="ts">
  export interface DocumentItem {
    id: string;
    title: string;
    updated_at: number;
  }

  export interface DocumentListProps {
    documents?: DocumentItem[];
    activeId?: string;
    onSelect?: (id: string) => void;
    onNew?: () => void;
    onRename?: (id: string, title: string) => void;
    onDelete?: (id: string) => void;
  }

  let {
    documents = [],
    activeId = '',
    onSelect,
    onNew,
    onRename,
    onDelete
  }: DocumentListProps = $props();

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

  <ul class="doc-list-items" role="list">
    {#each documents as doc (doc.id)}
      <li>
        <div
          class="doc-item"
          class:active={doc.id === activeId}
          role="button"
          tabindex="0"
          onclick={() => onSelect?.(doc.id)}
          onkeydown={(e) => e.key === 'Enter' && onSelect?.(doc.id)}
          aria-current={doc.id === activeId ? 'true' : undefined}
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
            <span
              class="doc-title"
              role="button"
              tabindex="-1"
              aria-label="Rename {doc.title}"
              ondblclick={(e) => startEdit(doc, e)}
            >{doc.title}</span>
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
  </ul>
</aside>

<style>
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
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    gap: 0.5rem;
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
</style>
