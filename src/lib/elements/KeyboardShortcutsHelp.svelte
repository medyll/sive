<!--
  KeyboardShortcutsHelp — modal overlay listing all keyboard shortcuts.
  Dismiss with Escape, clicking the backdrop, or the close button.
-->
<script lang="ts">
  interface Props {
    onClose?: () => void;
  }

  let { onClose }: Props = $props();

  const shortcuts: Array<{ keys: string; description: string }> = [
    { keys: 'Ctrl+S',         description: 'Save current document' },
    { keys: 'Ctrl+N',         description: 'New document' },
    { keys: 'Ctrl+B',         description: 'Toggle sidebar' },
    { keys: 'Ctrl+]',         description: 'Next document' },
    { keys: 'Ctrl+[',         description: 'Previous document' },
    { keys: 'Ctrl+Shift+F',   description: 'Toggle focus mode' },
    { keys: 'F11',            description: 'Toggle focus mode' },
    { keys: '?',              description: 'Show / hide this help' },
  ];

  function onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('shortcuts-backdrop')) {
      onClose?.();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="shortcuts-backdrop"
  role="presentation"
  onclick={onBackdropClick}
>
  <dialog
    class="shortcuts-dialog"
    open
    aria-modal="true"
    aria-label="Keyboard shortcuts"
  >
    <header class="shortcuts-header">
      <h2 class="shortcuts-title">Keyboard Shortcuts</h2>
      <button
        type="button"
        class="btn-close"
        aria-label="Close shortcuts help"
        onclick={onClose}
      >✕</button>
    </header>

    <table class="shortcuts-table">
      <thead>
        <tr>
          <th scope="col">Keys</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {#each shortcuts as { keys, description }}
          <tr>
            <td><kbd class="kbd">{keys}</kbd></td>
            <td class="shortcut-desc">{description}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </dialog>
</div>

<style>
  .shortcuts-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
  }

  .shortcuts-dialog {
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    padding: 1.5rem;
    min-width: 22rem;
    max-width: 32rem;
    width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  }

  .shortcuts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  .shortcuts-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text, #1a1a1a);
  }

  .btn-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.15rem 0.3rem;
    line-height: 1;
    border-radius: 0.25rem;
  }

  .btn-close:hover {
    color: var(--color-text, #1a1a1a);
    background: var(--color-hover, #f0f0f0);
  }

  .shortcuts-table {
    width: 100%;
    border-collapse: collapse;
  }

  .shortcuts-table thead th {
    text-align: left;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #9ca3af);
    padding: 0 0 0.5rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .shortcuts-table tbody tr {
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .shortcuts-table tbody tr:last-child {
    border-bottom: none;
  }

  .shortcuts-table td {
    padding: 0.5rem 0;
    vertical-align: middle;
  }

  .shortcuts-table td:first-child {
    width: 10rem;
  }

  .kbd {
    display: inline-block;
    font-family: ui-monospace, 'Cascadia Code', 'Fira Mono', monospace;
    font-size: 0.78rem;
    background: var(--color-surface, #f9f9f9);
    border: 1px solid var(--color-border, #e0e0e0);
    border-bottom-width: 2px;
    border-radius: 0.3rem;
    padding: 0.1rem 0.45rem;
    color: var(--color-text, #1a1a1a);
    white-space: nowrap;
  }

  .shortcut-desc {
    font-size: 0.875rem;
    color: var(--color-text, #1a1a1a);
    padding-left: 1rem;
  }
</style>
