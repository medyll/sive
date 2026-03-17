<!--
  ConflictIndicator — shows who last edited the document and warns if multiple users are editing
-->
<script lang="ts">
  interface Props {
    lastEditorName?: string;
    lastEditTime?: number;
    activeEditors?: string[];
    showWarning?: boolean;
  }

  let { lastEditorName, lastEditTime, activeEditors = [], showWarning = false }: Props = $props();

  function formatTime(ts: number | undefined): string {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString();
  }
</script>

{#if showWarning && activeEditors.length > 1}
  <div class="conflict-warning" role="alert" aria-live="polite">
    <span class="warning-icon">⚠</span>
    <span class="warning-text">
      {activeEditors.length} people are editing. Save frequently to avoid conflicts.
    </span>
  </div>
{/if}

{#if lastEditorName && lastEditTime}
  <div class="last-editor-info">
    <span class="editor-label">Last edit:</span>
    <span class="editor-name">{lastEditorName}</span>
    <span class="editor-time">{formatTime(lastEditTime)}</span>
  </div>
{/if}

<style>
  .conflict-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #fef3c7;
    border-left: 3px solid #f59e0b;
    font-size: 0.8rem;
    color: #92400e;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .warning-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .warning-text {
    flex: 1;
  }

  .last-editor-info {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.25rem 0.5rem;
  }

  .editor-label {
    font-weight: 600;
  }

  .editor-name {
    color: var(--color-primary, #646cff);
    font-weight: 500;
  }

  .editor-time {
    opacity: 0.8;
  }
</style>
