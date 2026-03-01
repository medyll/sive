<!--
ReviewToolbar — top toolbar for Review Mode.
Props: scope ($bindable), analysisRunning, onRunAnalysis, onExitReview, onExport
-->
<script lang="ts">
  import Spinner from './Spinner.svelte';

  export type ReviewScope = 'selected passage' | 'current chapter' | 'entire volume';

  export interface ReviewToolbarProps {
    scope?: ReviewScope;
    analysisRunning?: boolean;
    onRunAnalysis?: () => void;
    onExitReview?: () => void;
    onExport?: () => void;
  }

  let {
    scope = $bindable<ReviewScope>('current chapter'),
    analysisRunning = false,
    onRunAnalysis,
    onExitReview,
    onExport
  }: ReviewToolbarProps = $props();
</script>

<div class="review-toolbar" role="toolbar" aria-label="Review Mode toolbar">
  <span class="review-label">Review Mode</span>

  <select
    class="scope-selector"
    value={scope}
    aria-label="Review scope"
    onchange={(e) => { scope = (e.currentTarget as HTMLSelectElement).value as ReviewScope; }}
  >
    <option value="selected passage">Selected passage</option>
    <option value="current chapter">Current chapter</option>
    <option value="entire volume">Entire volume</option>
  </select>

  <button
    type="button"
    class="btn-run"
    onclick={onRunAnalysis}
    disabled={analysisRunning}
    aria-busy={analysisRunning}
  >
    {#if analysisRunning}
      <Spinner size="small" />
      <span>Analysing…</span>
    {:else}
      Run analysis
    {/if}
  </button>

  <div class="spacer"></div>

  <button
    type="button"
    class="btn-export"
    onclick={onExport}
    aria-disabled="true"
  >
    Export report
  </button>

  <button
    type="button"
    class="btn-back"
    onclick={onExitReview}
  >
    ← Back to writing
  </button>
</div>

<style>
  .review-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    height: 3rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    background: var(--color-background, #fff);
    flex-shrink: 0;
  }

  .review-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-primary, #646cff);
    margin-right: 0.5rem;
  }

  .scope-selector {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.25rem;
    background: var(--color-background, #fff);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .spacer {
    flex: 1;
  }

  .btn-run,
  .btn-back,
  .btn-export {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    border: 1px solid var(--color-border, #e0e0e0);
    background: var(--color-background, #fff);
  }

  .btn-run {
    background: var(--color-primary, #646cff);
    color: #fff;
    border-color: var(--color-primary, #646cff);
  }

  .btn-run:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-export {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-back {
    font-weight: 500;
  }
</style>
