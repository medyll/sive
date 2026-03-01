<script lang="ts">
  import TabBar from './TabBar.svelte';
  import Spinner from './Spinner.svelte';
  import HardenTimeline from './HardenTimeline.svelte';
  import HardenDiff from './HardenDiff.svelte';
  import StyleSliders from './StyleSliders.svelte';
  import StyleSignal from './StyleSignal.svelte';
  import CoherenceAlert from './CoherenceAlert.svelte';
  import SuggestionItem from './SuggestionItem.svelte';
  import { hardenStore } from '$lib/hardenStore.svelte.js';
  import { styleStore } from '$lib/styleStore.svelte.js';
  import { STUB_ALERTS, type CoherenceAlertData } from '$lib/coherenceStore.svelte.js';
  import { STUB_SUGGESTIONS, suggestionsStore, type SuggestionData } from '$lib/suggestionsStore.svelte.js';

  export interface AIPanelProps {
    activeTab?: string;
    aiProcessing?: boolean;
    theme?: string;
    editorContent?: string;
  }

  const TABS = ['Suggestions', 'Coherence', 'Style', 'History'] as const;
  type Tab = (typeof TABS)[number];

  let {
    activeTab = $bindable<string>('Suggestions'),
    aiProcessing = false,
    theme = 'light',
    editorContent = ''
  }: AIPanelProps = $props();

  let selectedHardenId = $state<string | undefined>(undefined);

  interface StyleSignalData { location: string; signal: string; suggestion: string; }

  const STUB_SIGNALS: StyleSignalData[] = [
    { location: 'Para. 1', signal: 'Repetition',      suggestion: 'The word "shadow" appears 4 times. Consider varying with "silhouette" or "shade".' },
    { location: 'Para. 3', signal: 'Sentence length',  suggestion: 'Three consecutive short sentences disrupt the prose rhythm. Try merging the last two.' },
    { location: 'Para. 5', signal: 'Lexical density',  suggestion: 'High nominal density slows reading pace. Break into two sentences with a transitional verb.' }
  ];

  let analysing = $state(false);
  let signals = $state<StyleSignalData[]>([]);

  let checking = $state(false);
  let coherenceAlerts = $state<CoherenceAlertData[]>([]);

  let suggesting = $state(false);

  async function handleAnalyse() {
    analysing = true;
    signals = [];
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'style', content: editorContent })
      });
      const data = await res.json();
      signals = data.signals ?? STUB_SIGNALS;
    } catch {
      signals = STUB_SIGNALS;
    } finally {
      analysing = false;
    }
  }

  async function handleCoherenceCheck() {
    checking = true;
    coherenceAlerts = [];
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'coherence', content: editorContent })
      });
      const data = await res.json();
      coherenceAlerts = data.alerts ?? STUB_ALERTS;
    } catch {
      coherenceAlerts = STUB_ALERTS;
    } finally {
      checking = false;
    }
  }

  async function handleGenerateSuggestions() {
    suggesting = true;
    suggestionsStore.setItems([]);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestions', content: editorContent })
      });
      const data = await res.json();
      suggestionsStore.setItems(data.suggestions ?? STUB_SUGGESTIONS);
    } catch {
      suggestionsStore.setItems(STUB_SUGGESTIONS);
    } finally {
      suggesting = false;
    }
  }
</script>

