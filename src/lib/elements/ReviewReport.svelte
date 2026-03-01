<!--
ReviewReport — structured audit report with 7 sections.
Props: report (null = placeholder)
-->
<script lang="ts">
  // ─── Types ────────────────────────────────────────────────────────────────
  export interface ReportInconsistency { entity: string; description: string; confidence: number; }
  export interface ReportPov           { location: string; detected_deviation: string; }
  export interface ReportThread        { thread_id: string; status: string; note: string; }
  export interface ReportMotif         { motif_id: string; presence: string; consistency: string; }
  export interface ReportVoice         { character_id: string; register_deviation: string; example: string; }
  export interface ReportStyle         { signal_type: string; location: string; suggestion: string; }

  export interface ReviewReportData {
    inconsistencies: ReportInconsistency[];
    pov: ReportPov[];
    threads: ReportThread[];
    motifs: ReportMotif[];
    voices: ReportVoice[];
    style: ReportStyle[];
  }

  export interface ReviewReportProps {
    report?: ReviewReportData | null;
  }

  // ─── Stub data ────────────────────────────────────────────────────────────
  const STUB_REPORT: ReviewReportData = {
    inconsistencies: [
      { entity: 'Marie', description: 'Eye colour stated as blue (ch.1) but grey here', confidence: 0.87 },
      { entity: 'Briefcase', description: 'Left at the office in ch.2, present in this scene', confidence: 0.73 }
    ],
    pov: [
      { location: 'Para. 3, sentence 2', detected_deviation: 'Internal thought attributed to Marie while POV is Martin' }
    ],
    threads: [
      { thread_id: 'jean-martin-conflict', status: 'unresolved', note: 'Introduced ch.1, no progression since ch.3' },
      { thread_id: 'the-report', status: 'active', note: 'Appears here for the first time' }
    ],
    motifs: [
      { motif_id: 'light-and-shadow', presence: 'strong', consistency: 'consistent' },
      { motif_id: 'silence', presence: 'moderate', consistency: 'drifting — overused in last 3 scenes' }
    ],
    voices: [
      { character_id: 'Marie', register_deviation: 'Formal register shift', example: '"The report is ready" — too neutral vs established voice' }
    ],
    style: [
      { signal_type: 'Sentence length', location: 'Para. 2', suggestion: '4 consecutive short sentences — consider varying rhythm' },
      { signal_type: 'Passive voice', location: 'Para. 3, sentence 4', suggestion: 'Rewrite as active for stronger impact' }
    ]
  };

  let { report = STUB_REPORT }: ReviewReportProps = $props();
</script>

<div class="review-report" aria-label="Audit report">
  {#if report === null}
    <div class="placeholder">
      <p>Run analysis to generate the report.</p>
    </div>
  {:else}

    <!-- Inconsistencies -->
    <section class="report-section" aria-labelledby="sec-inconsistencies">
      <h3 id="sec-inconsistencies">Inconsistencies</h3>
      {#each report.inconsistencies as item}
        <article class="report-item" role="article">
          <strong>{item.entity}</strong>
          <span class="badge-confidence">{Math.round(item.confidence * 100)}%</span>
          <p>{item.description}</p>
        </article>
      {/each}
    </section>

    <!-- Point of View -->
    <section class="report-section" aria-labelledby="sec-pov">
      <h3 id="sec-pov">Point of View</h3>
      {#each report.pov as item}
        <article class="report-item" role="article">
          <strong>{item.location}</strong>
          <p>{item.detected_deviation}</p>
        </article>
      {/each}
    </section>

    <!-- Narrative Threads -->
    <section class="report-section" aria-labelledby="sec-threads">
      <h3 id="sec-threads">Narrative Threads</h3>
      {#each report.threads as item}
        <article class="report-item" role="article">
          <strong>{item.thread_id}</strong>
          <span class="thread-status status--{item.status}">{item.status}</span>
          <p>{item.note}</p>
        </article>
      {/each}
    </section>

    <!-- Tension Curve -->
    <section class="report-section" aria-labelledby="sec-tension">
      <h3 id="sec-tension">Tension Curve</h3>
      <div
        class="chart-stub"
        role="img"
        aria-label="Tension curve chart — visualisation coming in a later sprint"
      >
        <span>📈 Tension curve — chart integration pending</span>
      </div>
    </section>

    <!-- Themes & Motifs -->
    <section class="report-section" aria-labelledby="sec-motifs">
      <h3 id="sec-motifs">Themes &amp; Motifs</h3>
      {#each report.motifs as item}
        <article class="report-item" role="article">
          <strong>{item.motif_id}</strong>
          <span class="badge-presence">{item.presence}</span>
          <p>{item.consistency}</p>
        </article>
      {/each}
    </section>

    <!-- Character Voices -->
    <section class="report-section" aria-labelledby="sec-voices">
      <h3 id="sec-voices">Character Voices</h3>
      {#each report.voices as item}
        <article class="report-item" role="article">
          <strong>{item.character_id}</strong>
          <p>{item.register_deviation}</p>
          <blockquote class="voice-example">"{item.example}"</blockquote>
        </article>
      {/each}
    </section>

    <!-- Style & Rhythm -->
    <section class="report-section" aria-labelledby="sec-style">
      <h3 id="sec-style">Style &amp; Rhythm</h3>
      {#each report.style as item}
        <article class="report-item" role="article">
          <strong>{item.signal_type}</strong>
          <span class="item-location">{item.location}</span>
          <p>{item.suggestion}</p>
        </article>
      {/each}
    </section>

  {/if}
</div>

<style>
  .review-report {
    height: 100%;
    overflow-y: auto;
    background: var(--color-background, #fafafa);
    padding: 1rem;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-muted, #888);
    font-style: italic;
  }

  .report-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .report-section:last-child {
    border-bottom: none;
  }

  h3 {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #888);
    margin: 0 0 0.5rem 0;
  }

  .report-item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    margin-bottom: 0.4rem;
    font-size: 0.875rem;
  }

  .report-item strong {
    font-weight: 600;
  }

  .report-item p {
    margin: 0;
    width: 100%;
    color: var(--color-text, #333);
  }

  .badge-confidence,
  .badge-presence,
  .thread-status,
  .item-location {
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    background: var(--color-border, #e0e0e0);
    color: var(--color-text, #333);
    font-weight: 500;
  }

  .status--unresolved { background: rgba(255, 150, 50, 0.2); color: #b35900; }
  .status--active     { background: rgba(100, 108, 255, 0.15); color: #3a3fb5; }
  .status--resolved   { background: rgba(50, 200, 100, 0.2); color: #1a7a40; }

  .chart-stub {
    padding: 1.5rem;
    text-align: center;
    background: var(--color-background, #fff);
    border: 1px dashed var(--color-border, #ccc);
    border-radius: 0.25rem;
    color: var(--color-text-muted, #888);
    font-size: 0.875rem;
  }

  .voice-example {
    margin: 0.25rem 0 0 0;
    padding-left: 0.75rem;
    border-left: 2px solid var(--color-primary, #646cff);
    font-style: italic;
    font-size: 0.8rem;
    color: var(--color-text-muted, #666);
    width: 100%;
  }
</style>
