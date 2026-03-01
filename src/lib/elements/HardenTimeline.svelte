<script lang="ts">
  import type { HardenSnapshot } from '$lib/harden.js';

  interface Props {
    snapshots: HardenSnapshot[];
    selectedId?: string;
    onSelectVersion: (id: string) => void;
  }

  let { snapshots, selectedId, onSelectVersion }: Props = $props();

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function truncate(text: string, max = 40): string {
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }
</script>

<div class="harden-timeline" role="list" aria-label="Version history">
  {#if snapshots.length === 0}
    <p class="empty-state">No versions yet. Use 💾 New version to create one.</p>
  {:else}
    {#each snapshots as snap (snap.id)}
      <button
        class="timeline-point"
        class:selected={snap.id === selectedId}
        type="button"
        aria-current={snap.id === selectedId ? 'true' : undefined}
        onclick={() => onSelectVersion(snap.id)}
      >
        <span class="point-marker" aria-hidden="true"></span>
        <span class="point-content">
          <span class="point-label">{snap.label}</span>
          <span class="point-date">{formatDate(snap.timestamp)}</span>
          <span class="point-message">{truncate(snap.message)}</span>
        </span>
      </button>
    {/each}
  {/if}
</div>

<style>
  .harden-timeline {
    display: flex;
    flex-direction: row;
    gap: 0;
    overflow-x: auto;
    padding: 1rem 0.5rem;
    position: relative;
  }
  .harden-timeline::before {
    content: '';
    position: absolute;
    top: 1.75rem;
    left: 0.5rem;
    right: 0.5rem;
    height: 2px;
    background: var(--color-border, #e0e0e0);
    z-index: 0;
  }
  .timeline-point {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    min-width: 8rem;
    cursor: pointer;
    position: relative;
    z-index: 1;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
  }
  .point-marker {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-border, #e0e0e0);
    border: 2px solid var(--color-background, #fff);
    box-shadow: 0 0 0 2px var(--color-border, #e0e0e0);
    flex-shrink: 0;
  }
  .selected .point-marker {
    background: var(--color-primary, #646cff);
    box-shadow: 0 0 0 2px var(--color-primary, #646cff);
  }
  .point-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    text-align: center;
  }
  .point-label {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--color-text, #222);
  }
  .selected .point-label { color: var(--color-primary, #646cff); }
  .point-date { font-size: 0.7rem; color: var(--color-text-muted, #888); }
  .point-message {
    font-size: 0.7rem;
    color: var(--color-text-muted, #888);
    max-width: 7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .empty-state { font-size: 0.85rem; color: var(--color-text-muted, #888); padding: 0.5rem; }
  .timeline-point:focus-visible .point-marker {
    outline: 2px solid var(--color-primary, #646cff);
    outline-offset: 2px;
  }
</style>