<div class="ai-panel" data-theme={theme}>
  <TabBar
    tabs={[...TABS]}
    {activeTab}
    onChange={(tab) => { activeTab = tab; }}
  />

  {#if aiProcessing}
    <div class="spinner-row" aria-live="polite" aria-label="AI processing">
      <Spinner size="small" data-testid="ai-spinner" />
    </div>
  {/if}

  <div class="tab-content">
    {#if activeTab === 'Suggestions'}
      <div id="tab-content-suggestions" class="tab-pane" role="tabpanel" aria-label="Suggestions">
        <div class="analyse-bar">
          <button
            type="button"
            class="btn-suggest"
            onclick={handleGenerateSuggestions}
            disabled={suggesting}
          >
            {suggesting ? 'Generating…' : 'Generate suggestions'}
          </button>
        </div>
        {#if suggestionsStore.items.length > 0}
          <div class="suggestions-list" aria-label="AI suggestions">
            {#each suggestionsStore.items as s (s.id)}
              <SuggestionItem
                suggestion={s}
                onAccept={(id) => suggestionsStore.accept(id)}
                onReject={(id)  => suggestionsStore.reject(id)}
              />
            {/each}
          </div>
          <div class="accept-all-bar">
            <button
              type="button"
              class="btn-accept-all"
              onclick={() => suggestionsStore.acceptAll()}
            >Accept all</button>
          </div>
        {:else if !suggesting}
          <p class="tab-empty">Click "Generate suggestions" to analyse your text.</p>
        {/if}
      </div>
    {:else if activeTab === 'Coherence'}
      <div id="tab-content-coherence" class="tab-pane" role="tabpanel" aria-label="Coherence">
        <div class="analyse-bar">
          <button
            type="button"
            class="btn-coherence"
            onclick={handleCoherenceCheck}
            disabled={checking}
          >
            {checking ? 'Checking…' : 'Run coherence check'}
          </button>
        </div>
        {#if coherenceAlerts.length > 0}
          <div class="coherence-results" aria-label="Coherence alerts">
            {#each coherenceAlerts as alert (alert.entity + alert.discrepancy_type)}
              <CoherenceAlert
                entity={alert.entity}
                discrepancy_type={alert.discrepancy_type}
                confidence={alert.confidence}
                note={alert.note}
              />
            {/each}
          </div>
        {:else if !checking}
          <p class="tab-empty">Click "Run coherence check" to detect inconsistencies.</p>
        {/if}
      </div>
    {:else if activeTab === 'Style'}
      <div id="tab-content-style" class="tab-pane" role="tabpanel" aria-label="Style">
        <StyleSliders
          values={styleStore.values}
          onChange={(key, value) => styleStore.set(key, value)}
        />
        <div class="analyse-bar">
          <button
            type="button"
            class="btn-analyse"
            onclick={handleAnalyse}
            disabled={analysing}
          >
            {analysing ? 'Analysing…' : 'Analyse this passage'}
          </button>
        </div>
        {#if signals.length > 0}
          <div class="style-results" aria-label="Style analysis results">
            {#each signals as s (s.location + s.signal)}
              <StyleSignal location={s.location} signal={s.signal} suggestion={s.suggestion} />
            {/each}
          </div>
        {:else if !analysing}
          <p class="tab-empty">Click "Analyse this passage" to get style feedback.</p>
        {/if}
      </div>
    {:else if activeTab === 'History'}
      <div id="tab-content-history" class="tab-pane" role="tabpanel" aria-label="History">
        <HardenTimeline
          snapshots={hardenStore.snapshots}
          selectedId={selectedHardenId}
          onSelectVersion={(id) => { selectedHardenId = id; }}
        />
        <HardenDiff snapshots={hardenStore.snapshots} />
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-left: 1px solid var(--color-border, #e0e0e0);
    background-color: var(--color-background, #fff);
  }

  .spinner-row {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .tab-pane {
    color: var(--color-text, #333);
  }

  .tab-empty {
    text-align: center;
    color: var(--color-text-muted, #9ca3af);
    font-size: 0.82rem;
    margin: 1.5rem 0;
  }

  .analyse-bar {
    margin: 1rem 0 0.75rem;
  }

  .btn-analyse,
  .btn-coherence {
    width: 100%;
    padding: 0.5rem 1rem;
    background: var(--color-primary, #6366f1);
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-analyse:disabled,
  .btn-coherence:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .style-results {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .coherence-results {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .accept-all-bar {
    margin-top: 0.75rem;
    display: flex;
    justify-content: flex-end;
  }

  .btn-suggest,
  .btn-accept-all {
    width: 100%;
    padding: 0.5rem 1rem;
    background: var(--color-primary, #6366f1);
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-accept-all {
    width: auto;
    background: #16a34a;
    padding: 0.35rem 1rem;
  }

  .btn-suggest:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
</style>