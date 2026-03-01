<!--
  DocumentList — sidebar listing user documents with create/switch support
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
  }

  let {
    documents = [],
    activeId = '',
    onSelect,
    onNew
  }: DocumentListProps = $props();

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        <button
          class="doc-item"
          class:active={doc.id === activeId}
          type="button"
          onclick={() => onSelect?.(doc.id)}
          aria-current={doc.id === activeId ? 'true' : undefined}
        >
          <span class="doc-title">{doc.title}</span>
          <span class="doc-date">{formatDate(doc.updated_at)}</span>
        </button>
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
    padding: 0.6rem 1rem;
    cursor: pointer;
    gap: 0.15rem;
    border-radius: 0;
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

  .doc-date {
    font-size: 0.7rem;
    color: var(--color-text-muted, #9ca3af);
  }
</style>
