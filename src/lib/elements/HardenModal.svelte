<script lang="ts">
  interface Props {
    onConfirm: (label: string, message: string) => void;
    onCancel: () => void;
  }

  let { onConfirm, onCancel }: Props = $props();

  let label = $state('');
  let message = $state('');

  function handleConfirm() {
    if (!label.trim()) return;
    onConfirm(label.trim(), message.trim());
  }
</script>

<div
  class="modal-backdrop"
  role="presentation"
  onclick={onCancel}
  onkeydown={(e) => { if (e.key === 'Escape') onCancel(); }}
>
  <div
    class="harden-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="harden-modal-title"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h2 id="harden-modal-title">💾 Create new version</h2>

    <label for="harden-label">Version label</label>
    <input
      id="harden-label"
      type="text"
      placeholder="e.g. end_act_1"
      bind:value={label}
      autocomplete="off"
    />

    <label for="harden-message">Description</label>
    <textarea
      id="harden-message"
      rows="3"
      placeholder="What changed in this version?"
      bind:value={message}
    ></textarea>

    <div class="modal-actions">
      <button type="button" class="btn-cancel" onclick={onCancel}>Cancel</button>
      <button
        type="button"
        class="btn-confirm"
        disabled={!label.trim()}
        onclick={handleConfirm}
      >Confirm</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }
  .harden-modal {
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    padding: 1.5rem;
    min-width: 24rem;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
  label { font-size: 0.85rem; font-weight: 500; margin-top: 0.25rem; }
  input, textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.4rem;
    font-size: 0.9rem;
    font-family: inherit;
    box-sizing: border-box;
  }
  textarea { resize: vertical; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }
  .btn-cancel {
    background: transparent;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.4rem;
    padding: 0.4rem 1rem;
    cursor: pointer;
  }
  .btn-confirm {
    background: var(--color-primary, #646cff);
    color: #fff;
    border: none;
    border-radius: 0.4rem;
    padding: 0.4rem 1rem;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
