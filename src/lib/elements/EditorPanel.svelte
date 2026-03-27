<!--
  EditorPanel — main text editor with auto-save support
  S73-02: Added ghost text integration (Tab to accept, Escape to dismiss)
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import SelectionToolbar from './SelectionToolbar.svelte';
  import GhostText from './GhostText.svelte';
  import { ghostTextStore } from '$lib/ghostTextStore.svelte';

  export interface EditorPanelProps {
    documentId?: string;
    content?: string;
    onSave?: (id: string, content: string) => void;
    editable?: boolean;
    theme?: string;
    enableGhostText?: boolean;
  }

  let {
    documentId = '',
    content = $bindable(''),
    onSave,
    editable = true,
    theme = 'light',
    enableGhostText = true
  }: EditorPanelProps = $props();

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let ghostTextTimer: ReturnType<typeof setTimeout> | null = null;
  let lastSaved = $state<string | null>(null);
  let isDirty = $state(false);

  let selectionText = $state('');
  let toolbarX = $state(0);
  let toolbarY = $state(0);

  // Ghost text positioning
  let ghostTextX = $state(0);
  let ghostTextY = $state(0);

  function handleSelectionChange() {
    const sel = window.getSelection();
    const text = sel?.toString() ?? '';
    selectionText = text;
    if (text) {
      const range = sel!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      toolbarX = rect.left + rect.width / 2;
      toolbarY = rect.top;
    }
  }

  /** Count words — split on whitespace, filter empty tokens. */
  function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  let wordCount = $derived(countWords(content));
  let charCount = $derived(content.length);

  function handleInput(e: Event) {
    content = (e.target as HTMLTextAreaElement).value;
    isDirty = true;
    scheduleSave();
    
    // Trigger ghost text fetch with debounce
    if (enableGhostText) {
      scheduleGhostTextFetch();
    }
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

  function scheduleGhostTextFetch() {
    if (ghostTextTimer) clearTimeout(ghostTextTimer);
    ghostTextTimer = setTimeout(() => {
      fetchGhostText();
    }, 500); // 500ms debounce
  }

  async function fetchGhostText() {
    if (!content || content.length < 10) return; // Need some context
    
    try {
      const res = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content.slice(-100), // Last 100 chars
          context: content.slice(0, 500) // First 500 chars as context
        })
      });
      
      if (!res.ok) return;
      
      const data = await res.json();
      if (data.completion && data.completion.trim()) {
        // Calculate cursor position (end of content)
        const cursorPosition = content.length;
        ghostTextStore.show(data.completion.trim(), cursorPosition);
        
        // Calculate ghost text position (simplified - would need textarea ref for precise positioning)
        ghostTextX = 100; // Would calculate from textarea
        ghostTextY = 200;
      }
    } catch (err) {
      // Silently fail - ghost text is optional
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (ghostTextStore.isVisible) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const text = ghostTextStore.acceptNextWord();
        if (text) {
          // Insert accepted word at cursor
          const textarea = e.target as HTMLTextAreaElement;
          const pos = textarea.selectionStart || 0;
          content = content.slice(0, pos) + text + content.slice(pos);
          // Update cursor position
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = pos + text.length;
          }, 0);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        ghostTextStore.hide();
      }
    }
  }

  onDestroy(() => {
    if (saveTimer) clearTimeout(saveTimer);
    if (ghostTextTimer) clearTimeout(ghostTextTimer);
  });
</script>

<svelte:window onselectionchange={handleSelectionChange} />

{#if selectionText}
  <SelectionToolbar
    selection={selectionText}
    context={content}
    x={toolbarX}
    y={toolbarY}
    onDismiss={() => (selectionText = '')}
  />
{/if}

<div class="editor-wrap" data-theme={theme}>
  <div class="editor-status" aria-live="polite">
    <span class="word-count" aria-label="{wordCount} words, {charCount} characters">
      {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
    </span>
    {#if isDirty}
      <span class="status-saving">· Saving…</span>
    {:else if lastSaved}
      <span class="status-saved">· Saved at {lastSaved}</span>
    {/if}
  </div>
  <div class="editor-content" style="position: relative;">
    <textarea
      class="editor-textarea"
      aria-label="Document editor"
      value={content}
      oninput={handleInput}
      onkeydown={handleKeydown}
      readonly={!editable}
      placeholder="Start writing…"
    ></textarea>
    {#if enableGhostText}
      <GhostText {ghostTextX} {ghostTextY} />
    {/if}
  </div>
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

  .word-count    { color: var(--color-text-muted, #9ca3af); }
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
