<!--
ReviewScreen — orchestrates ReviewToolbar + ReviewText + ReviewReport.
Props: onExitReview
-->
<script lang="ts">
  import ReviewToolbar, { type ReviewScope } from './ReviewToolbar.svelte';
  import ReviewText, { type Highlight } from './ReviewText.svelte';
  import ReviewReport from './ReviewReport.svelte';

  export interface ReviewScreenProps {
    onExitReview?: () => void;
  }

  let { onExitReview }: ReviewScreenProps = $props();

  let scope = $state<ReviewScope>('current chapter');
  let analysisRunning = $state(false);

  // Stub highlights wired to the stub text in ReviewText
  const STUB_HIGHLIGHTS: Highlight[] = [
    { id: 'h1', start: 0,   end: 95,  category: 'inconsistency' },
    { id: 'h2', start: 294, end: 350, category: 'pov' },
    { id: 'h3', start: 510, end: 565, category: 'style' }
  ];

  function handleRunAnalysis() {
    analysisRunning = true;
    // Stub: simulate a 2s analysis delay
    setTimeout(() => { analysisRunning = false; }, 2000);
  }

  function handleHighlightClick(highlight: Highlight) {
    // TODO: scroll to corresponding report item in Sprint 4+
    console.log('[review] highlight clicked:', highlight.id, highlight.category);
  }
</script>

<div class="review-screen">
  <ReviewToolbar
    bind:scope
    {analysisRunning}
    onRunAnalysis={handleRunAnalysis}
    {onExitReview}
    onExport={() => console.log('[review] export requested')}
  />

  <div class="review-body">
    <div class="review-text-panel">
      <ReviewText
        highlights={STUB_HIGHLIGHTS}
        onHighlightClick={handleHighlightClick}
      />
    </div>

    <div class="review-report-panel">
      <ReviewReport />
    </div>
  </div>
</div>

<style>
  .review-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .review-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .review-text-panel {
    width: 55%;
    height: 100%;
    overflow: hidden;
  }

  .review-report-panel {
    width: 45%;
    height: 100%;
    overflow: hidden;
  }
</style>
