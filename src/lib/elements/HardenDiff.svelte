<script lang="ts">
  import type { HardenSnapshot } from '$lib/harden.js';

  interface Props {
    snapshots: HardenSnapshot[];
  }

  let { snapshots }: Props = $props();

  let versionA = $state('');
  let versionB = $state('');
  let diffVisible = $state(false);

  const canLaunch = $derived(versionA !== '' && versionB !== '');
  const sameVersion = $derived(versionA !== '' && versionA === versionB);

  function launchDiff() {
    if (!canLaunch) return;
    diffVisible = true;
  }

  function snapshotLabel(snap: HardenSnapshot): string {
    const date = new Date(snap.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    return `${snap.label} (${date})`;
  }
</script>

<div class="harden-diff">
  <div class="diff-controls" role="group" aria-label="Diff controls">
    <span class="compare-label">Compare:</span>

    <select bind:value={versionA} aria-label="Version A">
      <option value="">— select —</option>
      {#each snapshots as snap (snap.id)}
        <option value={snap.id}>{snapshotLabel(snap)}</option>
      {/each}
    </select>

    <span class="divider" aria-hidden="true">↔</span>

    <select bind:value={versionB} aria-label="Version B">
      <option value="">— select —</option>
      {#each snapshots as snap (snap.id)}
        <option value={snap.id}>{snapshotLabel(snap)}</option>
      {/each}
    </select>

    <button
      type="button"
      class="btn-diff"
      disabled={!canLaunch}
      onclick={launchDiff}
    >View differences</button>
  </div>

  {#if diffVisible}
    <div class="diff-view" role="region" aria-label="Version diff">
      {#if sameVersion}
        <p class="no-diff">No differences — both versions are the same.</p>
      {:else}
        <div class="diff-columns">
          <div class="diff-col diff-col-a" aria-label="Version A text">
            <p class="diff-col-header">Version A</p>
            <p>The morning light filtered through the dusty shutters.
              <del>Marie stood motionless, her gaze fixed on the envelope.</del>
              Jean placed the letter on the table without a word.</p>
            <p><del>She had always known this moment would come.</del></p>
          </div>
          <div class="diff-col diff-col-b" aria-label="Version B text">
            <p class="diff-col-header">Version B</p>
            <p>The morning light filtered through the dusty shutters.
              <ins>Marie's hands trembled as she reached for the envelope.</ins>
              Jean placed the letter on the table without a word.</p>
            <p><ins>Three years of silence had led to this.</ins></p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .harden-diff {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }
  .diff-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .compare-label { font-size: 0.85rem; font-weight: 500; }
  .divider { font-size: 1rem; color: var(--color-text-muted, #888); }
  select {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.35rem;
    font-size: 0.85rem;
    background: var(--color-background, #fff);
  }
  .btn-diff {
    padding: 0.3rem 0.75rem;
    border: 1px solid var(--color-primary, #646cff);
    border-radius: 0.35rem;
    background: transparent;
    color: var(--color-primary, #646cff);
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-diff:disabled { opacity: 0.4; cursor: not-allowed; }
  .diff-view {
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    overflow: hidden;
  }
  .diff-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .diff-col {
    padding: 0.75rem;
    font-size: 0.82rem;
    line-height: 1.6;
  }
  .diff-col-a { border-right: 1px solid var(--color-border, #e0e0e0); }
  .diff-col-header { font-weight: 600; margin: 0 0 0.5rem; font-size: 0.8rem; color: var(--color-text-muted, #888); }
  del {
    background: #ffeaea;
    color: #c0392b;
    text-decoration: line-through;
    border-radius: 0.2rem;
    padding: 0 0.15rem;
  }
  ins {
    background: #eaffea;
    color: #27ae60;
    text-decoration: none;
    border-radius: 0.2rem;
    padding: 0 0.15rem;
  }
  .no-diff {
    padding: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-text-muted, #888);
  }
</style>
