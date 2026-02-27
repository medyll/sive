<script lang="ts">
  // Mockup: [main-screen]
  // bmad/references/PROJECT.md mockup sections implemented here (bracketed names):
  // [main-toolbar]  : fixed top toolbar
  // [main-body]     : resizable split body
  // [left-panel]    : LEFT PANEL — Editor
  // [editor-panel]  : main editor area inside the left panel
  // [resize-handle] : gutter between panes
  // [right-panel]   : RIGHT PANEL — AI & Tools (also [ai-panel])
  // [right-panel-tab-bar] : top tab bar inside right panel
  // [tab-content-suggestions] : Suggestions tab content (also coherence/style/history)
  // [ai-spinner]    : AI processing indicator shown in the right panel
  // [chat-bar]      : floating chat bar overlay
  // [suggestions-ready-badge] : badge shown in focus mode (not implemented in mock)
  // Minimal UI mockup for the application route based on bmad/references/PROJECT.md
  // - Left: editor area (resizable)
  // - Right: contextual tabs (Suggestions, Coherence, Style, History)
  // - Floating chat bar for voice/image uploads
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  // import theme styles from lib
  import '$lib/styles/theme.css';

  const selectedTab = writable<'suggestions' | 'coherence' | 'style' | 'history'>('suggestions');
  const ratio = writable(0.55); // default left/right ratio (0..1)
  const isProcessing = writable(false); // AI spinner
  const focusMode = writable(false); // when true, right panel is hidden and badge shown
  
  function onResizerKeyDown(e: KeyboardEvent) {
    const step = 0.05;
    if (e.key === 'ArrowLeft') {
      ratio.update(r => Math.max(0.15, r - step));
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      ratio.update(r => Math.min(0.85, r + step));
      e.preventDefault();
    }
  }

  let container: HTMLElement | null = null;
  let leftPane: HTMLElement | null = null;
  let rightPane: HTMLElement | null = null;
  let dragging = false;

  // reactive CSS percentages derived from ratio
  let leftPercent = '55%';
  let rightPercent = '45%';
  $: leftPercent = `${$ratio * 100}%`;
  $: rightPercent = `${(1 - $ratio) * 100}%`;

  // Simple drag handler to resize panes
  function onPointerDown(e: PointerEvent) {
    dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !container || !leftPane || !rightPane) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newRatio = Math.min(0.85, Math.max(0.15, x / rect.width));
    ratio.set(newRatio);
  }

  function onPointerUp(e: PointerEvent) {
    dragging = false;
  }

  // Demo triggers for spinner and tab auto-switch
  function triggerAnalysis() {
    isProcessing.set(true);
    // simulate AI processing
    setTimeout(() => {
      isProcessing.set(false);
      selectedTab.set('suggestions');
    }, 1400);
  }

  onMount(() => {
    window.addEventListener('pointermove', onPointerMove as any);
    window.addEventListener('pointerup', onPointerUp as any);
    return () => {
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp as any);
    };
  });
</script>

