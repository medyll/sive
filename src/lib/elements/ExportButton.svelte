<!--
  ExportButton — exports active document as .md or .txt via client-side Blob download
-->
<script lang="ts">
  export interface ExportButtonProps {
    title?: string;
    content?: string;
  }

  let { title = 'document', content = '' }: ExportButtonProps = $props();

  let open = $state(false);

  function download(ext: 'md' | 'txt') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9_\-]/gi, '_') || 'document'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    open = false;
  }
</script>

<div class="export-wrap">
  <button
    type="button"
    class="btn-export"
    aria-label="Export document"
    aria-haspopup="true"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    ⬇ Export
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="export-backdrop"
      onclick={() => (open = false)}
      onkeydown={(e) => e.key === 'Escape' && (open = false)}
    ></div>
    <div class="export-menu" role="menu">
      <button role="menuitem" type="button" onclick={() => download('md')}>Markdown (.md)</button>
      <button role="menuitem" type="button" onclick={() => download('txt')}>Plain text (.txt)</button>
    </div>
  {/if}
</div>

<style>
  .export-wrap {
    position: relative;
    display: inline-flex;
  }

  .btn-export {
    padding: 0.35rem 0.65rem;
    font-size: 0.82rem;
    background: var(--color-surface, #f4f4f4);
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.375rem;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .btn-export:hover { background: var(--color-hover, #e9e9e9); }

  .export-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .export-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #fff;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.375rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    z-index: 101;
    min-width: 12rem;
    overflow: hidden;
  }

  .export-menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.55rem 1rem;
    font-size: 0.88rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text, #1a1a1a);
    transition: background 0.1s;
  }

  .export-menu button:hover { background: var(--color-hover, #f4f4f4); }
</style>
