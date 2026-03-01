<!--
  EditorPanel — main text editor with auto-save support
-->
<script lang="ts">
  import { onDestroy } from 'svelte';

  export interface EditorPanelProps {
    documentId?: string;
    content?: string;
    onSave?: (id: string, content: string) => void;
    editable?: boolean;
    theme?: string;
  }

  let {
    documentId = '',
    content = $bindable(''),
    onSave,
    editable = true,
    theme = 'light'
  }: EditorPanelProps = $props();

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let lastSaved = $state<string | null>(null);
  let isDirty = $state(false);

  function handleInput(e: Event) {
    content = (e.target as HTMLTextAreaElement).value;
    isDirty = true;
    scheduleSave();
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (documentId && onSave) {
        onSave(documentId, content);
        lastSaved = new Date().toLocaleTimeString();
        isDirty = false;
      }
    }, 2000);
  }

  onDestroy(() => {
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<div class="editor-wrap" data-theme={theme}>
  <div class="editor-status" aria-live="polite">
    {#if isDirty}
      <span class="status-saving">Saving…</span>
    {:else if lastSaved}
      <span class="status-saved">Saved at {lastSaved}</span>
    {/if}
  </div>
  <textarea
    class="editor-textarea"
    aria-label="Document editor"
    value={content}
    oninput={handleInput}
    readonly={!editable}
    placeholder="Start writing…"
  ></textarea>
</div>

<style>
  .editor-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background, #fff);
  }

  .editor-status {
    height: 1.5rem;
    padding: 0 1rem;
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .status-saving { color: #f97316; }
  .status-saved  { color: #22c55e; }

  .editor-textarea {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 1.5rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    line-height: 1.75;
    background: inherit;
    color: var(--color-text, #1a1a1a);
    box-sizing: border-box;
  }
</style>