<style>
  /* Basic layout and visual style for the mockup */
  .app-container { height: calc(100vh - 48px); display:flex; flex-direction:column; }
  header { height:48px; display:flex; align-items:center; padding:0 16px; background:#0f172a; color:#fff; }
  .workspace { flex:1; display:flex; position:relative; overflow:hidden; }
  .pane { height:100%; overflow:auto; }
  .left { background: #0b1220; color: #e6eef8; padding:16px; }
  .editor { width:100%; height:100%; background:#071028; color:#d6e6ff; border:0; padding:12px; resize:none; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; font-size:14px; }
  .resizer { width:8px; cursor:col-resize; background:linear-gradient(90deg,#0f172a00,#0f172a33,#0f172a00); }
  .right { background:#ffffff; color:#0b1220; padding:12px; box-shadow: -4px 0 12px rgba(11,18,32,0.06); display:flex; flex-direction:column; }
  .tabs { display:flex; gap:8px; margin-bottom:8px; }
  .tab { padding:8px 12px; border-radius:6px; cursor:pointer; background:#f1f5f9; }
  .tab.active { background:#0b1220; color:#fff; }
  .tab-content { flex:1; overflow:auto; padding:8px; border-radius:6px; background:#fbfdff; }
  .spinner { position:absolute; right:20px; top:64px; display:flex; align-items:center; gap:8px; }
  .dot { width:10px; height:10px; border-radius:50%; background:#6366f1; animation:spin 1s linear infinite; }
  @keyframes spin { 0%{ transform:rotate(0)} 100%{transform:rotate(360deg)} }

  /* Floating chat bar */
  .chat-bar { position:fixed; left:50%; transform:translateX(-50%); bottom:24px; background:linear-gradient(180deg,#ffffff,#f8fafc); padding:10px 16px; border-radius:32px; box-shadow:0 10px 30px rgba(2,6,23,0.12); display:flex; gap:8px; align-items:center; }
  .chat-button { background:#0b1220; color:#fff; padding:8px 12px; border-radius:20px; cursor:pointer; }

  /* Suggestions-ready badge (shown in Focus mode) */
  .suggestions-ready-badge { position:fixed; right:28px; top:72px; background:#0b1220; color:#fff; padding:8px 12px; border-radius:999px; display:flex; gap:8px; align-items:center; box-shadow:0 8px 20px rgba(2,6,23,0.18); z-index:80; }
  .suggestions-ready-badge .badge-dot { width:10px; height:10px; background:#34d399; border-radius:50%; display:inline-block; }
  .suggestions-ready-badge .badge-text { font-size:13px; color:#e6eef8; }

  /* compact helper */
  .meta { font-size:12px; color:#64748b; }
</style>

<div class="app-container app-theme theme-dark">
  <header>
    <div style="flex:1">AI-Assisted Writer — Mockup</div>
    <div style="display:flex; gap:8px; align-items:center;">
      <button class="chat-button" on:click={() => focusMode.update(v => !v)}>{ $focusMode ? 'Exit Focus' : 'Focus' }</button>
      <div class="meta">Focus mode: F11 • Ratio persisted per profile (mock)</div>
    </div>
  </header>

  <!-- [main-body] -->
  <div bind:this={container} class="workspace">
    <!-- left pane -->
    <!-- [left-panel] LEFT PANEL — Editor -->
    <div id="editor-panel" bind:this={leftPane} class="pane left" style="width: {$focusMode ? '100%' : leftPercent};">
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <button class="chat-button" on:click={triggerAnalysis}>Run Analysis</button>
        <div class="meta">Editor — resizable (drag the gutter)</div>
      </div>
      <!-- [editor-panel] -->
      <textarea class="editor" placeholder="Start writing...\n\nThis area represents the main editor. Selection-based actions and 'Analyse this passage' would be available in the real app."></textarea>
    </div>

    <!-- resizer -->
    <!-- [resize-handle] -->
    <button
      class="resizer"
      type="button"
      aria-controls="editor-panel ai-panel"
      aria-label="Resize panels"
      on:pointerdown={onPointerDown}
      on:keydown={onResizerKeyDown}
      style="width:8px;"
    ></button>

    <!-- right pane -->
    <!-- [right-panel] RIGHT PANEL — AI & Tools (also [ai-panel]) -->
    {#if !$focusMode}
      <div id="ai-panel" bind:this={rightPane} class="pane right" style="width: {rightPercent}; min-width:280px;">
      <!-- [right-panel-tab-bar] -->
      <div class="tabs" role="tablist" aria-label="AI tools tabs">
        <button class="tab" type="button" role="tab" aria-selected={$selectedTab === 'suggestions'} class:active={$selectedTab === 'suggestions'} on:click={() => selectedTab.set('suggestions')}>Suggestions</button>
        <button class="tab" type="button" role="tab" aria-selected={$selectedTab === 'coherence'} class:active={$selectedTab === 'coherence'} on:click={() => selectedTab.set('coherence')}>Coherence</button>
        <button class="tab" type="button" role="tab" aria-selected={$selectedTab === 'style'} class:active={$selectedTab === 'style'} on:click={() => selectedTab.set('style')}>Style</button>
        <button class="tab" type="button" role="tab" aria-selected={$selectedTab === 'history'} class:active={$selectedTab === 'history'} on:click={() => selectedTab.set('history')}>History</button>
      </div>

      <!-- [tab-content-suggestions|coherence|style|history] -->
      <div class="tab-content">
        {#if $selectedTab === 'suggestions'}
          <h3>AI Suggestions</h3>
          <p class="meta">Diff-based proposals, inline accept/ignore controls (mock).</p>
          <ul>
            <li><strong>Replace:</strong> "grey Peugeot" → "grey Peugeot 308"</li>
            <li><strong>Insert:</strong> Add a sensory detail in second paragraph.</li>
          </ul>
        {:else if $selectedTab === 'coherence'}
          <h3>Coherence</h3>
          <p class="meta">Physical logic and consistency signals with confidence values.</p>
          <ul>
            <li>Travel time mismatch — <strong>High</strong></li>
            <li>Seasonal clothing inconsistency — <strong>Medium</strong></li>
          </ul>
        {:else if $selectedTab === 'style'}
          <h3>Style</h3>
          <p class="meta">Tone sliders, tics detection and flow metrics (mock).</p>
          <div>Rhythm: <progress value="70" max="100"></progress></div>
        {:else}
          <h3>History</h3>
          <p class="meta">Snapshots and navigation timeline.</p>
          <ol>
            <li>Draft — 2026-02-25 14:32</li>
            <li>After coherence pass — 2026-02-25 14:35</li>
          </ol>
        {/if}
      </div>
      </div>
    {/if}

    <!-- AI spinner indicator ([ai-spinner]) -->
    <!-- [ai-spinner] -->
    {#if $isProcessing}
      <div class="spinner" role="status" aria-live="polite">
        <div class="dot" aria-hidden="true"></div>
        <div class="meta">AI processing…</div>
      </div>
    {/if}
  </div>

  <!-- Floating chat bar for voice commands & uploads -->
  <!-- [chat-bar] -->
  <div class="chat-bar">
    <button class="chat-button">🎤 Voice</button>
    <button class="chat-button">📷 Upload</button>
    <div class="meta">Press to speak or attach images (LiveKit integration in full app)</div>
  </div>

  <!-- [suggestions-ready-badge] : shown when focus mode is active (mock) -->
  {#if $focusMode}
    <div class="suggestions-ready-badge" role="status" aria-live="polite">
      <span class="badge-dot" aria-hidden="true"></span>
      <span class="badge-text">Suggestions ready</span>
    </div>
  {/if}
</div>


